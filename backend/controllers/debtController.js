const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

/**
 * Υπολογίζει τα καθαρά χρέη μεταξύ μελών μιας ομάδας.
 * Αλγόριθμος:
 *   1. Για κάθε expense, ο payer πληρώνει για τους άλλους.
 *      Άρα κάθε split-user χρωστάει amountOwed στον payer.
 *   2. Χτίζουμε πίνακα balance[userId]: θετικό = πρέπει να εισπράξει,
 *      αρνητικό = πρέπει να πληρώσει.
 *   3. Αφαιρούμε τα ήδη καταγεγραμμένα settlements.
 *   4. Greedy minimize-transactions για να δούμε ποιος χρωστάει ποιον.
 */
const calculateDebts = async (req, res) => {
  try {
    const { groupId } = req.params;

    // --- 1. Φόρτωσε όλα τα expenses της ομάδας ---
    const expenses = await Expense.find({ group: groupId, status: { $ne: 'failed' } })
      .populate('payer', 'name email')
      .populate('splits.user', 'name email');

    // --- 2. Χτίσε balance map ---
    // balance[userId] = net amount (+ = πρέπει να πάρει, - = πρέπει να δώσει)
    const balance = {}; // { userId: { name, amount } }

    const ensureUser = (id, name) => {
      if (!balance[id]) balance[id] = { name, amount: 0 };
    };

    for (const expense of expenses) {
      if (!expense.payer?._id) continue;
      const payerId = expense.payer._id.toString();
      const payerName = expense.payer.name;
      ensureUser(payerId, payerName);

      for (const split of expense.splits) {
        if (!split.user?._id) continue;
        const splitUserId = split.user._id.toString();
        const splitUserName = split.user.name;
        ensureUser(splitUserId, splitUserName);

        // Ο split user χρωστάει amountOwed στον payer
        // → payer balance +amountOwed, split user balance -amountOwed
        balance[payerId].amount += split.amountOwed;
        balance[splitUserId].amount -= split.amountOwed;
      }
    }

    // --- 3. Αφαίρεσε τα settlements ---
    const settlements = await Settlement.find({ group: groupId })
      .populate('payer', 'name')
      .populate('payee', 'name');

    for (const s of settlements) {
      if (!s.payer?._id || !s.payee?._id) continue;
      const payerId = s.payer._id.toString();
      const payeeId = s.payee._id.toString();
      ensureUser(payerId, s.payer.name);
      ensureUser(payeeId, s.payee.name);

      // Ο payer πλήρωσε amount → balance του +amount, balance του payee -amount
      balance[payerId].amount += s.amount;
      balance[payeeId].amount -= s.amount;
    }

    // --- 4. Minimize transactions (greedy) ---
    // Χωρίζουμε σε creditors (πρέπει να πάρουν) και debtors (πρέπει να δώσουν)
    const creditors = []; // { id, name, amount }
    const debtors = [];   // { id, name, amount }

    for (const [id, { name, amount }] of Object.entries(balance)) {
      const rounded = Math.round(amount * 100) / 100;
      if (rounded > 0.01) creditors.push({ id, name, amount: rounded });
      else if (rounded < -0.01) debtors.push({ id, name, amount: -rounded }); // θετικό
    }

    // Ταξινόμηση φθίνουσα για καλύτερο matching
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions = [];

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const credit = creditors[i];
      const debt = debtors[j];
      const amount = Math.min(credit.amount, debt.amount);
      const rounded = Math.round(amount * 100) / 100;

      if (rounded > 0.01) {
        transactions.push({
          from: { id: debt.id, name: debt.name },   // ο χρεώστης
          to: { id: credit.id, name: credit.name }, // ο δανειστής
          amount: rounded,
        });
      }

      credit.amount -= amount;
      debt.amount -= amount;

      if (credit.amount < 0.01) i++;
      if (debt.amount < 0.01) j++;
    }

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error calculating debts' });
  }
};

/**
 * Καταγράφει ότι ο logged-in χρήστης εξόφλησε ένα ποσό σε κάποιον άλλον.
 */
const recordSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { payeeId, amount, expenseId } = req.body;

    if (!payeeId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'payeeId and a positive amount are required' });
    }

    const settlement = await Settlement.create({
      group: groupId,
      payer: req.user._id,   // ο logged-in χρήστης πλήρωσε
      payee: payeeId,
      amount: Math.round(Number(amount) * 100) / 100,
      expense: expenseId || undefined,
    });

    if (expenseId) {
      const expense = await Expense.findById(expenseId);

      if (expense && expense.group.toString() === groupId.toString()) {
        const currentUserId = req.user._id.toString();

        const split = expense.splits.find(
          (s) => s.user && s.user.toString() === currentUserId
        );

        if (split) {
          const nextSettled = Math.min(
            Number(split.amountOwed || 0),
            Number(split.settledAmount || 0) + Number(amount)
          );
          split.settledAmount = Math.round(nextSettled * 100) / 100;

          const unsettledSplits = expense.splits.filter((s) => {
            const isPayerSplit = expense.payer && s.user && s.user.toString() === expense.payer.toString();
            if (isPayerSplit) return false;
            return Number(s.settledAmount || 0) + 0.01 < Number(s.amountOwed || 0);
          });

          expense.status = unsettledSplits.length === 0 ? 'settled' : 'active';
          await expense.save();
        }
      }
    }

    const populated = await Settlement.findById(settlement._id)
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error recording settlement' });
  }
};

/**
 * Επιστρέφει ιστορικό settlements για ένα group.
 */
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const settlements = await Settlement.find({ group: groupId })
      .populate('payer', 'name email')
      .populate('payee', 'name email')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching settlements' });
  }
};

module.exports = { calculateDebts, recordSettlement, getGroupSettlements };

const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

/**
 * Calculate net debts between members of a group.
 * Algorithm:
 *   1. For each expense, the payer pays for the others.
 *      So each split-user owes amountOwed to the payer.
 *   2. Build balance map[userId]: positive = needs to receive,
 *      negative = needs to pay.
 *   3. Subtract already recorded settlements.
 *   4. Greedy minimize-transactions to see who owes whom.
 */
const calculateDebts = async (req, res) => {
  try {
    const { groupId } = req.params;

    // --- 1. Load all group expenses ---
    const expenses = await Expense.find({ group: groupId })
      .populate('payer', 'name email')
      .populate('splits.user', 'name email');

    // --- 2. Build balance map ---
    // balance[userId] = net amount (+ = needs to receive, - = needs to pay)
    const balance = {}; // { userId: { name, amount } }

    const ensureUser = (id, name) => {
      if (!balance[id]) balance[id] = { name, amount: 0 };
    };

    for (const expense of expenses) {
      const payerId = expense.payer._id.toString();
      const payerName = expense.payer.name;
      ensureUser(payerId, payerName);

      for (const split of expense.splits) {
        const splitUserId = split.user._id.toString();
        const splitUserName = split.user.name;
        ensureUser(splitUserId, splitUserName);

        // The split user owes amountOwed to the payer
        // → payer balance +amountOwed, split user balance -amountOwed
        balance[payerId].amount += split.amountOwed;
        balance[splitUserId].amount -= split.amountOwed;
      }
    }

    // --- 3. Subtract settlements ---
    const settlements = await Settlement.find({ group: groupId })
      .populate('payer', 'name')
      .populate('payee', 'name');

    for (const s of settlements) {
      const payerId = s.payer._id.toString();
      const payeeId = s.payee._id.toString();
      ensureUser(payerId, s.payer.name);
      ensureUser(payeeId, s.payee.name);

      // The payer paid amount -> their balance +amount, payee balance -amount
      balance[payerId].amount += s.amount;
      balance[payeeId].amount -= s.amount;
    }

    // --- 4. Minimize transactions (greedy) ---
    // Split into creditors (need to receive) and debtors (need to pay)
    const creditors = []; // { id, name, amount }
    const debtors = [];   // { id, name, amount }

    for (const [id, { name, amount }] of Object.entries(balance)) {
      const rounded = Math.round(amount * 100) / 100;
      if (rounded > 0.01) creditors.push({ id, name, amount: rounded });
      else if (rounded < -0.01) debtors.push({ id, name, amount: -rounded }); // positive
    }

    // Sort descending for better matching
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
          from: { id: debt.id, name: debt.name },   // the debtor
          to: { id: credit.id, name: credit.name }, // the creditor
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
 * Records that the logged-in user paid an amount to someone else.
 */
const recordSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { payeeId, amount } = req.body;

    if (!payeeId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'payeeId and a positive amount are required' });
    }

    const settlement = await Settlement.create({
      group: groupId,
      payer: req.user._id,   // the logged-in user paid
      payee: payeeId,
      amount: Math.round(Number(amount) * 100) / 100,
    });

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
 * Returns settlement history for a group.
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

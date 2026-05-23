const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const Group = require('../models/Group');

const createExpense = async (req, res) => {
  try {
    const {
  groupId,
  description,
  totalAmount,
  date,
  payer,
  splitMethod,
  amountPerMember,
  customSplits,
  percentageSplits,
  splits,
} = req.body;

    if (!groupId || !description || !totalAmount || !payer || !splits) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const expense = await Expense.create({
  group: groupId,
  description,
  totalAmount,
  date,
  payer,
  splitMethod,
  amountPerMember,
  customSplits,
  percentageSplits,
  splits,
});

try {
      // Βρίσκουμε το όνομα του group για να το βάλουμε στο μήνυμα
      const groupData = await Group.findById(groupId);
      const groupName = groupData ? groupData.name : 'Group';

      // Φιλτράρουμε τη λίστα splits ώστε να μην στείλουμε ειδοποίηση στον εαυτό μας (payer)
      // Στο splits, κάθε αντικείμενο έχει τη δομή { user: userId, amountOwed: X }
      const membersToNotify = splits.filter(
        (s) => s.user.toString() !== payer.toString()
      );

      // Δημιουργούμε τις ειδοποιήσεις για όλα τα υπόλοιπα μέλη παράλληλα
      const notifPromises = membersToNotify.map((member) => {
        return Notification.create({
          user: member.user,
          message: `Προστέθηκε νέο έξοδο "${description}" ύψους $${totalAmount} στην ομάδα ${groupName}.`,
          type: 'expense_added',
          relatedGroup: groupId
        });
      });

      await Promise.all(notifPromises);
    } catch (notifError) {
      // Αν για οποιοδήποτε λόγο αποτύχει η ειδοποίηση, κάνουμε console.log 
      // αλλά ΔΕΝ κρασάρουμε το request, ώστε ο χρήστης να αποθηκεύσει κανονικά το έξοδο.
      console.error("Error creating notifications for expense:", notifError);
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('payer', 'name email')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.description = req.body.description || expense.description;
    expense.totalAmount = req.body.totalAmount || expense.totalAmount;
    expense.date = req.body.date || expense.date;
    expense.splitMethod = req.body.splitMethod || expense.splitMethod;
    expense.amountPerMember = req.body.amountPerMember;
    expense.customSplits = req.body.customSplits;
    expense.percentageSplits = req.body.percentageSplits;
    expense.splits = req.body.splits || expense.splits;

    const updatedExpense = await expense.save();

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  createExpense,
  getGroupExpenses,
  deleteExpense,
  updateExpense,
};
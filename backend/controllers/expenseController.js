const Expense = require('../models/Expense');

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
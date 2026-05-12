const Expense = require('../models/Expense');

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { payer: req.user._id },
        { 'participants.user': req.user._id }
      ]
    })
      .populate('payer', 'name email')
      .populate('participants.user', 'name email')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenses,
};

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  splits: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      amountOwed: {
        type: Number,
        required: true,
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);

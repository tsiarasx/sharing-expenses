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
  date: {
    type: String,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  splitMethod: {
    type: String,
    enum: ['Equal Split', 'Exact Amounts', 'Percentages'],
    default: 'Equal Split',
  },
  amountPerMember: {
    type: Number,
  },
  customSplits: {
    type: Object,
    default: null,
  },
  percentageSplits: {
    type: Object,
    default: null,
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

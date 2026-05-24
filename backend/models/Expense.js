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
  status: {
    type: String,
    enum: ['active', 'settled', 'failed'],
    default: 'active',
  },
  failedReason: {
    type: String,
    default: null,
  },
  failedAt: {
    type: Date,
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
      },
      settledAmount: {
        type: Number,
        default: 0,
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);

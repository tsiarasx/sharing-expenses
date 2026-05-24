// ====== MERGE FIX START ======
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const createExpense = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

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

    if (
      !groupId ||
      !description ||
      !totalAmount ||
      !payer ||
      !Array.isArray(splits) ||
      splits.length === 0
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(payer)) {
      return res.status(400).json({ message: 'Invalid group or payer id' });
    }

    const hasInvalidSplit = splits.some(
      (split) =>
        !split ||
        !mongoose.Types.ObjectId.isValid(split.user) ||
        typeof split.amountOwed !== 'number' ||
        Number.isNaN(split.amountOwed)
    );

    if (hasInvalidSplit) {
      return res.status(400).json({ message: 'Invalid split data' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isAcceptedMember = group.members.some(
      (member) =>
        member.status === 'accepted' &&
        member.user &&
        member.user.toString() === req.user._id.toString()
    );

    if (!isAcceptedMember) {
      return res.status(403).json({ message: 'Not authorized to add expenses in this group' });
    }

    const acceptedMemberCount = group.members.filter(
      (member) => member?.status === 'accepted' && member?.user
    ).length;

    if (acceptedMemberCount < 2) {
      return res.status(400).json({
        message: 'You need at least one other accepted member in the group before adding an expense.',
      });
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
      splits: splits.map((split) => ({
        user: split.user,
        amountOwed: split.amountOwed,
        settledAmount: 0,
      })),
    });

    try {
      // Βρίσκουμε το όνομα του group για να το βάλουμε στο μήνυμα
      const groupData = await Group.findById(groupId);
      const groupName = groupData ? groupData.name : 'Group';

      // Φιλτράρουμε τη λίστα splits ώστε να μην στείλουμε ειδοποίηση στον εαυτό μας (payer)
      const membersToNotify = splits.filter(
        (s) => s.user.toString() !== payer.toString()
      );

      // Δημιουργούμε τις ειδοποιήσεις για όλα τα υπόλοιπα μέλη παράλληλα
      const notifPromises = membersToNotify.map((member) => {
        return Notification.create({
          user: member.user,
          message: `A new expense "${description}" of $${totalAmount} was added in group ${groupName}.`,
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
    console.error('createExpense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('payer', 'name email')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 });

    // Keep history visible and flag records impacted by deleted users as failed.
    const normalizedExpenses = expenses.map((expense) => {
      const raw = expense.toObject();
      const hasDeletedPayer = !raw.payer;
      const hasDeletedSplitUser = Array.isArray(raw.splits)
        ? raw.splits.some((split) => !split.user)
        : false;

      // Preserve explicit settled records even if a user account was later deleted.
      if (raw.status === 'settled') {
        return raw;
      }

      // Force failed only for non-settled expenses impacted by deleted participants.
      if (raw.status === 'failed' || hasDeletedPayer || hasDeletedSplitUser) {
        return {
          ...raw,
          status: 'failed',
          failedReason:
            raw.failedReason ||
            'This expense was marked as failed because a participant deleted their account.',
          failedAt: raw.failedAt || raw.updatedAt || raw.createdAt,
        };
      }

      return raw;
    });

    res.json(normalizedExpenses);
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
// ====== MERGE FIX END ======
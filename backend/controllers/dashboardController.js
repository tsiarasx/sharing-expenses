const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// GET /api/users/dashboard
// ─────────────────────────────────────────────
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all expenses where the user is involved:
    //   - as the payer, OR
    //   - as a participant in splits
    const expenses = await Expense.find({
      $or: [{ payer: userId }, { "splits.user": userId }],
    })
      .populate("payer", "name email")
      .populate("group", "name")
      .populate("splits.user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // ── A. totalSpending ──────────────────────────────
    // Sum of all expenses where this user paid
    const totalSpending = expenses
      .filter((e) => e.payer._id.toString() === userId.toString())
      .reduce((sum, e) => sum + e.totalAmount, 0);

    // ── B. youAreOwed ─────────────────────────────────
    // User is the payer; sum splits of OTHER users (exclude payer's own split)
    const youAreOwed = expenses
      .filter((e) => e.payer._id.toString() === userId.toString())
      .reduce((sum, e) => {
        const othersShare = e.splits
          .filter((s) => s.user._id.toString() !== userId.toString())
          .reduce((s2, s) => s2 + s.amountOwed, 0);
        return sum + othersShare;
      }, 0);

    // ── C. youOwe ─────────────────────────────────────
    // User appears in splits but did NOT pay
    const youOwe = expenses
      .filter((e) => e.payer._id.toString() !== userId.toString())
      .reduce((sum, e) => {
        const userSplit = e.splits.find(
          (s) => s.user._id.toString() === userId.toString()
        );
        return sum + (userSplit ? userSplit.amountOwed : 0);
      }, 0);

    // ── D. groupBalances ──────────────────────────────
    // Net balance per group: positive = owed money, negative = owes money
    const groupMap = {}; // groupId → { groupName, balance }

    for (const expense of expenses) {
      if (!expense.group) continue;
      const gid = expense.group._id.toString();

      if (!groupMap[gid]) {
        groupMap[gid] = { groupId: gid, groupName: expense.group.name, balance: 0 };
      }

      const isPayer = expense.payer._id.toString() === userId.toString();

      if (isPayer) {
        // Credit: sum of what others owe this user in this expense
        const othersShare = expense.splits
          .filter((s) => s.user._id.toString() !== userId.toString())
          .reduce((s, split) => s + split.amountOwed, 0);
        groupMap[gid].balance += othersShare;
      } else {
        // Debit: what this user owes the payer
        const userSplit = expense.splits.find(
          (s) => s.user._id.toString() === userId.toString()
        );
        if (userSplit) groupMap[gid].balance -= userSplit.amountOwed;
      }
    }

    const groupBalances = Object.values(groupMap);

    // ── E. recentActivity ─────────────────────────────
    // Last 10 expenses, formatted with user's personal share
    const recentActivity = expenses.slice(0, 10).map((e) => {
      const userSplit = e.splits.find(
        (s) => s.user._id.toString() === userId.toString()
      );
      return {
        expenseId: e._id,
        groupName: e.group ? e.group.name : null,
        description: e.description,
        totalAmount: e.totalAmount,
        payer: { id: e.payer._id, name: e.payer.name },
        yourShare: userSplit ? userSplit.amountOwed : 0,
        createdAt: e.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalSpending: +totalSpending.toFixed(2),
        youAreOwed: +youAreOwed.toFixed(2),
        youOwe: +youOwe.toFixed(2),
        groupBalances,
        recentActivity,
      },
    });
  } catch (err) {
    console.error("[getUserDashboard]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/groups/:groupId/dashboard
// ─────────────────────────────────────────────
const getGroupDashboard = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: "Invalid group ID" });
    }

    // ── A. groupDetails ───────────────────────────────
    const group = await Group.findById(groupId)
      .populate("members.user", "name email")
      .lean();

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const groupDetails = {
      groupId: group._id,
      name: group.name,
      members: group.members.map((m) => ({
        userId: m.user._id,
        name: m.user.name,
        email: m.user.email,
        status: m.status,
      })),
    };

    // ── B. totalGroupExpenses ─────────────────────────
    const expenses = await Expense.find({ group: groupId })
      .populate("payer", "name email")
      .populate("splits.user", "name email")
      .lean();

    const totalGroupExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

    // ── C. Debt Simplification ────────────────────────
    // Step 1: Compute net balance per user across all group expenses
    //   +totalAmount for the payer (they fronted the money)
    //   -amountOwed  for each split participant (they owe their share)
    const balanceMap = {}; // userId → { user: {id, name}, balance: Number }

    const upsert = (userId, userName, delta) => {
      const key = userId.toString();
      if (!balanceMap[key]) balanceMap[key] = { user: { id: userId, name: userName }, balance: 0 };
      balanceMap[key].balance += delta;
    };

    for (const expense of expenses) {
      // Payer is owed the full amount back
      upsert(expense.payer._id, expense.payer.name, expense.totalAmount);

      // Each split participant owes their share
      for (const split of expense.splits) {
        upsert(split.user._id, split.user.name, -split.amountOwed);
      }
    }

    // Step 2: Separate into creditors (balance > 0) and debtors (balance < 0)
    // Use a greedy two-pointer approach to minimise number of transactions
    const creditors = []; // { user, balance }
    const debtors = [];   // { user, balance (positive magnitude) }

    for (const entry of Object.values(balanceMap)) {
      const rounded = +entry.balance.toFixed(2);
      if (rounded > 0) creditors.push({ user: entry.user, balance: rounded });
      else if (rounded < 0) debtors.push({ user: entry.user, balance: -rounded }); // store magnitude
    }

    // Greedy settlement
    const debts = [];
    let ci = 0; // creditor pointer
    let di = 0; // debtor pointer

    while (ci < creditors.length && di < debtors.length) {
      const settle = Math.min(creditors[ci].balance, debtors[di].balance);

      debts.push({
        from: debtors[di].user,
        to: creditors[ci].user,
        amount: +settle.toFixed(2),
      });

      creditors[ci].balance -= settle;
      debtors[di].balance -= settle;

      if (creditors[ci].balance < 0.01) ci++;
      if (debtors[di].balance < 0.01) di++;
    }

    return res.status(200).json({
      success: true,
      data: {
        groupDetails,
        totalGroupExpenses: +totalGroupExpenses.toFixed(2),
        debts,
      },
    });
  } catch (err) {
    console.error("[getGroupDashboard]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUserDashboard, getGroupDashboard };
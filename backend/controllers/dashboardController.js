const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// GET /api/users/dashboard
// ─────────────────────────────────────────────
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedGroups = await Group.find({
      members: {
        $elemMatch: {
          user: userId,
          status: 'accepted',
        },
      },
    })
      .select('_id name members')
      .lean();

    const acceptedGroupIds = acceptedGroups.map((g) => g._id);

    // Fetch all expenses where the user is involved:
    //   - as the payer, OR
    //   - as a participant in splits
    const expenses = await Expense.find({
      group: { $in: acceptedGroupIds },
      $or: [{ payer: userId }, { "splits.user": userId }],
    })
      .populate("payer", "name email")
      .populate("group", "name")
      .populate("splits.user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // ── D. groupBalances ──────────────────────────────
    // Net balance per group BEFORE settlements:
    // positive = owed money, negative = owes money
    const groupMap = {}; // groupId → { groupName, balance }

    for (const group of acceptedGroups) {
      const gid = group._id.toString();
      groupMap[gid] = { groupId: gid, groupName: group.name, balance: 0 };
    }

    for (const expense of expenses) {
      if (!expense.group) continue;
      const gid = expense.group._id.toString();

      const payerId = expense.payer?._id?.toString();
      const isPayer = payerId === userId.toString();

      if (isPayer) {
        // Credit: sum of what others owe this user in this expense
        const othersShare = expense.splits
          .filter((s) => s.user?._id && s.user._id.toString() !== userId.toString())
          .reduce((s, split) => s + split.amountOwed, 0);
        groupMap[gid].balance += othersShare;
      } else {
        // Debit: what this user owes the payer
        const userSplit = expense.splits.find(
          (s) => s.user?._id && s.user._id.toString() === userId.toString()
        );
        if (userSplit) groupMap[gid].balance -= userSplit.amountOwed;
      }
    }

    // ✅ ΔΙΟΡΘΩΣΗ: Αφαίρεσε τα settlements από τα group balances
    // Ακριβώς όπως κάνει ο calculateDebts στο debtController
    const allGroupIds = Object.keys(groupMap);

    if (allGroupIds.length > 0) {
      const settlements = await Settlement.find({
        group: { $in: allGroupIds },
        $or: [{ payer: userId }, { payee: userId }],
      })
        .populate("payer", "name")
        .populate("payee", "name")
        .lean();

      for (const s of settlements) {
        const gid = s.group.toString();
        if (!groupMap[gid]) continue;

        const isSettlementPayer = s.payer?._id?.toString() === userId.toString();

        if (isSettlementPayer) {
          // Εγώ πλήρωσα → το χρέος μου μειώθηκε → balance αυξάνεται (λιγότερο αρνητικό)
          groupMap[gid].balance += s.amount;
        } else {
          // Κάποιος άλλος μου πλήρωσε → αυτό που μου χρωστούσαν μειώθηκε → balance μειώνεται
          groupMap[gid].balance -= s.amount;
        }
      }
    }

    // Στρογγυλοποίηση για να αποφύγουμε floating point artifacts (π.χ. -0.000001)
    const groupBalances = Object.values(groupMap).map((g) => ({
      ...g,
      balance: +g.balance.toFixed(2),
    }));

    // ── A. totalSpending ──────────────────────────────
    // User spending = sum of user's owed share in every involved expense,
    // including own share in expenses paid by the user.
    // This is independent from settlements.
    const totalSpending = expenses.reduce((sum, e) => {
      const userSplit = e.splits.find(
        (s) => s.user?._id && s.user._id.toString() === userId.toString()
      );
      return sum + (userSplit ? userSplit.amountOwed : 0);
    }, 0);

    // ── B. youAreOwed ─────────────────────────────────
    // Υπολογίζεται από τα groupBalances (μετά settlements) για συνέπεια
    const youAreOwed = groupBalances
      .filter((g) => g.balance > 0)
      .reduce((sum, g) => sum + g.balance, 0);

    // ── C. youOwe ─────────────────────────────────────
    // Υπολογίζεται από τα groupBalances (μετά settlements) για συνέπεια
    const youOwe = groupBalances
      .filter((g) => g.balance < 0)
      .reduce((sum, g) => sum + Math.abs(g.balance), 0);

    // ── E. recentActivity ─────────────────────────────
    const recentActivity = expenses.slice(0, 10).map((e) => {
      const userSplit = e.splits.find(
        (s) => s.user?._id && s.user._id.toString() === userId.toString()
      );
      return {
        expenseId: e._id,
        groupId: e.group ? e.group._id : null,
        groupName: e.group ? e.group.name : null,
        description: e.description,
        totalAmount: e.totalAmount,
        payer: {
          id: e.payer?._id || null,
          name: e.payer?.name || 'Deleted user',
        },
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
      members: group.members
        .filter((m) => m.user)
        .map((m) => ({
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
    const balanceMap = {};

    const upsert = (userId, userName, delta) => {
      const key = userId.toString();
      if (!balanceMap[key]) balanceMap[key] = { user: { id: userId, name: userName }, balance: 0 };
      balanceMap[key].balance += delta;
    };

    for (const expense of expenses) {
      if (!expense.payer?._id) continue;
      upsert(expense.payer._id, expense.payer.name, expense.totalAmount);
      for (const split of expense.splits) {
        if (!split.user?._id) continue;
        upsert(split.user._id, split.user.name, -split.amountOwed);
      }
    }

    const creditors = [];
    const debtors = [];

    for (const entry of Object.values(balanceMap)) {
      const rounded = +entry.balance.toFixed(2);
      if (rounded > 0) creditors.push({ user: entry.user, balance: rounded });
      else if (rounded < 0) debtors.push({ user: entry.user, balance: -rounded });
    }

    const debts = [];
    let ci = 0;
    let di = 0;

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
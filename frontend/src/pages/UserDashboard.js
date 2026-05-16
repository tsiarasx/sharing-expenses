import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CalendarDays,
  Wallet,
  ChevronRight,
  SplitSquareHorizontal,
  Plus,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { GroupContext } from "../context/GroupContext";

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Formats a number as a currency string, always using the absolute value. */
const formatCurrency = (amount, currency = "€") =>
  `${currency}${Math.abs(amount).toFixed(2)}`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * LoadingScreen
 * Full-page spinner shown while the dashboard API call is in-flight.
 */
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg">
      <SplitSquareHorizontal className="text-white" size={30} />
    </div>
    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
      <Loader2 className="animate-spin" size={16} />
      Loading your dashboard…
    </div>
  </div>
);

/**
 * SummaryCard
 * Stat tile used in the top summary row (total receivable / total owed).
 */
const SummaryCard = ({ label, amount, currency, type, icon: Icon }) => {
  const isPositive = type === "receive";
  return (
    <div
      className={`
        rounded-2xl p-5 flex items-center gap-4 shadow-sm border
        ${isPositive ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${isPositive ? "bg-emerald-100" : "bg-rose-100"}
        `}
      >
        <Icon size={22} className={isPositive ? "text-emerald-600" : "text-rose-500"} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </p>
        <p className={`text-2xl font-bold ${isPositive ? "text-emerald-600" : "text-rose-500"}`}>
          {currency}{amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

/**
 * GroupBalanceCard
 * Displays one group's net balance. Accepts an onClick so the parent can
 * navigate to the group's detail page when the card is clicked.
 */
const GroupBalanceCard = ({ group, onClick }) => {
  const { groupName, balance, memberCount, currency } = group;
  const isPositive = balance > 0;
  const isSettled = balance === 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-violet-600" />
        </div>
        <ChevronRight
          size={16}
          className="text-slate-300 group-hover:text-violet-400 transition-colors mt-1"
        />
      </div>

      {/* Group name */}
      <p className="text-sm font-semibold text-slate-700 leading-snug mb-1 line-clamp-2">
        {groupName}
      </p>
      <p className="text-xs text-slate-400 mb-4">
        {memberCount} member{memberCount !== 1 ? "s" : ""}
      </p>

      {/* Balance badge */}
      {isSettled ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          Settled up
        </span>
      ) : (
        <div className={`flex items-center gap-1.5 ${isPositive ? "text-emerald-600" : "text-rose-500"}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-base font-bold">{formatCurrency(balance, currency)}</span>
          <span className="text-xs font-medium opacity-70">
            {isPositive ? "to receive" : "owed"}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * ExpenseRow
 * A single item in the expense history timeline.
 */
const ExpenseRow = ({ expense }) => {
  const { date, title, groupName, paidBy, paidByMe, totalAmount, myShare, iOwe, currency } = expense;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
      {/* Date column */}
      <div className="w-14 flex-shrink-0 text-center">
        <p className="text-lg font-bold text-slate-700 leading-none">
          {new Date(date).getDate()}
        </p>
        <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">
          {new Date(date).toLocaleDateString("en-GB", { month: "short" })}
        </p>
      </div>

      {/* Vertical divider */}
      <div className="w-px h-10 bg-slate-200 flex-shrink-0" />

      {/* Receipt icon */}
      <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
        <Receipt size={16} className="text-violet-600" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-medium">
            <Users size={10} />
            {groupName}
          </span>
          <span className="text-xs text-slate-400">
            Paid by{" "}
            <span className={paidByMe ? "text-violet-600 font-semibold" : "text-slate-500 font-medium"}>
              {paidBy}
            </span>
          </span>
        </div>
      </div>

      {/* Amount block */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-slate-400 mb-0.5">
          Total {formatCurrency(totalAmount, currency)}
        </p>
        <div className={`flex items-center gap-1 justify-end ${iOwe ? "text-rose-500" : "text-emerald-600"}`}>
          {iOwe ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          <span className="text-sm font-bold">{formatCurrency(myShare, currency)}</span>
        </div>
        <p className={`text-xs font-medium mt-0.5 ${iOwe ? "text-rose-400" : "text-emerald-500"}`}>
          {iOwe ? "you owe" : "you receive"}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component — UserDashboard
// ---------------------------------------------------------------------------

const UserDashboard = () => {
  const navigate = useNavigate();

  // ── Dashboard data state ───────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Create Group modal state ───────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ── Context ────────────────────────────────────────────────────────────────
  const { user } = useContext(AuthContext);

  // groups = full list of the user's groups (including newly created ones)
  // createGroup = function that POSTs to the backend and updates the context
  const { groups, createGroup } = useContext(GroupContext);

  // ── Fetch dashboard data ───────────────────────────────────────────────────
  // Wrapped in useCallback so the useEffect dependency array stays stable.
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/users/dashboard", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error("Failed to load dashboard data.");

      const { groupBalances, recentActivity } = json.data;

      setDashboardData({
        // User profile info comes from AuthContext (always up-to-date)
        user: {
          name: user.name,
          email: user.email,
          avatarInitials: user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        },
        // Balance data keyed by group id — used to enrich the GroupContext list below
        groupBalances: groupBalances.map((g) => ({
          id: g.groupId,
          groupName: g.groupName,
          balance: g.balance,
          memberCount: g.memberCount ?? 0,
          currency: g.currency ?? "€",
        })),
        // Map backend activity shape → shape expected by ExpenseRow
        expenses: recentActivity.map((item) => {
          const payerName = item.payerName || item.payer?.name;
          return {
            id: item.expenseId || item._id,
            date: item.createdAt,
            title: item.description,
            groupName: item.groupName,
            paidBy: payerName,
            paidByMe: payerName === user.name,
            totalAmount: item.totalAmount,
            myShare: item.myShare || item.yourShare || 0,
            iOwe: payerName !== user.name,
            currency: item.currency ?? "€",
          };
        }),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  // ── Create Group handler ───────────────────────────────────────────────────
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      await createGroup({ name: newGroupName });
      // GroupContext updates automatically — no page reload needed
      setShowModal(false);
      setNewGroupName("");
    } catch (err) {
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // ── Loading / Error guards ─────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm text-center">
          <p className="text-rose-500 font-semibold mb-2">Error</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const { user: profile, groupBalances, expenses } = dashboardData;

  /**
   * Merge the full group list from GroupContext with the balance data from the
   * API. This ensures that:
   *  - All groups are shown (including ones with a €0 balance).
   *  - Newly created groups appear immediately without a page reload.
   *  - Each card has a valid `id` so navigation to /groups/:id works.
   */
  const displayGroups = groups.map((contextGroup) => {
    // Try to find a matching balance entry from the API response
    const apiBalance = groupBalances.find((gb) => gb.id === contextGroup._id);
    return {
      id: contextGroup._id,
      groupName: contextGroup.name,
      memberCount: contextGroup.members?.length ?? 1,
      balance: apiBalance?.balance ?? 0,
      currency: apiBalance?.currency ?? "€",
    };
  });

  /** Sum of all positive balances (money owed to the user) */
  const totalReceivable = groupBalances
    .filter((g) => g.balance > 0)
    .reduce((sum, g) => sum + g.balance, 0);

  /** Sum of all negative balances (money the user owes) */
  const totalOwed = groupBalances
    .filter((g) => g.balance < 0)
    .reduce((sum, g) => sum + Math.abs(g.balance), 0);

  /** Expenses sorted newest → oldest */
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <SplitSquareHorizontal size={17} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">SplitEase</span>
          </div>

          {/* User info + avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-none">{profile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.avatarInitials}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page body ─────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Page heading + Create Group button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {profile.name.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's your expense overview across all groups.
            </p>
          </div>

          {/* Opens the Create Group modal */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-700 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Plus size={18} />
            Create Group
          </button>
        </div>

        {/* ── Section A: Summary stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard
            label="Total to receive"
            amount={totalReceivable}
            currency="€"
            type="receive"
            icon={TrendingUp}
          />
          <SummaryCard
            label="Total you owe"
            amount={totalOwed}
            currency="€"
            type="owe"
            icon={TrendingDown}
          />
        </div>

        {/* ── Section B: Group balances ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-violet-600" />
              <h2 className="text-base font-bold text-slate-800">Balance per Group</h2>
              {/* Badge reflects the merged list, not just the API response */}
              <span className="text-xs font-semibold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                {displayGroups.length}
              </span>
            </div>
          </div>

          {/* Empty state — shown when the user has no groups yet */}
          {displayGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-500 mb-4">You are not part of any groups yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-violet-600 font-semibold hover:underline"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {displayGroups.map((group) => (
                <GroupBalanceCard
                  key={group.id}
                  group={group}
                  // Navigate to the group's detail page when the card is clicked
                  onClick={() => navigate(`/groups/${group.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Section C: Expense history timeline ──────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-violet-600" />
              <h2 className="text-base font-bold text-slate-800">Expense History</h2>
              <span className="text-xs font-semibold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                {expenses.length}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ArrowUpRight size={12} className="text-emerald-500" />
                You receive
              </span>
              <span className="flex items-center gap-1">
                <ArrowDownRight size={12} className="text-rose-400" />
                You owe
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Column headers — desktop only */}
            <div className="hidden sm:grid grid-cols-[56px_1px_36px_1fr_auto] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest col-start-1">
                Date
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest col-start-3 col-span-2">
                Expense
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">
                Your share
              </p>
            </div>

            {/* Empty state or expense rows */}
            {sortedExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No expenses found.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sortedExpenses.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </div>
            )}

            {/* Load more footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
              <button className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors inline-flex items-center gap-1">
                <CalendarDays size={13} />
                Load older expenses
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-6 py-6 mt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          SplitEase · University MERN Project · {new Date().getFullYear()}
        </p>
      </footer>

      {/* ── Create Group Modal ─────────────────────────────────────────────── */}
      {/* Rendered outside <main> so the fixed overlay covers the full viewport */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Create New Group</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleCreateSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g., Summer Trip 2025"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 outline-none transition-all"
                />
              </div>

              {/* Cancel / Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 text-white font-semibold bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* ── End Modal ─────────────────────────────────────────────────────── */}

    </div>
  );
};

export default UserDashboard;
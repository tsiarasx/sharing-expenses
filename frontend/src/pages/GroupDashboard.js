import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Clock,
  Euro,
  UserCircle,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // adjust path as needed

// ─────────────────────────────────────────────
// HELPER — Format a number as a Euro amount
// ─────────────────────────────────────────────
const formatEuro = (amount) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Math.abs(amount));

// ─────────────────────────────────────────────
// SUB-COMPONENT — Stat card in the overview bar
// ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SUB-COMPONENT — Single member card
// ─────────────────────────────────────────────
const MemberCard = ({ member }) => {
  const isPositive = member.balance >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-semibold text-sm">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {member.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{member.email}</p>
        </div>
      </div>

      {/* Balance pill */}
      <div
        className={`flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-semibold ${
          isPositive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp size={13} />
        ) : (
          <TrendingDown size={13} />
        )}
        {isPositive ? "Gets back" : "Owes"} {formatEuro(member.balance)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT — Single debt row
// ─────────────────────────────────────────────
const DebtRow = ({ debt, onSettle }) => {
  const [settling, setSettling] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSettle = async () => {
    setSettling(true);
    try {
      const res = await fetch(`http://localhost:5000/api/debts/${debt.id}/settle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to settle debt");

      onSettle(debt.id);
    } catch (err) {
      console.error("Settle error:", err.message);
    } finally {
      setSettling(false);
    }
  };

  if (debt.settled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
        <span className="text-sm text-emerald-700 font-medium">
          {debt.debtorName} → {debt.creditorName} &nbsp;|&nbsp;{" "}
          {formatEuro(debt.amount)} — Settled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Left: debt description */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Debtor avatar */}
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span className="text-red-500 font-semibold text-xs">
            {debt.debtorName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">
            <span className="text-red-500">{debt.debtorName}</span>
            <span className="text-gray-400 mx-1.5">owes</span>
            <span className="text-emerald-600">{debt.creditorName}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            Pending settlement
          </p>
        </div>
      </div>

      {/* Right: amount + action */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
          <Euro size={13} className="text-gray-400" />
          {formatEuro(debt.amount).replace("€", "")}
        </span>

        <button
          onClick={handleSettle}
          disabled={settling}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {settling ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ArrowRight size={13} />
          )}
          {settling ? "Settling…" : "Settle Up"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOADING SKELETON — shown while data fetches
// ─────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6 md:p-10 animate-pulse">
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="h-8 bg-gray-200 rounded-xl w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// HELPER — Transform backend response to the
// shape the existing JSX expects
// ─────────────────────────────────────────────
const transformGroupData = (data) => {
  const { groupDetails, totalGroupExpenses, debts } = data;

  // Compute each member's net balance from the debts array.
  // A member is a creditor  → balance increases by debt.amount
  // A member is a debtor    → balance decreases by debt.amount
  const balanceMap = {};

  groupDetails.members.forEach((m) => {
    balanceMap[m._id.toString()] = 0;
  });

  debts.forEach((debt) => {
    const debtorKey = debt.debtorId?.toString?.() ?? debt.debtorId;
    const creditorKey = debt.creditorId?.toString?.() ?? debt.creditorId;

    if (debtorKey in balanceMap) balanceMap[debtorKey] -= debt.amount;
    if (creditorKey in balanceMap) balanceMap[creditorKey] += debt.amount;
  });

  const totalBalance = Object.values(balanceMap).reduce((a, b) => a + b, 0);

  return {
    id: groupDetails._id,
    name: groupDetails.name,
    totalExpenses: totalGroupExpenses,
    totalBalance,
    members: groupDetails.members.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      balance: balanceMap[m._id.toString()] ?? 0,
    })),
    debts: debts.map((d) => ({
      id: d._id,
      debtorId: d.debtorId,
      debtorName: d.debtorName,
      creditorId: d.creditorId,
      creditorName: d.creditorName,
      amount: d.amount,
      settled: d.settled ?? false,
    })),
  };
};

// ─────────────────────────────────────────────
// MAIN COMPONENT — GroupDashboard
// ─────────────────────────────────────────────
const GroupDashboard = () => {
  // ── Router param ───────────────────────────
  const { id: groupId } = useParams();

  // ── Auth context ───────────────────────────
  const { user } = useContext(AuthContext);

  // ── State ──────────────────────────────────
  const [group, setGroup] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Data Fetching ──────────────────────────
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `Request failed: ${res.status}`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Unexpected response from server");
        }

        const transformed = transformGroupData(json.data);
        setGroup(transformed);
        setDebts(transformed.debts);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (groupId && user?.token) {
      fetchGroup();
    }
  }, [groupId, user]);

  // ── Settle Up handler ──────────────────────
  // Marks a debt as settled in local state.
  // The actual PATCH request is fired inside <DebtRow />.
  const handleSettleDebt = (debtId) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === debtId ? { ...d, settled: true } : d))
    );
  };

  // ── Render: loading ────────────────────────
  if (loading) return <LoadingSkeleton />;

  // ── Render: error ──────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
          <p className="text-red-500 font-semibold text-lg mb-2">
            Could not load group
          </p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────
  const activeDebts = debts.filter((d) => !d.settled);
  const settledDebts = debts.filter((d) => d.settled);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 text-sm font-medium mb-1">
              <LayoutDashboard size={15} />
              <span>Group Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm text-gray-500">
            <UserCircle size={16} className="text-indigo-400" />
            {group.members.length} members
          </div>
        </div>

        {/* ── A. Group Overview — Stat Cards ─── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Receipt}
              label="Total Expenses"
              value={formatEuro(group.totalExpenses)}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-500"
            />
            <StatCard
              icon={Wallet}
              label="Group Balance"
              value={formatEuro(group.totalBalance)}
              iconBg={group.totalBalance >= 0 ? "bg-emerald-50" : "bg-red-50"}
              iconColor={
                group.totalBalance >= 0 ? "text-emerald-500" : "text-red-500"
              }
            />
            <StatCard
              icon={Users}
              label="Members"
              value={group.members.length}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
            />
            <StatCard
              icon={Clock}
              label="Pending Debts"
              value={activeDebts.length}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
            />
          </div>
        </section>

        {/* ── B. Group Members ──────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">Members</h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">
              {group.members.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>

        {/* ── C & D. Debts + Settle Up ─────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-800">
              Debt Relationships
            </h2>
            {activeDebts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-semibold rounded-full">
                {activeDebts.length} active
              </span>
            )}
            {settledDebts.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                {settledDebts.length} settled
              </span>
            )}
          </div>

          {debts.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">All settled up!</p>
              <p className="text-gray-400 text-sm mt-1">
                No outstanding debts in this group.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active debts first, settled debts below */}
              {[...activeDebts, ...settledDebts].map((debt) => (
                <DebtRow
                  key={debt.id}
                  debt={debt}
                  onSettle={handleSettleDebt}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Footer note ──────────────────── */}
        <p className="text-center text-xs text-gray-300 pb-4">
          GroupDashboard · Expense Sharing Platform
        </p>
      </div>
    </div>
  );
};

export default GroupDashboard;
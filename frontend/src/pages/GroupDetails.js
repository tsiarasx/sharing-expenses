import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Loader2,
  SplitSquareHorizontal,
  ChevronLeft,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// ─────────────────────────────────────────────
// HELPER — Format a number as a Euro amount
// ─────────────────────────────────────────────
const formatEuro = (amount) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Math.abs(amount));

// ─────────────────────────────────────────────
// HELPER — Safely extract a string ID
// ─────────────────────────────────────────────
const safeGetId = (obj) => {
  if (!obj) return "";
  if (obj._id) return obj._id.toString();
  if (obj.id) return obj.id.toString();
  return obj.toString();
};

// ─────────────────────────────────────────────
// HELPER — Transform backend response
// ─────────────────────────────────────────────
const transformGroupData = (data) => {
  const groupDetails = data.groupDetails || {};
  const members = groupDetails.members || [];
  const debts = data.debts || [];
  const totalGroupExpenses = data.totalGroupExpenses ?? 0;

  const balanceMap = {};
  members.forEach((m) => {
    const id = safeGetId(m);
    if (id) balanceMap[id] = 0;
  });

  debts.forEach((debt) => {
    const debtorKey = safeGetId(debt.debtorId);
    const creditorKey = safeGetId(debt.creditorId);
    if (debtorKey && debtorKey in balanceMap) balanceMap[debtorKey] -= debt.amount;
    if (creditorKey && creditorKey in balanceMap) balanceMap[creditorKey] += debt.amount;
  });

  const totalBalance = Object.values(balanceMap).reduce((sum, v) => sum + v, 0);

  return {
    id: groupDetails._id || "unknown",
    name: groupDetails.name || "Unnamed Group",
    totalExpenses: totalGroupExpenses,
    totalBalance,
    members: members.map((m) => {
      const id = safeGetId(m);
      return {
        id,
        name: m.name || "Unknown Member",
        email: m.email || "",
        balance: balanceMap[id] ?? 0,
      };
    }),
    debts: debts.map((d) => ({
      id: d._id || crypto.randomUUID(),
      debtorId: d.debtorId,
      debtorName: d.debtorName || "Unknown",
      creditorId: d.creditorId,
      creditorName: d.creditorName || "Unknown",
      amount: d.amount ?? 0,
      settled: d.settled ?? false,
    })),
  };
};

// ─────────────────────────────────────────────
// SUB-COMPONENT — Stat card
// ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SUB-COMPONENT — Member card
// ─────────────────────────────────────────────
const MemberCard = ({ member }) => {
  const isPositive = member.balance >= 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-semibold text-sm">
            {member.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{member.name}</p>
          <p className="text-xs text-gray-400 truncate">{member.email}</p>
        </div>
      </div>
      <div
        className={`flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-semibold ${
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        }`}
      >
        {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {isPositive ? "Gets back" : "Owes"} {formatEuro(member.balance)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT — Debt row
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
          {debt.debtorName} → {debt.creditorName}&nbsp;|&nbsp;
          {formatEuro(debt.amount)} — Settled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span className="text-red-500 font-semibold text-xs">
            {debt.debtorName.split(" ").map((n) => n[0]).join("")}
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
          {settling ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
          {settling ? "Settling…" : "Settle Up"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-10 animate-pulse">
    <div className="max-w-5xl mx-auto space-y-8">
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
// MAIN COMPONENT — GroupDetails
// ─────────────────────────────────────────────
const GroupDetails = () => {
  const { id: groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/api/groups/${groupId}/dashboard`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `Request failed: ${res.status}`);
        }
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Unexpected response from server");
        const transformed = transformGroupData(json.data);
        setGroup(transformed);
        setDebts(transformed.debts);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (groupId && user?.token) fetchGroup();
  }, [groupId, user]);

  const handleSettleDebt = (debtId) => {
    setDebts((prev) => prev.map((d) => (d.id === debtId ? { ...d, settled: true } : d)));
  };

  const activeDebts = debts.filter((d) => !d.settled);
  const settledDebts = debts.filter((d) => d.settled);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50/50">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {/* Overview link */}
          <Link
            to="/?tab=overview"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          {/* Groups link — active indicator since we're in a group */}
          <Link
            to="/?tab=groups"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative text-blue-700 bg-blue-50/50"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="font-medium text-sm">Groups</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto" />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Back breadcrumb */}
            <button
              onClick={() => navigate("/?tab=groups")}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-700 transition-colors mr-2"
            >
              <ChevronLeft size={16} />
              <span>Groups</span>
            </button>
            <span className="text-gray-300">/</span>
            <h2 className="text-xl font-semibold text-blue-800 ml-2">
              {loading ? "Loading…" : (group?.name ?? "Group Details")}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-300 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
              <p className="text-red-500 font-semibold text-lg mb-2">Could not load group</p>
              <p className="text-gray-400 text-sm">{error}</p>
              <button
                onClick={() => navigate("/dashboard?tab=groups")}
                className="mt-4 text-blue-700 text-sm font-medium hover:underline flex items-center gap-1 mx-auto"
              >
                <ChevronLeft size={14} /> Back to Groups
              </button>
            </div>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm text-gray-500">
                  <UserCircle size={16} className="text-indigo-400" />
                  {group.members.length} members
                </div>
              </div>

              {/* A. Stat Cards */}
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
                    iconColor={group.totalBalance >= 0 ? "text-emerald-500" : "text-red-500"}
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

              {/* B. Members Grid */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-indigo-500" />
                  <h2 className="text-lg font-bold text-gray-800">Members</h2>
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    {group.members.length} total
                  </span>
                </div>

                {group.members.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                    <Users size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No members yet</p>
                    <p className="text-gray-400 text-sm mt-1">Invite people to join this group.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.members.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </section>

              {/* C. Debt Relationships */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight size={18} className="text-indigo-500" />
                  <h2 className="text-lg font-bold text-gray-800">Debt Relationships</h2>
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
                  <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                    <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">All settled up!</p>
                    <p className="text-gray-400 text-sm mt-1">No outstanding debts in this group.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...activeDebts, ...settledDebts].map((debt) => (
                      <DebtRow key={debt.id} debt={debt} onSettle={handleSettleDebt} />
                    ))}
                  </div>
                )}
              </section>

              <p className="text-center text-xs text-gray-300 pb-4">
                GroupDetails · Expense Sharing Platform
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
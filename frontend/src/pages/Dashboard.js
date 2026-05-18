import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, SplitSquareHorizontal, X, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-blue-800 flex items-center justify-center shadow-lg">
      <SplitSquareHorizontal className="text-white" size={30} />
    </div>
    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
      <Loader2 className="animate-spin" size={16} />
      Loading your dashboard…
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { groups, createGroup } = useContext(GroupContext);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'groups' || tab === 'overview') setActiveTab(tab);
  }, [location]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // ── Dashboard data ─────────────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/users/dashboard', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load dashboard data.');

      const { groupBalances, recentActivity } = json.data;

      setDashboardData({
        groupBalances: groupBalances.map((g) => ({
          id: g.groupId,
          groupName: g.groupName,
          balance: g.balance,
          memberCount: g.memberCount ?? 0,
          currency: g.currency ?? '$',
        })),
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
            currency: item.currency ?? '$',
          };
        }),
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  // ── Create Group modal ─────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const newGroup = await createGroup({ name: newGroupName.trim() });
      setShowModal(false);
      setNewGroupName('');
      if (newGroup?._id) navigate(`/groups/${newGroup._id}`);
    } catch {
      alert('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm text-center">
          <p className="text-red-500 font-semibold mb-2">Error</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const { groupBalances, expenses } = dashboardData;

  /** Merge GroupContext list with API balance data so newly created groups appear instantly */
  const displayGroups = groups.map((ctxGroup) => {
    const apiBalance = groupBalances.find((gb) => gb.id === ctxGroup._id);
    return {
      id: ctxGroup._id,
      name: ctxGroup.name,
      members: ctxGroup.members,
      balance: apiBalance?.balance ?? 0,
      currency: apiBalance?.currency ?? '$',
    };
  });

  /** Sum of positive balances → "You Are Owed" */
  const totalReceivable = groupBalances
    .filter((g) => g.balance > 0)
    .reduce((sum, g) => sum + g.balance, 0);

  /** Sum of absolute negative balances → "You Owe" */
  const totalOwed = groupBalances
    .filter((g) => g.balance < 0)
    .reduce((sum, g) => sum + Math.abs(g.balance), 0);

  /** Expenses newest → oldest for Recent Activity */
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

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
          <Link
            to="/?tab=overview"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              activeTab === 'overview'
                ? 'text-blue-700 bg-blue-50/50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {activeTab === 'overview' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full" />
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link
            to="/?tab=groups"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              activeTab === 'groups'
                ? 'text-blue-700 bg-blue-50/50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {activeTab === 'groups' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full" />
            )}
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
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <h2 className="text-xl font-semibold text-blue-800 capitalize">{activeTab}</h2>
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
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">

          {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-6 mb-12">

                {/* Total Spending — derived from totalReceivable + totalOwed */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Total Spending</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${(totalReceivable + totalOwed).toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    across all groups
                  </div>
                  <div className="absolute top-6 right-6 text-gray-200">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
                    </svg>
                  </div>
                </div>

                {/* You Are Owed → totalReceivable from Code B */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Are Owed</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${totalReceivable.toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    from {groupBalances.filter((g) => g.balance > 0).length} group{groupBalances.filter((g) => g.balance > 0).length !== 1 ? 's' : ''}
                  </div>
                  <div className="absolute top-6 right-6 text-green-100">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* You Owe → totalOwed from Code B */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Owe</h3>
                  <div className="text-3xl font-bold text-red-600 mb-4">
                    ${totalOwed.toFixed(2)}
                  </div>
                  <button className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                    Settle now
                  </button>
                  <div className="absolute top-6 right-6 text-red-100">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-blue-700 text-sm font-medium hover:text-blue-800">
                  View all history
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {sortedExpenses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No recent activity.</div>
                ) : (
                  sortedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-5 border-b border-gray-100 flex items-center justify-between last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{expense.title}</h4>
                        <p className="text-xs text-gray-500">
                          {expense.groupName} · Paid by {expense.paidBy}
                          {' '}·{' '}
                          {new Date(expense.date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className={`text-sm font-semibold ${expense.iOwe ? 'text-red-500' : 'text-green-600'}`}>
                        {expense.iOwe ? '-' : '+'}{expense.currency}{Math.abs(expense.myShare).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── GROUPS TAB ────────────────────────────────────────────────── */}
          {activeTab === 'groups' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Groups</h3>
                {/* Opens Code B's modal */}
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Create New Group
                </button>
              </div>

              {/* Groups List — powered by Code B's displayGroups */}
              <div className="space-y-4">
                {displayGroups.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                    No groups available. Create one to get started!
                  </div>
                ) : (
                  displayGroups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{group.name}</h4>
                        <div className="text-xs text-gray-500">
                          {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="text-right mr-8">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Net Balance
                        </div>
                        {group.balance > 0 ? (
                          <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            YOU ARE OWED {group.currency}{group.balance.toFixed(2)}
                          </div>
                        ) : group.balance < 0 ? (
                          <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                            YOU OWE {group.currency}{Math.abs(group.balance).toFixed(2)}
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                            SETTLED UP
                          </div>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-4 border-l border-gray-200 pl-6"
                        onClick={(e) => e.stopPropagation()} // prevent card navigation when clicking actions
                      >
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors ${
                            group.balance !== 0
                              ? 'bg-blue-800 hover:bg-blue-900 text-white'
                              : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Settle Up
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Create Group Modal (Code B) ───────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Create New Group</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 outline-none transition-all"
                />
              </div>

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
                  className="flex-1 px-4 py-3 text-white font-semibold bg-blue-800 hover:bg-blue-900 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
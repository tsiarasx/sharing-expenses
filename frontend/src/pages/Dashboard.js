import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';
import NotificationBell from './NotificationBell';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { groups, createGroup: createGroupAPI, loading: groupsLoading } = useContext(GroupContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    try {
      setCreatingGroup(true);
      const newGroup = await createGroupAPI({ name: newGroupName.trim() });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      navigate(`/groups/${newGroup._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'groups' || tab === 'overview') {
      setActiveTab(tab);
    }
  }, [location]);

  // Data is dynamic depending on the user object, fallback to empty arrays/zeros if null
  // The user requirement said: "the app thakes data dynamicly and its not hard coded".
  const totalSpending = user?.totalSpending ?? 0;
  const youAreOwed = user?.youAreOwed ?? 0;
  const youOwe = user?.youOwe ?? 0;
  const recentActivity = user?.recentActivity ?? [];

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link to="/?tab=overview" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${activeTab === 'overview' ? 'text-blue-700 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-100'}`}>
            {activeTab === 'overview' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full"></div>}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link to="/?tab=groups" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${activeTab === 'groups' ? 'text-blue-700 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-100'}`}>
            {activeTab === 'groups' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full"></div>}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium text-sm">Groups</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          {/* Decorative line to match the left sidebar's bottom line in the image */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <h2 className="text-xl font-semibold text-blue-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-6">
          <NotificationBell />
            <Link to="/profile" className="block w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-300 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
          {activeTab === 'overview' && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Total Spending</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">${totalSpending.toFixed(2)}</div>
                  <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    0% from last month
                  </div>
                  <div className="absolute top-6 right-6 text-gray-200">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                      <path d="M12 12h.01"></path>
                      <path d="M17 12h.01"></path>
                      <path d="M7 12h.01"></path>
                    </svg>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Are Owed</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">${youAreOwed.toFixed(2)}</div>
                  <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                     from 0 friends
                  </div>
                  <div className="absolute top-6 right-6 text-green-100">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                  <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Owe</h3>
                  <div className="text-3xl font-bold text-red-600 mb-4">${youOwe.toFixed(2)}</div>
                  <button className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                    Settle now
                  </button>
                  <div className="absolute top-6 right-6 text-red-100">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Recent Activity Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-blue-700 text-sm font-medium hover:text-blue-800">
                  View all history
                </button>
              </div>

              {/* Recent Activity List */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No recent activity.</div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="p-5 border-b border-gray-100 flex items-center justify-between last:border-b-0 hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-sm font-semibold text-green-600">{activity.amount}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'groups' && (
            <>
              {/* Active Groups Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Groups</h3>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Create New Group
                </button>
              </div>

              {/* Create Group Modal */}
              {showCreateGroupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Group</h3>
                    <form onSubmit={handleCreateGroup}>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="e.g., Summer Trip, Apartment"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowCreateGroupModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={creatingGroup}
                          className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingGroup ? 'Creating...' : 'Create Group'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Groups List */}
              <div className="space-y-4">
                {groupsLoading ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                    Loading groups...
                  </div>
                ) : groups.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                    No groups available. Create one to get started!
                  </div>
                ) : (
                  groups.map((group) => (
                    <Link
                      key={group._id}
                      to={`/groups/${group._id}`}
                      className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{group.name}</h4>
                        <div className="text-xs text-gray-500">{group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right mr-8">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</div>
                        {group.balance > 0 ? (
                            <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">YOU ARE OWED ${group.balance.toFixed(2)}</div>
                        ) : group.balance < 0 ? (
                             <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">YOU OWE ${Math.abs(group.balance).toFixed(2)}</div>
                        ) : (
                             <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">SETTLED UP</div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                        <button className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors ${group.balance !== 0 ? 'bg-blue-800 hover:bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          Settle Up
                        </button>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

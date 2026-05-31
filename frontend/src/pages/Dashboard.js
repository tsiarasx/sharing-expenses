import React, { useState, useEffect, useContext, useCallback } from 'react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { Loader2, SplitSquareHorizontal, X, Plus, Trash2, Users, Wallet, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'; 
import { AuthContext } from '../context/AuthContext'; 
import { GroupContext } from '../context/GroupContext'; 
import NotificationBell from './NotificationBell'; 
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

const LoadingScreen = () => ( 
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4"> 
    <div className="w-16 h-16 rounded-3xl bg-slate-600 flex items-center justify-center shadow-lg"> 
      <SplitSquareHorizontal className="text-white" size={30} /> 
    </div> 
    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium"> 
      <Loader2 className="animate-spin" size={16} /> 
      Loading your dashboard… 
    </div> 
  </div> 
); 

/* People-in-a-circle SVG illustration for the banner */
const PeopleSharingIcon = () => (
  <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Connecting circle */}
    <circle cx="90" cy="90" r="52" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
    {/* Center hub */}
    <circle cx="90" cy="90" r="14" fill="#e2e8f0" />
    <text x="90" y="95" textAnchor="middle" fontSize="13" fill="#64748b" fontWeight="bold">$</text>

    {/* 5 people around the circle at 72 degree increments */}
    {[0, 72, 144, 216, 288].map((angle, i) => {
      const rad = (angle - 90) * (Math.PI / 180);
      const cx = 90 + 52 * Math.cos(rad);
      const cy = 90 + 52 * Math.sin(rad);
      return (
        <g key={i}>
          {/* Line from center to person */}
          <line x1="90" y1="90" x2={cx} y2={cy} stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
          {/* Person circle */}
          <circle cx={cx} cy={cy} r="14" fill={i === 0 ? '#64748b' : '#e2e8f0'} />
          {/* Head */}
          <circle cx={cx} cy={cy - 5} r="4.5" fill={i === 0 ? '#fff' : '#94a3b8'} />
          {/* Body arc */}
          <path
            d={`M${cx - 7} ${cy + 10} Q${cx} ${cy + 4} ${cx + 7} ${cy + 10}`}
            stroke={i === 0 ? '#fff' : '#94a3b8'}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    })}
  </svg>
);
 
const Dashboard = () => { 
  const { user } = useContext(AuthContext); 
  const { groups, createGroup, deleteGroup } = useContext(GroupContext); 
  const location = useLocation(); 
  const navigate = useNavigate(); 
 
  const [activeTab, setActiveTab] = useState('overview'); 
 
  useEffect(() => { 
    const params = new URLSearchParams(location.search); 
    const tab = params.get('tab'); 
    if (tab === 'groups' || tab === 'overview') setActiveTab(tab); 
  }, [location]); 
 
  useEffect(() => { 
    if (!user) navigate('/login'); 
  }, [user, navigate]); 
 
  const [dashboardData, setDashboardData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
 
  const fetchDashboardData = useCallback(async () => { 
    setIsLoading(true); 
    setError(null); 
    try { 
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/users/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` }, 
      }); 
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`); 
      const json = await res.json(); 
      if (!json.success) throw new Error('Failed to load dashboard data.'); 
 
      const { totalSpending, groupBalances, recentActivity } = json.data; 
 
      setDashboardData({ 
        totalSpending: totalSpending ?? 0, 
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
            groupId: item.groupId, 
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
 
  // Refresh dashboard stats after debt settlements or expense updates from GroupDetails.
  useEffect(() => { 
    const handler = () => fetchDashboardData(); 
    window.addEventListener('debt-settled', handler); 
    window.addEventListener('expense-updated', handler); 
    return () => { 
      window.removeEventListener('debt-settled', handler); 
      window.removeEventListener('expense-updated', handler); 
    }; 
  }, [fetchDashboardData]); 
 
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
 
  const { totalSpending, groupBalances, expenses } = dashboardData; 
 
  const displayGroups = groups
    .filter((ctxGroup) => {
      if (!Array.isArray(ctxGroup.members)) return true;

      return ctxGroup.members.some((member) => {
        const memberUserId =
          typeof member?.user === 'object'
            ? member?.user?._id?.toString?.()
            : member?.user?.toString?.();

        return memberUserId === user?._id?.toString?.() && member?.status === 'accepted';
      });
    })
    .map((ctxGroup) => {
    const apiBalance = groupBalances.find((gb) => gb.id === ctxGroup._id); 
    const latestGroupActivity = expenses.find((e) => e.groupId === ctxGroup._id);
    return { 
      id: ctxGroup._id, 
      name: ctxGroup.name, 
      members: ctxGroup.members, 
      balance: apiBalance?.balance ?? 0, 
      currency: apiBalance?.currency ?? '$', 
      activityDate: latestGroupActivity?.date || null,
    }; 
  });
 
  const totalReceivable = groupBalances 
    .filter((g) => g.balance > 0) 
    .reduce((sum, g) => sum + g.balance, 0); 
 
  const totalOwed = groupBalances 
    .filter((g) => g.balance < 0) 
    .reduce((sum, g) => sum + Math.abs(g.balance), 0); 
 
  const sortedExpenses = [...expenses].sort( 
    (a, b) => new Date(b.date) - new Date(a.date) 
  ); 

  const mockChartData = (expenses && expenses.length > 0)
    ? expenses.map((e, i) => ({
        name: i,
        // Chart should represent only what the current user spent in each expense.
        val: Number(e.myShare || 0),
      }))
    : [{val: 100}, {val: 200}, {val: 150}, {val: 300}, {val: 250}, {val: 400}];
 
  return ( 
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] font-sans"> 

      {/* Page layout: sidebar + main */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 44px)' }}>
 
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col pt-10 pb-6 rounded-r-3xl my-2 ml-2 shadow-sm flex-shrink-0"> 
          <div className="px-8 mb-10 flex items-center gap-3">
            {/* Logo */}
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-700">SplitWise</h1> 
          </div> 
 
          <nav className="flex-1 space-y-2 px-6"> 
            <Link 
              to="/?tab=overview" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${ 
                activeTab === 'overview' 
                  ? 'bg-slate-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-slate-700 hover:bg-gray-50' 
              }`} 
            > 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /> 
                <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /> 
              </svg> 
              Dashboard
            </Link> 
 
            <Link 
              to="/?tab=groups" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${ 
                activeTab === 'groups' 
                  ? 'bg-slate-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-slate-700 hover:bg-gray-50' 
              }`} 
            > 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"> 
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> 
                <circle cx="9" cy="7" r="4" /> 
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /> 
                <path d="M16 3.13a4 4 0 0 1 0 7.75" /> 
              </svg> 
              Groups
            </Link> 
          </nav> 
        </div> 
 
        <div className="flex-1 flex flex-col overflow-hidden px-8"> 
 
          {/* Header */}
          <header className="h-24 flex items-center justify-between pt-6 pb-2 flex-shrink-0"> 
            <div>
              <h2 className="text-3xl font-bold text-slate-700 tracking-tight">Hello, {user?.name || 'User'}</h2> 
              <p className="text-sm text-gray-400 font-medium mt-1">Welcome back!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notification bell styled black to match the profile button */}
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <NotificationBell />
              </div>
              <Link to="/profile" className="block w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link> 
            </div> 
          </header> 
 
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pb-8 pt-4 custom-scrollbar"> 
 
            {activeTab === 'overview' && ( 
              <div className="flex gap-8">
                {/* Left Column (Banner, Cards, Activities) */}
                <div className="flex-1 space-y-8 flex flex-col">
                  
                  {/* Banner */}
                  <div className="bg-[#EAEFF5] rounded-[32px] p-8 flex items-center justify-between relative overflow-hidden shadow-sm h-48">
                    <div className="z-10 w-2/3">
                      <h3 className="text-2xl font-bold text-slate-700 leading-snug mb-4">
                        Split the expenses<br/>with your mates
                      </h3>
                    </div>
                    <div className="absolute right-4 bottom-0 top-0 w-44 flex items-center justify-center pointer-events-none">
                      <PeopleSharingIcon />
                    </div>
                  </div>

                  {/* Main Content Split: Activities & Cards */}
                  <div className="flex gap-8 flex-1">
                    
                    {/* Recent activity list */}
                    <div className="flex-1 bg-white rounded-[32px] p-8 shadow-sm flex flex-col">
                      <h3 className="text-lg font-bold text-slate-700 mb-6">Groups</h3>
                      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {displayGroups.length === 0 ? ( 
                          <div className="text-gray-400 font-medium text-sm">No groups yet.</div> 
                        ) : ( 
                          displayGroups.slice(0, 4).map((group) => ( 
                            <button
                              type="button"
                              key={group.id}
                              onClick={() => navigate(`/groups/${group.id}`)}
                              className="w-full flex items-center justify-between text-left rounded-2xl px-4 py-3 border border-transparent hover:border-slate-100 hover:bg-slate-50/80 transition-colors"
                            > 
                              <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <div> 
                                  <h4 className="text-sm font-bold text-slate-700">{group.name}</h4> 
                                  <p className="text-xs font-medium text-gray-400 mt-1"> 
                                    {group.activityDate
                                      ? `${new Date(group.activityDate).toLocaleDateString('en-GB', {
                                      day: 'numeric', month: 'short' 
                                    })}, ${new Date(group.activityDate).toLocaleTimeString('en-US', {
                                      hour: 'numeric', minute: '2-digit'
                                    })}`
                                      : 'No activity yet'}
                                  </p> 
                                </div> 
                              </div>
                              <div className={`flex items-center justify-center min-w-[48px] h-12 rounded-full text-xs font-bold shadow-md ${group.balance >= 0 ? 'bg-slate-600 text-white' : 'bg-[#CBE4FE] text-slate-900'}`}> 
                                {group.balance >= 0 ? '+' : '-'}{Math.abs(group.balance).toFixed(0)}
                              </div> 
                            </button>
                          )) 
                        )} 
                      </div>
                    </div>

                    {/* Metric tiles */}
                    <div className="flex-1 space-y-6">
                      {/* You Are Owed Tile */}
                      <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-[32px] p-7 text-white shadow-md relative overflow-hidden h-48 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3"></div>

                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-200 mb-1 uppercase tracking-wider">You Are Owed</p>
                            <h2 className="text-3xl font-bold tracking-tight">${totalReceivable.toFixed(2)}</h2>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                            <TrendingUp size={20} className="text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Wallet size={13} className="text-white" />
                          </div>
                          <p className="text-xs font-medium text-slate-200">
                            from {groupBalances.filter((g) => g.balance > 0).length} group{groupBalances.filter((g) => g.balance > 0).length !== 1 ? 's' : ''}
                          </p>
                          <ArrowUpRight size={14} className="text-slate-300 ml-auto" />
                        </div>
                      </div>

                      {/* You Owe Tile */}
                      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-[32px] p-7 text-white shadow-md relative overflow-hidden h-48 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/3 translate-x-1/3"></div>

                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-100 mb-1 uppercase tracking-wider">You Owe</p>
                            <h2 className="text-3xl font-bold tracking-tight">${totalOwed.toFixed(2)}</h2>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                            <TrendingDown size={20} className="text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2">
                          <button 
                            onClick={() => navigate('/?tab=groups')}
                            className="text-[12px] font-bold text-slate-900 bg-[#CBE4FE] px-5 py-2 rounded-full uppercase shadow-sm hover:bg-[#B3D4F6] transition-colors"
                          >
                            Settle Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (Reports chart) */}
                <div className="w-80 bg-white rounded-[32px] p-8 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-slate-700">Report expenses</h3>
                  </div>

                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={mockChartData}
                        margin={{ top: 25, right: 15, left: -20, bottom: 0 }}
                      >
                        {/* Soft horizontal grid lines for readability */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        
                        {/* X axis — no borders for a clean UI */}
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#94a3b8', fontSize: 12 }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        
                        {/* Y axis — auto format with $ prefix */}
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 12 }} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(val) => `$${val}`} 
                        />
                        
                        {/* Tooltip on hover */}
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Amount']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#64748b' }}
                        />
                        
                        <Line 
                          type="monotone" 
                          dataKey="val" 
                          stroke="#64748b" 
                          strokeWidth={3} 
                          dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#64748b' }} 
                          activeDot={{ r: 7, fill: '#64748b', stroke: '#fff' }}
                        >
                          {/* Amount labels with $ above each dot */}
                          <LabelList 
                            dataKey="val" 
                            position="top" 
                            offset={10}
                            fill="#64748b" 
                            fontSize={12} 
                            fontWeight="bold"
                            formatter={(val) => `$${val}`} 
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )} 
 
            {activeTab === 'groups' && ( 
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8"> 
                  <h3 className="text-2xl font-bold text-slate-700">Active Groups</h3> 
                  <button 
                    onClick={() => setShowModal(true)} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-2xl text-sm font-semibold hover:bg-slate-500 transition-colors shadow-md" 
                  > 
                    <Plus size={18} />
                    Create New Group 
                  </button> 
                </div> 
 
                <div className="space-y-4"> 
                  {displayGroups.length === 0 ? ( 
                    <div className="bg-white rounded-[24px] p-10 text-center text-gray-500 font-medium shadow-sm"> 
                      No groups available. Create one to get started! 
                    </div> 
                  ) : ( 
                    displayGroups.map((group) => ( 
                      <div 
                        key={group.id} 
                        onClick={() => navigate(`/groups/${group.id}`)} 
                        className="bg-white rounded-[24px] p-6 flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-50" 
                      > 
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mr-4 text-slate-500 font-bold text-lg">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1"> 
                          <h4 className="text-lg font-bold text-slate-700 mb-1">{group.name}</h4> 
                          <div className="text-sm text-gray-400 font-medium"> 
                            {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''} 
                          </div> 
                        </div> 
 
                        <div className="text-right mr-8"> 
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"> 
                            Net Balance 
                          </div> 
                          {group.balance > 0 ? ( 
                            <div className="bg-slate-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"> 
                              YOU ARE OWED {group.currency}{group.balance.toFixed(2)} 
                            </div> 
                          ) : group.balance < 0 ? ( 
                            <div className="bg-[#CBE4FE] text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"> 
                              YOU OWE {group.currency}{Math.abs(group.balance).toFixed(2)} 
                            </div> 
                          ) : (
                            <div className="bg-gray-100 text-gray-400 text-xs font-bold px-4 py-1.5 rounded-full"> 
                              SETTLED UP 
                            </div> 
                          )} 
                        </div> 
 
                        <div 
                          className="flex items-center gap-4 pl-6 border-l border-gray-100" 
                          onClick={(e) => e.stopPropagation()} 
                        > 
                          <button 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              console.log('group.id:', group.id);  
                              const confirmed = window.confirm( 
                                `Are you sure you want to delete "${group.name}"? This cannot be undone.` 
                              ); 
                              if (!confirmed) return; 
                              try { 
                                await deleteGroup(group.id); 
                                fetchDashboardData(); 
                              } catch (err) { 
                                alert(`Could not delete group: ${err.message}`); 
                              } 
                            }} 
                            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          > 
                            <Trash2 size={18} /> 
                          </button> 
                          <button 
                            onClick={() => navigate(`/groups/${group.id}`)} 
                            className={`text-sm font-bold px-6 py-2.5 rounded-full transition-colors ${ 
                              group.balance !== 0 
                                ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            }`} 
                          > 
                            Settle Up 
                          </button> 
                        </div> 
                      </div> 
                    )) 
                  )} 
                </div> 
              </div> 
            )} 
          </main>

          {/* Shared footer */}
          <footer className="bg-slate-900 text-white text-center py-3 text-xs font-medium tracking-wide flex-shrink-0">
            © 2026 SplitWise
          </footer>
        </div>
      </div>
 
      {/* Modal */}
      {showModal && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-600/40 backdrop-blur-sm"> 
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"> 
 
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50"> 
              <h3 className="text-xl font-bold text-slate-700">Create New Group</h3> 
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-slate-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors" 
              > 
                <X size={20} /> 
              </button> 
            </div> 
 
            <form onSubmit={handleCreateSubmit} className="p-8"> 
              <div className="mb-8"> 
                <label className="block text-sm font-bold text-slate-600 mb-3"> 
                  Group Name 
                </label> 
                <input 
                  type="text" 
                  autoFocus 
                  required 
                  placeholder="e.g., Summer Trip 2025" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                  className="w-full px-5 py-4 rounded-2xl border-none bg-gray-50 focus:bg-gray-100 text-slate-700 font-medium focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                /> 
              </div> 
 
              <div className="flex gap-4"> 
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-5 py-4 text-slate-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors" 
                > 
                  Cancel 
                </button> 
                <button 
                  type="submit" 
                  disabled={isCreating} 
                  className="flex-1 px-5 py-4 text-white font-bold bg-slate-600 hover:bg-slate-500 rounded-2xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-md" 
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
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import groupService from '../services/groupService';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchGroups = async () => {
      try {
        const data = await groupService.getGroups(user.token);
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, navigate]);

  // Calculate overall balance across groups
  const calculateOverallBalance = () => {
    let totalBalance = 0;
    let youAreOwed = 0;
    let youOwe = 0;
    let owedGroupsCount = 0;
    let oweGroupsCount = 0;

    groups.forEach((group) => {
      const userBalanceRecord = group.balances.find((b) => b.user && b.user._id === user._id);
      if (userBalanceRecord) {
        const balance = userBalanceRecord.balance;
        totalBalance += balance;
        if (balance > 0) {
          youAreOwed += balance;
          owedGroupsCount++;
        } else if (balance < 0) {
          youOwe += Math.abs(balance);
          oweGroupsCount++;
        }
      }
    });

    return { totalBalance, youAreOwed, youOwe, owedGroupsCount, oweGroupsCount };
  };

  const { totalBalance, youAreOwed, youOwe, owedGroupsCount, oweGroupsCount } = calculateOverallBalance();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex justify-center items-center h-full">Loading...</div>
      ) : (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Total Balance</h3>
              <div className={`text-3xl font-bold mb-2 ${totalBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {totalBalance >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalBalance))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Are Owed</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(youAreOwed)}</div>
              <div className="text-xs font-medium text-gray-500">Across {owedGroupsCount} groups</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Owe</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(youOwe)}</div>
              <div className="text-xs font-medium text-gray-500">Across {oweGroupsCount} groups</div>
            </div>
          </div>

          {/* Active Groups Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Groups</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Create New Group
            </button>
          </div>

          {/* Groups List */}
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="p-5 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">No active groups</div>
            ) : (
              groups.map((group) => {
                const userBalanceRecord = group.balances.find((b) => b.user && b.user._id === user._id);
                const balance = userBalanceRecord ? userBalanceRecord.balance : 0;

                return (
                  <div key={group._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{group.title}</h4>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                          {group.members.length} members
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-8">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</div>
                      {balance > 0 ? (
                        <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">YOU ARE OWED {formatCurrency(balance)}</div>
                      ) : balance < 0 ? (
                        <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">YOU OWE {formatCurrency(Math.abs(balance))}</div>
                      ) : (
                        <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">SETTLED UP</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                      </button>
                      <button className={`${balance === 0 ? 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900 text-white'} text-sm font-medium px-5 py-2 rounded-lg transition-colors`}>
                        Settle Up
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;

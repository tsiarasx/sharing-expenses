import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import expenseService from '../services/expenseService';
import { AuthContext } from '../context/AuthContext';

const Overview = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchExpenses = async () => {
      try {
        const data = await expenseService.getExpenses(user.token);
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, navigate]);

  // Calculate totals
  const calculateTotals = () => {
    let totalSpending = 0;
    let youAreOwed = 0;
    let youOwe = 0;

    expenses.forEach((expense) => {
      // If the user paid
      if (expense.payer && expense.payer._id === user._id) {
        totalSpending += expense.amount;
        // Calculate how much others owe the user for this expense
        expense.participants.forEach((p) => {
          if (p.user && p.user._id !== user._id) {
            youAreOwed += p.amount;
          }
        });
      } else {
        // Someone else paid, see if user is a participant
        const userParticipant = expense.participants.find(
          (p) => p.user && p.user._id === user._id
        );
        if (userParticipant) {
          youOwe += userParticipant.amount;
        }
      }
    });

    return { totalSpending, youAreOwed, youOwe };
  };

  const { totalSpending, youAreOwed, youOwe } = calculateTotals();

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex justify-center items-center h-full">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase flex items-center justify-between">
                Total Spending
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalSpending)}</div>
              <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Active
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase flex items-center justify-between">
                You Are Owed
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-200">
                  <line x1="7" y1="7" x2="17" y2="17"></line>
                  <polyline points="17 7 17 17 7 17"></polyline>
                </svg>
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(youAreOwed)}</div>
              <div className="text-xs font-medium text-gray-500">From shared expenses</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase flex items-center justify-between">
                You Owe
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-200">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </h3>
              <div className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(youOwe)}</div>
              {youOwe > 0 && <div className="text-xs font-medium text-gray-500 bg-red-100 text-red-800 px-2 py-0.5 rounded-full inline-block mt-1">Settle now</div>}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm font-medium text-blue-700 hover:text-blue-800">View all history</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {expenses.length === 0 ? (
              <div className="p-5 text-center text-gray-500">No recent activity</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {expenses.map((expense) => {
                  const isPayer = expense.payer && expense.payer._id === user._id;
                  let amountInvolved = 0;

                  if (isPayer) {
                    // How much others owe user for this expense
                     expense.participants.forEach((p) => {
                       if (p.user && p.user._id !== user._id) {
                         amountInvolved += p.amount;
                       }
                     });
                  } else {
                     // How much user owes for this expense
                     const userParticipant = expense.participants.find(p => p.user && p.user._id === user._id);
                     if (userParticipant) {
                       amountInvolved = userParticipant.amount;
                     }
                  }

                  return (
                    <div key={expense._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{expense.description}</h4>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {isPayer ? 'You paid' : `${expense.payer?.name || 'Someone'} paid`} {formatCurrency(expense.amount)} • {formatDate(expense.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isPayer ? 'text-green-600' : 'text-red-600'}`}>
                          {isPayer ? 'You lent' : 'You owe'} {formatCurrency(amountInvolved)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Overview;

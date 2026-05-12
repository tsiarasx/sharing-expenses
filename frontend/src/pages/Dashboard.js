import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-blue-700 bg-blue-50/50 rounded-lg relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-full"></div>
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
          <h2 className="text-xl font-semibold text-blue-800">Groups</h2>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <Link to="/profile" className="block w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <img src="https://ui-avatars.com/api/?name=Alex+Thompson&background=random" alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Total Balance</h3>
              <div className="text-3xl font-bold text-blue-700 mb-2">$1,240.50</div>
              <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                8% from last month
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Are Owed</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">$1,450.00</div>
              <div className="text-xs font-medium text-gray-500">Across 4 groups</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">You Owe</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">$209.50</div>
              <div className="text-xs font-medium text-gray-500">Across 2 groups</div>
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
            {/* Group 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="9" y1="22" x2="15" y2="22"></line>
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="8" y1="10" x2="16" y2="10"></line>
                  <line x1="8" y1="14" x2="16" y2="14"></line>
                  <line x1="8" y1="18" x2="16" y2="18"></line>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">Apartment Rent</h4>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=A+B&background=random" alt="Member" />
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=C+D&background=random" alt="Member" />
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=E+F&background=random" alt="Member" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">+2</span>
                </div>
              </div>
              <div className="text-right mr-8">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</div>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">YOU ARE OWED $420.00</div>
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
                <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                  Settle Up
                </button>
              </div>
            </div>

            {/* Group 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 mr-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
                  <path d="M4 8v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"></path>
                  <circle cx="8" cy="15" r="1.5"></circle>
                  <circle cx="16" cy="15" r="1.5"></circle>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">Road Trip - West Coast</h4>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=A+B&background=random" alt="Member" />
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=C+D&background=random" alt="Member" />
                  </div>
                </div>
              </div>
              <div className="text-right mr-8">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</div>
                <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">YOU OWE $85.50</div>
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
                <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                  Settle Up
                </button>
              </div>
            </div>

            {/* Group 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-500 mr-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                  <path d="M7 2v20"></path>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">Dinner Party - Friday</h4>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=A+B&background=random" alt="Member" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">+4</span>
                </div>
              </div>
              <div className="text-right mr-8">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</div>
                <div className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">SETTLED UP</div>
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
                <button className="bg-white border border-gray-200 text-gray-400 text-sm font-medium px-5 py-2 rounded-lg cursor-not-allowed">
                  Settle Up
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

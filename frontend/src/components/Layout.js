import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg relative ${
              location.pathname === '/'
                ? 'text-blue-700 bg-blue-50/50'
                : 'text-gray-600 hover:bg-gray-100 transition-colors'
            }`}
          >
            {location.pathname === '/' && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-full"></div>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link
            to="/groups"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg relative ${
              location.pathname === '/groups'
                ? 'text-blue-700 bg-blue-50/50'
                : 'text-gray-600 hover:bg-gray-100 transition-colors'
            }`}
          >
            {location.pathname === '/groups' && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-full"></div>
            )}
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
          <h2 className="text-xl font-semibold text-blue-800">
            {location.pathname === '/' ? 'Overview' : 'Groups'}
          </h2>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <Link to="/profile" className="block w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-300 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

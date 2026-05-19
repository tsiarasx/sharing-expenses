import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Profile = () => {
  const { user, updateProfile, deleteAccount, logout } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, password });
      setMessage('Profile updated successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      setMessage('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleSignOut = () => {
    if(logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-blue-800">SplitWise</h1>
          <p className="text-xs text-gray-600 mt-1">Manage shared expenses</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link to="/?tab=overview" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link to="/?tab=groups" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium text-sm">Groups</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <h2 className="text-xl font-semibold text-blue-800">Settings</h2>
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="block w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-300 ring-2 ring-blue-100 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">

          {message && <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 text-sm max-w-4xl">{message}</div>}
          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm max-w-4xl">{error}</div>}

          <div className="flex gap-8 max-w-5xl">
            {/* Left Col - Sign Out */}
            <div className="w-64">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Right Col - Personal Details */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Full Name */}
                <div className="flex items-start justify-between py-4 border-b border-gray-100">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-900">Full Name</label>
                    <p className="text-xs text-gray-500 mt-1">Displayed on your groups</p>
                  </div>
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none border-b border-transparent focus:border-gray-300 py-1"
                      placeholder="Alex Thompson"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start justify-between py-4 border-b border-gray-100">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-900">Email Address</label>
                    <p className="text-xs text-gray-500 mt-1">Used for login and notifications</p>
                  </div>
                  <div className="w-1/2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none border-b border-transparent focus:border-gray-300 py-1"
                      placeholder="alex.t@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex items-start justify-between py-4 border-b border-gray-100 mb-8">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-900">Password</label>
                    <p className="text-xs text-gray-500 mt-1">Secure your account</p>
                  </div>
                  <div className="w-1/2">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none tracking-widest border-b border-transparent focus:border-gray-300 py-1"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 mt-8">
                  <button type="button" onClick={() => {setName(user?.name||''); setEmail(user?.email||''); setPassword('');}} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                    Discard Changes
                  </button>
                  <button type="submit" className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button type="button" onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                   Delete Account Permanently
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;

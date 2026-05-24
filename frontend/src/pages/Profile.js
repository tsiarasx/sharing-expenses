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
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setMessage('Profile updated successfully');
      setError('');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const apiDetails = err.response?.data?.details;
      const status = err.response?.status;
      setError(
        apiDetails
          ? `${apiMessage} (${apiDetails})`
          : apiMessage || `Update failed${status ? ` (HTTP ${status})` : ''}`
      );
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
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] font-sans">
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 44px)' }}>
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col pt-10 pb-6 rounded-r-3xl my-2 ml-2 shadow-sm flex-shrink-0">
          <div className="px-8 mb-10 flex items-center gap-3">
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
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-400 hover:text-slate-700 hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              Dashboard
            </Link>

            <Link
              to="/?tab=groups"
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-400 hover:text-slate-700 hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Groups
            </Link>

          </nav>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-8">
          <header className="h-24 flex items-center justify-between pt-6 pb-2 flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold text-slate-700 tracking-tight">Profile Settings</h2>
              <p className="text-sm text-gray-400 font-medium mt-1">Manage your account details and security.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <NotificationBell />
              </div>
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-8 pt-4 custom-scrollbar">
            {message && (
              <div className="mb-5 text-green-700 bg-green-50 px-4 py-3 rounded-2xl border border-green-100 text-sm max-w-5xl">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-5 text-red-700 bg-red-50 px-4 py-3 rounded-2xl border border-red-100 text-sm max-w-5xl">
                {error}
              </div>
            )}

            <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 h-fit">
                <h3 className="text-base font-bold text-slate-700 mb-4">Account</h3>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full mt-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete Account Permanently
                </button>
              </div>

              <div className="lg:col-span-2 bg-white rounded-[24px] p-7 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-700">Personal Details</h3>
                  <p className="text-sm text-gray-400 mt-1">Keep your profile info up to date.</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-100 px-4 py-3 outline-none focus:border-slate-300"
                      placeholder="Alex Thompson"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-100 px-4 py-3 outline-none focus:border-slate-300"
                      placeholder="alex.t@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-100 px-4 py-3 outline-none focus:border-slate-300"
                      placeholder="Leave empty to keep current password"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setName(user?.name || '');
                        setEmail(user?.email || '');
                        setPassword('');
                      }}
                      className="text-sm font-semibold text-gray-500 hover:text-slate-700 px-4 py-2"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;

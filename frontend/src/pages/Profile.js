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
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              Dashboard
            </Link>

            <Link
              to="/?tab=groups"
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-400 hover:text-slate-700 hover:bg-gray-50"
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-24 flex items-center justify-between pt-6 pb-2 px-10 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-700 tracking-tight">Settings</h2>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <NotificationBell />
              </div>
              <div className="block w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-gray-300 ring-2 ring-slate-100 text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-10">
            {message && <div className="mb-6 text-[#3D8A55] bg-[#E4F2E8] p-4 rounded-xl text-sm font-semibold max-w-5xl shadow-sm border border-[#C2E0CB]">{message}</div>}
            {error && <div className="mb-6 text-[#D9527A] bg-[#FDE8EF] p-4 rounded-xl text-sm font-semibold max-w-5xl shadow-sm border border-[#F8CEDB]">{error}</div>}

            <div className="flex gap-8 max-w-5xl">
              <div className="w-72">
                <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col gap-4">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FDE8EF] text-[#D9527A] rounded-xl hover:bg-[#F8CEDB] transition-colors font-bold text-sm shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign Out
                  </button>
                  
                  <button type="button" onClick={handleDelete} className="w-full text-xs font-bold text-gray-400 hover:text-red-500 transition-colors mt-2">
                    Delete Account Permanently
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-[32px] shadow-sm p-8">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-700">Personal Details</h3>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="flex items-start justify-between py-4 border-b border-gray-100">
                    <div className="w-1/3">
                      <label className="block text-sm font-bold text-slate-700">Full Name</label>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Displayed on your groups</p>
                    </div>
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none border-b-2 border-transparent focus:border-slate-400 py-1 transition-colors"
                        placeholder="Alex Thompson"
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between py-4 border-b border-gray-100">
                    <div className="w-1/3">
                      <label className="block text-sm font-bold text-slate-700">Email Address</label>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Used for login and notifications</p>
                    </div>
                    <div className="w-1/2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none border-b-2 border-transparent focus:border-slate-400 py-1 transition-colors"
                        placeholder="alex.t@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between py-4 border-b border-gray-100 mb-8">
                    <div className="w-1/3">
                      <label className="block text-sm font-bold text-slate-700">Password</label>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Secure your account</p>
                    </div>
                    <div className="w-1/2">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none tracking-widest border-b-2 border-transparent focus:border-slate-400 py-1 transition-colors"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 mt-8">
                    <button type="button" onClick={() => {setName(user?.name||''); setEmail(user?.email||''); setPassword('');}} className="text-sm font-bold text-gray-400 hover:text-slate-700 px-4 py-2 transition-colors">
                      Discard Changes
                    </button>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <footer className="bg-slate-900 text-white text-center py-3 text-xs font-medium tracking-wide flex-shrink-0">
        © 2026 SplitWise
      </footer>
    </div>
  );
};

export default Profile;
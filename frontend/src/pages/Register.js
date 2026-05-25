import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-full overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <section className="bg-[#EAEFF5] px-7 py-8 sm:px-10 sm:py-12 lg:min-h-[640px] lg:rounded-r-[44px]">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                  <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                  <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                </div>
                <h1 className="text-xl font-bold text-slate-700">SplitWise</h1>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-700 sm:text-4xl">
                Create your account
              </h2>
              <p className="mt-3 max-w-sm text-sm font-medium text-slate-500">
                Join your groups and manage shared costs with the same clean interface as the dashboard.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-[#d6e0ec] bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                  Create and manage group expenses from one place.
                </div>
                <div className="rounded-2xl border border-[#d6e0ec] bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                  Know instantly who owes and who is owed.
                </div>
                <div className="rounded-2xl border border-[#d6e0ec] bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                  Keep every settlement transparent for everyone.
                </div>
              </div>
            </section>

            <section className="px-7 py-8 sm:px-10 sm:py-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-7 flex rounded-2xl bg-slate-100 p-1">
                  <Link
                    to="/login"
                    className="flex-1 rounded-xl py-2 text-center text-sm font-semibold text-gray-500 transition-colors hover:text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 rounded-xl bg-white py-2 text-center text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-700">Sign up</h3>
                  <p className="mt-1 text-sm font-medium text-gray-400">
                    Get started with your first group in minutes.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-800 outline-none transition-colors focus:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-800 outline-none transition-colors focus:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-slate-300 ${showPassword ? '' : 'tracking-widest'}`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-500"
                  >
                    Sign Up
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

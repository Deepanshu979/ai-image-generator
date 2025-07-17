import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Navbar from '../layouts/Navbar';
import Toast from '../components/ui/toast';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/generate', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowToast(false);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      navigate('/generate');
    } catch (err) {
      setError(err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#121416] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type="error" />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Login to your account</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-0 w-full max-w-[480px] mx-auto">
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Email</p>
                  <div className="relative flex items-center">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal pr-10"
                    />
                    <span className="absolute right-3 h-6 w-6" aria-hidden="true"></span>
                  </div>
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Password</p>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-[#a2abb3] hover:text-white focus:outline-none flex items-center justify-center h-6 w-6"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>
              </div>
              <div className="flex px-4 py-3">
                <Button type="submit" className="flex min-w-[84px] max-w-[480px] rounded-full h-12 px-5 flex-1 bg-[#dce8f3] text-[#121416] text-base font-bold leading-normal tracking-[0.015em]" disabled={loading}>
                  <span className="truncate">{loading ? 'Logging in...' : 'Login'}</span>
                </Button>
              </div>
            </form>
            <div className="text-center text-sm mt-2 text-white">
              Don&apos;t have an account?{' '}
              <span className="text-blue-400 cursor-pointer underline" onClick={() => navigate('/register')}>
                Register
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
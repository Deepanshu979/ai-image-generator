import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Navbar from '../layouts/Navbar';
import Toast from '../components/ui/toast';
import { Eye, EyeOff, Chrome, Github } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle token from OAuth redirect
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const uid = params.get('uid');
    if (token) {
      localStorage.setItem('token', token);
      if (uid) localStorage.setItem('userId', uid);
      navigate('/generate', { replace: true });
      return;
    }
  }, [location.search, navigate]);

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
      if (data.user && data.user._id) {
        localStorage.setItem('userId', data.user._id);
      }
      navigate('/generate');
    } catch (err) {
      setError(err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const oauthBase = process.env.REACT_APP_API_URL;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type="error" />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-2 sm:px-4 md:px-10 flex flex-1 justify-center py-3 md:py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[400px] md:max-w-[512px] py-4 md:py-5 flex-1">
            <h2 className="text-white tracking-light text-xl sm:text-2xl md:text-[28px] font-bold leading-tight px-2 md:px-4 text-center pb-2 md:pb-3 pt-4 md:pt-5">Login to your account</h2>
            <div className="flex flex-col gap-2 px-2 md:px-4">
              <a href={`${oauthBase}/api/auth/google`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] text-white px-4 py-3 w-full transition-colors">
                <Chrome className="w-4 h-4 text-[#84c1ff]" /> Continue with Google
              </a>
              <a href={`${oauthBase}/api/auth/github`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] text-white px-4 py-3 w-full transition-colors">
                <Github className="w-4 h-4" /> Continue with GitHub
              </a>
            </div>
            <div className="text-[#9cabba] text-xs text-center py-2">or</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-0 w-full max-w-[360px] md:max-w-[480px] mx-auto">
              <div className="flex flex-col gap-2 px-2 md:px-4 py-2 md:py-3">
                <label className="flex flex-col min-w-0 flex-1">
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
              <div className="flex flex-col gap-2 px-2 md:px-4 py-2 md:py-3">
                <label className="flex flex-col min-w-0 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Password</p>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="form-input flex w/full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal pr-10"
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
              <div className="flex px-2 md:px-4 py-2 md:py-3">
                <Button type="submit" className="flex min-w-[84px] max-w-[480px] rounded-full h-10 md:h-12 px-4 md:px-5 flex-1 bg-[#dce8f3] text-[#121416] text-sm md:text-base font-bold leading-normal tracking-[0.015em]" disabled={loading}>
                  <span className="truncate">{loading ? 'Logging in...' : 'Login'}</span>
                </Button>
              </div>
            </form>
            <div className="text-center text-xs sm:text-sm mt-2 text-white">
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
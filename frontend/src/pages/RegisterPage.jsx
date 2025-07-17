import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import Navbar from '../layouts/Navbar';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/generate', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required.');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Registration successful! You can now log in.');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#121416] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <Toast message={success} show={showToast} onClose={() => setShowToast(false)} type="success" />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Create your account</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-0 w-full max-w-[480px] mx-auto">
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Username</p>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Email</p>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Password</p>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-white text-base font-medium leading-normal pb-2">Confirm password</p>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3135] focus:border-none h-14 placeholder:text-[#a2abb3] p-4 text-base font-normal leading-normal"
                  />
                </label>
              </div>
              {error && <div className="text-red-400 text-sm text-center pb-2">{error}</div>}
              <div className="flex px-4 py-3">
                <Button type="submit" className="flex min-w-[84px] max-w-[480px] rounded-full h-12 px-5 flex-1 bg-[#dce8f3] text-[#121416] text-base font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">{loading ? 'Registering...' : 'Sign up'}</span>
                </Button>
              </div>
            </form>
            <p className="text-[#a2abb3] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
            <div className="text-center text-sm mt-2 text-white">
              Already have an account?{' '}
              <span className="text-blue-400 cursor-pointer underline" onClick={() => navigate('/login')}>
                Login
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
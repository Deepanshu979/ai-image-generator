import React, { useEffect, useState } from 'react';
import Navbar from '../layouts/Navbar';
import { Avatar } from '../components/ui/avatar';
import { Heart, Image as ImageIcon, Mail, Pencil, Sparkles, UploadCloud, User } from 'lucide-react';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load profile');
        
        console.log('Profile data received:', data.user); // Debug log
        console.log('Avatar URL:', data.user?.avatar); // Debug avatar URL
        
        setUser(data.user);
        setName(data.user?.username || data.user?.name || '');
        setEmail(data.user?.email || '');
        
        // Use proxy for Google avatars to avoid CORS issues
        let avatarUrl = data.user?.avatar || '';
        console.log('Original avatar URL:', avatarUrl);
        
        if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
          avatarUrl = `${process.env.REACT_APP_API_URL}/api/auth/profile/avatar-proxy?url=${encodeURIComponent(avatarUrl)}`;
          console.log('Proxied avatar URL:', avatarUrl);
        }
        setAvatarPreview(avatarUrl);
        console.log('Avatar preview state set to:', avatarUrl);
      } catch (err) {
        console.error('Profile fetch error:', err); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Debug avatar preview changes
  useEffect(() => {
    console.log('Avatar preview changed to:', avatarPreview);
  }, [avatarPreview]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update profile');
      setUser(data.user);
      setSuccess('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to upload avatar');
      setUser(data.user);
      setAvatarPreview(data.user?.avatar || avatarPreview);
      setAvatarFile(null);
      setSuccess('Avatar updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />

      <Navbar />

      <section className="px-6 md:px-12 lg:px-40 pt-8 md:pt-12 pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#223042] bg-[#121b25] px-4 py-2 text-[#9cabba] text-xs mb-5">
          <Sparkles className="w-4 h-4 text-[#84c1ff]" />
          <span>Your profile</span>
        </div>

        <div className="max-w-[960px] mx-auto flex flex-col gap-4">
          {/* Profile header card */}
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="flex items-center gap-4">
                             {/* Avatar preview */}
               <div className="relative">
                 {avatarPreview ? (
                   <img 
                     src={avatarPreview} 
                     alt="Avatar" 
                     className="w-16 h-16 rounded-full object-cover border border-[#223042]"
                     onError={(e) => {
                       console.log('Avatar image failed to load:', avatarPreview);
                       console.log('Error details:', e.target.error);
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'block';
                     }}
                     onLoad={(e) => {
                       console.log('Avatar image loaded successfully:', avatarPreview);
                       // Hide the fallback avatar when image loads successfully
                       e.target.nextSibling.style.display = 'none';
                     }}
                     crossOrigin="anonymous"
                   />
                 ) : null}
                 <Avatar 
                   username={name || 'User'} 
                   size={64} 
                   style={{ display: avatarPreview ? 'none' : 'block' }}
                 />
               </div>
              <div>
                <div className="text-white text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-[#84c1ff]" /> {name || '—'}
                </div>
                <div className="text-[#9cabba] text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {email || '—'}
                </div>
              </div>
            </div>

            {/* Avatar upload controls */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="block w-full text-sm text-[#c6d3df] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#283039] file:text-white hover:file:bg-[#314c68]"
              />
              <button
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar || !avatarFile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-4 py-2 transition-colors disabled:opacity-60"
              >
                <UploadCloud className="w-4 h-4" /> {uploadingAvatar ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Edit display name */}
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-2">Edit profile</div>
            <label className="text-[#c6d3df] text-sm">Display name</label>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 h-11 rounded-xl bg-[#0f1720] border border-[#223042] px-3 text-white placeholder:text-[#6c7a86] focus:outline-none focus:ring-2 focus:ring-[#0c7ff2]/40"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-4 py-2 transition-colors disabled:opacity-60"
              >
                <Pencil className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
            {success && <div className="text-green-400 text-sm mt-2">{success}</div>}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-2">Quick actions</div>
            <div className="flex flex-col gap-3">
              <a href="/liked" className="rounded-xl bg-[#101923] border border-[#223042] hover:border-[#2d3e53] p-4 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#ff8892]/20 text-[#ff8892] flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-semibold">Liked Photos</div>
                  <div className="text-[#9cabba] text-xs">View the images you’ve liked</div>
                </div>
              </a>

              <a href="/generate" className="rounded-xl bg-[#101923] border border-[#223042] hover:border-[#2d3e53] p-4 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#84c1ff]/20 text-[#84c1ff] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-semibold">Create new</div>
                  <div className="text-[#9cabba] text-xs">Generate new images from prompts</div>
                </div>
              </a>
            </div>
          </div>

          {/* Info sections */}
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-2">Account</div>
            <ul className="text-[#9cabba] text-sm space-y-2 list-disc pl-5">
              <li>Private by default; you control sharing</li>
              <li>Secure authentication</li>
              <li>Version history for your creations</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-2">Tips</div>
            <ul className="text-[#9cabba] text-sm space-y-2 list-disc pl-5">
              <li>Use detailed prompts for best results</li>
              <li>Try Image‑to‑Image to remix styles</li>
              <li>Like your favorites to find them later fast</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage; 
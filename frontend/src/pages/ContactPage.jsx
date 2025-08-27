import React from 'react';
import Navbar from '../layouts/Navbar';
import { Mail, MessageSquare, MapPin, Phone, Sparkles, Send, Github, Linkedin } from 'lucide-react';
import Toast from '../components/ui/toast';

const ContactPage = () => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });

  const validateEmail = (val) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(val);

  React.useEffect(() => {
    if (toast.show && toast.type === 'success') {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ show: true, message: 'Please enter your name.', type: 'error' });
      return;
    }
    if (!validateEmail(email)) {
      setToast({ show: true, message: 'Please enter a valid email.', type: 'error' });
      return;
    }
    if (message.trim().length < 10) {
      setToast({ show: true, message: 'Message should be at least 10 characters.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      let data;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message.');
      }
      setToast({ show: true, message: data?.message || 'Thanks! We received your message and will respond shortly.', type: 'success' });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to send message. Please try again later.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      {/* Decorative */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />

      <Navbar />
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-40 pt-14 md:pt-20 pb-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#223042] bg-[#121b25] px-4 py-2 text-[#9cabba] text-xs mb-5">
            <Sparkles className="w-4 h-4 text-[#84c1ff]" />
            <span>We’d love to hear from you</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">Contact our team</h1>
          <p className="text-[#9cabba] text-base md:text-lg mt-4">Questions, feedback, or partnership ideas? Send us a note and we’ll get back within 1–2 business days.</p>
        </div>
      </section>

      {/* Info + Form */}
      <section className="px-6 md:px-12 lg:px-40 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a className="rounded-2xl bg-[#121b25] border border-[#223042] p-6 hover:border-[#2d3e53] transition-colors" href="mailto:bdeepanshu.010@gmail.com" target="_blank" rel="noreferrer">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><Mail className="w-4 h-4 text-[#84c1ff]" /> Email</div>
            <div className="text-[#9cabba] text-sm">bdeepanshu.010@gmail.com</div>
          </a>
          <a className="rounded-2xl bg-[#121b25] border border-[#223042] p-6 hover:border-[#2d3e53] transition-colors" href="tel:+919872155888">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><Phone className="w-4 h-4 text-[#84c1ff]" /> Phone</div>
            <div className="text-[#9cabba] text-sm">9872155888</div>
          </a>
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><MapPin className="w-4 h-4 text-[#84c1ff]" /> Address</div>
            <div className="text-[#9cabba] text-sm">Bangalore, India</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#84c1ff]" /> Send a message</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[#c6d3df] text-sm">Your name</span>
                <input
                  type="text"
                  className="h-11 rounded-xl bg-[#0f1720] border border-[#223042] px-3 text-white placeholder:text-[#6c7a86] focus:outline-none focus:ring-2 focus:ring-[#0c7ff2]/40"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[#c6d3df] text-sm">Email</span>
                <input
                  type="email"
                  className="h-11 rounded-xl bg-[#0f1720] border border-[#223042] px-3 text-white placeholder:text-[#6c7a86] focus:outline-none focus:ring-2 focus:ring-[#0c7ff2]/40"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[#c6d3df] text-sm">Message</span>
                <textarea
                  rows={5}
                  className="rounded-xl bg-[#0f1720] border border-[#223042] px-3 py-2 text-white placeholder:text-[#6c7a86] focus:outline-none focus:ring-2 focus:ring-[#0c7ff2]/40"
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-5 py-3 transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
          <div className="rounded-2xl bg-[#0e1a26] border border-[#223042] p-6">
            <div className="text-white font-semibold mb-2">Other ways to connect</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <a href="https://www.linkedin.com/in/deepanshubatra/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] p-4 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0a66c2]/20 text-[#0a66c2] flex items-center justify-center">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">LinkedIn</div>
                  <div className="text-[#9cabba] text-xs">@deepanshubatra</div>
                </div>
              </a>
              <a href="https://github.com/Deepanshu979" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] p-4 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/5 text-white flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">GitHub</div>
                  <div className="text-[#9cabba] text-xs">@Deepanshu979</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 
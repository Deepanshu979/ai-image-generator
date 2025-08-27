const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// Basic in-memory cooldown per IP (5 requests/hour)
const ipBuckets = new Map();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || [];
  const recent = bucket.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  ipBuckets.set(ip, recent);
  return false;
}

router.post('/', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many messages. Please try again later.' });
    }

    const { name, email, message } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!email || !emailRegex.test(email)) return res.status(400).json({ error: 'Valid email is required.' });
    if (!message || message.trim().length < 10) return res.status(400).json({ error: 'Message should be at least 10 characters.' });

    // SMTP configuration
    const SEND_TO = process.env.CONTACT_SEND_TO || 'bdeepanshu.010@gmail.com';
    const HOST = process.env.SMTP_HOST;
    const PORT = process.env.SMTP_PORT;
    const USER = process.env.SMTP_USER;
    const PASS = process.env.SMTP_PASS;
    // For SendGrid, CONTACT_FROM must be a verified sender or domain
    const RAW_FROM = process.env.CONTACT_FROM || process.env.CONTACT_SEND_TO || USER;
    const FROM = `Visionary AI <${RAW_FROM}>`;

    if (!HOST || !PORT || !USER || !PASS) {
      console.warn('Contact email not sent: SMTP env vars missing.');
      return res.status(503).json({ error: 'Email service is not configured. Please try again later.' });
    }

    const transporter = nodemailer.createTransport({
      host: HOST,
      port: Number(PORT),
      secure: Number(PORT) === 465,
      auth: { user: USER, pass: PASS }
    });

    // Verify SMTP connection/credentials
    try {
      await transporter.verify();
    } catch (verr) {
      console.error('SMTP verify failed:', verr);
      return res.status(502).json({ error: 'Email service not available. Please try again later.' });
    }

    const info = await transporter.sendMail({
      from: FROM,
      to: SEND_TO,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br/>')}</p>`
    });

    // Log accepted/rejected for diagnostics
    console.log('Contact email sent:', {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected
    });

    return res.json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Contact send error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router; 
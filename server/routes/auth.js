const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const fetch = require('node-fetch');

const router = express.Router();

// Configure Cloudinary (relies on env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Passport strategies
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_REDIRECT_URI || '/api/auth/google/callback';
const GITHUB_CALLBACK_URL = process.env.GITHUB_REDIRECT_URI || '/api/auth/github/callback';

async function findOrCreateOAuthUser({ provider, providerId, email, username, avatar }) {
  console.log('OAuth user lookup:', { provider, providerId, email, username, avatar });
  
  let user = null;
  
  // First, try to find by email (most reliable)
  if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
    console.log('Found user by email:', user ? { id: user._id, username: user.username, email: user.email } : 'Not found');
  }
  
  // If no user found by email, create a new user
  if (!user) {
    console.log('Creating new OAuth user');
    
    // Generate a unique username
    let baseUsername = (username || `${provider}_${providerId}`).toLowerCase().replace(/\s+/g, '');
    let uniqueUsername = baseUsername;
    let counter = 1;
    
    // Check if username exists and generate a unique one
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}${counter}`;
      counter++;
    }
    
    user = new User({
      username: uniqueUsername,
      email: (email || `${provider}_${providerId}@example.com`).toLowerCase(),
      password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      avatar: avatar || ''
    });
    await user.save();
    console.log('New OAuth user created:', { id: user._id, username: user.username, email: user.email });
  } else {
    // Update existing user with latest OAuth information
    console.log('Updating existing OAuth user');
    const updates = {};
    
    // Update username if different (case-insensitive comparison) and not conflicting
    if (username && user.username.toLowerCase() !== username.toLowerCase()) {
      // Check if the new username is available
      const existingUserWithUsername = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: user._id } // Exclude current user
      });
      
      if (!existingUserWithUsername) {
        updates.username = username.toLowerCase();
        console.log('Updating username from', user.username, 'to', username.toLowerCase());
      } else {
        console.log('Username', username.toLowerCase(), 'already taken, keeping current username:', user.username);
      }
    }
    
    // Update email if different (shouldn't happen but just in case)
    if (email && user.email.toLowerCase() !== email.toLowerCase()) {
      updates.email = email.toLowerCase();
      console.log('Updating email from', user.email, 'to', email.toLowerCase());
    }
    
    // Update avatar if different
    if (avatar && user.avatar !== avatar) {
      updates.avatar = avatar;
      console.log('Updating avatar from', user.avatar, 'to', avatar);
    }
    
    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      console.log('OAuth user updated:', { id: user._id, username: user.username, email: user.email, avatar: user.avatar });
    } else {
      console.log('No updates needed for OAuth user');
    }
  }
  return user;
}

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasGitHub = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

if (hasGoogle) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const username = profile.displayName || profile.name?.givenName || profile.name?.familyName || profile.id;
      let avatar = profile.photos?.[0]?.value;
      
      // Fix Google avatar URL to get higher resolution and remove size restrictions
      if (avatar && avatar.includes('googleusercontent.com')) {
        // Remove size parameters and get original size
        avatar = avatar.replace(/=s\d+-c$/, '');
        avatar = avatar.replace(/=s\d+$/, '');
        // Add size parameter for better compatibility
        avatar = avatar + '=s400-c';
        console.log('Google avatar URL processed:', avatar);
      }
      
      console.log('Google profile data:', {
        id: profile.id,
        email,
        username,
        avatar,
        photos: profile.photos?.map(p => p.value)
      });
      
      const user = await findOrCreateOAuthUser({ provider: 'google', providerId: profile.id, email, username, avatar });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

if (hasGitHub) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value; // may be undefined if private
      const username = profile.username || profile.displayName || profile.id;
      const avatar = profile.photos?.[0]?.value;
      const user = await findOrCreateOAuthUser({ provider: 'github', providerId: profile.id, email, username, avatar });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

function issueTokenAndRedirect(req, res) {
  const user = req.user;
  console.log('OAuth login successful for user:', {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar
  });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const redirectUrl = `${FRONTEND_URL}/login?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(user._id.toString())}`;
  return res.redirect(redirectUrl);
}

// OAuth routes (guarded)
if (hasGoogle) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), issueTokenAndRedirect);
} else {
  router.get('/google', (req, res) => res.status(503).json({ error: 'Google OAuth not configured' }));
  router.get('/google/callback', (req, res) => res.status(503).json({ error: 'Google OAuth not configured' }));
}

if (hasGitHub) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), issueTokenAndRedirect);
} else {
  router.get('/github', (req, res) => res.status(503).json({ error: 'GitHub OAuth not configured' }));
  router.get('/github/callback', (req, res) => res.status(503).json({ error: 'GitHub OAuth not configured' }));
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists (optimized single query)
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    }).select('email username');

    if (existingUser) {
      const error = existingUser.email === email.toLowerCase() 
        ? 'Email already registered' 
        : 'Username already taken';
      return res.status(400).json({ error });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' ? 'Email already registered' : 'Username already taken';
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email and update lastLogin in one operation
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, preferences } = req.body;
    const updates = {};

    // Check for conflicts in a single query if both username and email are being updated
    if (username || email) {
      const conflictQuery = {
        _id: { $ne: req.user._id }
      };
      
      if (username) conflictQuery.username = username.toLowerCase();
      if (email) conflictQuery.email = email.toLowerCase();
      
      const existingUser = await User.findOne(conflictQuery).select('email username');
      
      if (existingUser) {
        if (username && existingUser.username === username.toLowerCase()) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        if (email && existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ error: 'This email is already registered' });
        }
      }
    }

    if (username) {
      updates.username = username.toLowerCase();
    }

    if (email) {
      updates.email = email.toLowerCase();
    }

    if (preferences) {
      updates.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' ? 'This email is already registered' : 'Username already taken';
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Proxy avatar image to handle CORS issues
router.get('/profile/avatar-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter required' });
    
    console.log('Avatar proxy called with URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch image, status:', response.status);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('Avatar proxy successful, content-type:', contentType, 'size:', buffer.byteLength);
    
    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Avatar proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy avatar' });
  }
});

// Upload/Update avatar
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No avatar file provided' });

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avatars', resource_type: 'image', transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploadResult.secure_url },
      { new: true, select: '-password' }
    );

    return res.json({ message: 'Avatar updated', user });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Verify current password
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user credits
router.get('/credits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits subscription');
    res.json({
      credits: user.credits,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
});

// Add credits (for testing/admin purposes)
router.post('/add-credits', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const user = await User.findById(req.user._id);
    user.credits += amount;
    await user.save();

    res.json({
      message: 'Credits added successfully',
      credits: user.credits
    });

  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
});

module.exports = router; 
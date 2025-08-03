const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

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
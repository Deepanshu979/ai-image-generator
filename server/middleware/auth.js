const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

const checkCredits = (requiredCredits = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      if (req.user.credits < requiredCredits) {
        return res.status(402).json({ 
          error: 'Insufficient credits.',
          required: requiredCredits,
          available: req.user.credits
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Credit check failed.' });
    }
  };
};

const deductCredits = (creditsToDeduct = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }

      const user = await User.findById(req.user._id);
      user.credits -= creditsToDeduct;
      await user.save();
      
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Failed to deduct credits.' });
    }
  };
};

module.exports = {
  auth,
  optionalAuth,
  checkCredits,
  deductCredits
}; 
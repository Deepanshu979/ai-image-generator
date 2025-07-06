const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  model: {
    type: String,
    required: true,
    enum: ['openai-dall-e-3', 'stable-diffusion', 'midjourney', 'custom']
  },
  settings: {
    width: {
      type: Number,
      default: 1024
    },
    height: {
      type: Number,
      default: 1024
    },
    quality: {
      type: String,
      enum: ['standard', 'hd'],
      default: 'standard'
    },
    style: {
      type: String,
      default: 'vivid'
    }
  },
  metadata: {
    generationId: String,
    processingTime: Number,
    tokensUsed: Number,
    cost: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downloads: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
imageSchema.index({ user: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ status: 1 });

module.exports = mongoose.model('Image', imageSchema); 
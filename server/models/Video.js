const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
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
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }],
  settings: {
    duration: {
      type: Number,
      default: 5 // seconds
    },
    fps: {
      type: Number,
      default: 30
    },
    transition: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'none'],
      default: 'fade'
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    resolution: {
      width: {
        type: Number,
        default: 1920
      },
      height: {
        type: Number,
        default: 1080
      }
    }
  },
  metadata: {
    processingTime: Number,
    fileSize: Number,
    format: String,
    codec: String
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
  views: {
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
videoSchema.index({ user: 1, createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ status: 1 });

module.exports = mongoose.model('Video', videoSchema); 
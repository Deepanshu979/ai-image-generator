const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const Image = require('../models/Image');
const { auth, checkCredits, deductCredits } = require('../middleware/auth');
const videoService = require('../services/videoService');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Create video from images
router.post('/create', auth, checkCredits(2), deductCredits(2), async (req, res) => {
  try {
    const {
      imageIds,
      title,
      description,
      duration = 5,
      fps = 30,
      transition = 'fade',
      quality = 'medium',
      resolution = { width: 1920, height: 1080 },
      tags = []
    } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 images are required' });
    }

    // Get images from database
    const images = await Image.find({
      _id: { $in: imageIds },
      user: req.user._id
    });

    if (images.length !== imageIds.length) {
      return res.status(400).json({ error: 'Some images not found or access denied' });
    }

    // Create video using video service
    const imageUrls = images.map(img => img.imageUrl);
    const result = await videoService.createVideoFromImages(imageUrls, {
      duration,
      fps,
      transition,
      quality,
      resolution
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Upload video to Cloudinary
    const videoBuffer = await require('fs').promises.readFile(result.videoPath);
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-generator/videos',
          resource_type: 'video',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(videoBuffer);
    });

    // Get video metadata
    const metadata = await videoService.getVideoMetadata(result.videoPath);

    // Save video to database
    const video = new Video({
      user: req.user._id,
      title: title || `Video from ${images.length} images`,
      description: description || '',
      videoUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.thumbnail_url,
      images: imageIds,
      settings: {
        duration,
        fps,
        transition,
        quality,
        resolution
      },
      metadata: {
        processingTime: result.metadata.processingTime,
        fileSize: uploadResult.bytes,
        format: uploadResult.format,
        codec: metadata?.streams?.[0]?.codec_name || 'h264'
      },
      tags,
      status: 'completed'
    });

    await video.save();

    // Clean up temporary files
    await videoService.cleanupTempFiles([result.videoPath]);

    res.json({
      message: 'Video created successfully',
      video,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Video creation error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description, tags = [] } = req.body;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-generator/videos',
          resource_type: 'video',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Save to database
    const video = new Video({
      user: req.user._id,
      title: title || 'Uploaded Video',
      description: description || '',
      videoUrl: result.secure_url,
      thumbnailUrl: result.thumbnail_url,
      settings: {
        duration: result.duration,
        fps: result.frame_rate,
        quality: 'medium',
        resolution: {
          width: result.width,
          height: result.height
        }
      },
      metadata: {
        fileSize: result.bytes,
        format: result.format,
        codec: result.video?.codec || 'h264'
      },
      tags,
      status: 'completed'
    });

    await video.save();

    res.json({
      message: 'Video uploaded successfully',
      video
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get user's videos
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username')
      .populate('images', 'title imageUrl');

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username')
      .populate('images', 'title imageUrl');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video });

  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;

    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({
      message: 'Video updated successfully',
      video: updatedVideo
    });

  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary if it's an uploaded video
    if (video.videoUrl) {
      const publicId = video.videoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Like/unlike video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const likeIndex = video.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      video.likes.splice(likeIndex, 1);
    } else {
      // Like
      video.likes.push(req.user._id);
    }

    await video.save();

    res.json({
      message: likeIndex > -1 ? 'Video unliked' : 'Video liked',
      likes: video.likes.length
    });

  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Failed to like/unlike video' });
  }
});

// Increment video views
router.post('/:id/view', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.views += 1;
    await video.save();

    res.json({
      message: 'View counted',
      views: video.views
    });

  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});

// Get video processing status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      status: video.status,
      error: video.error,
      progress: video.status === 'processing' ? 'Processing...' : null
    });

  } catch (error) {
    console.error('Get video status error:', error);
    res.status(500).json({ error: 'Failed to get video status' });
  }
});

module.exports = router; 
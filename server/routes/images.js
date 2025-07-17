const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image');
const { auth, checkCredits, deductCredits, optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get available AI models
router.get('/models', async (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Failed to get models' });
  }
});

// Generate image from prompt
router.post('/generate', auth, checkCredits(1), deductCredits(1), async (req, res) => {
  try {
    const {
      prompt,
      model = 'stable-diffusion',
      width = 512,
      height = 512,
      numImages = 1,
      title,
      description,
      tags = [],
      isPublic
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using AI service
    const result = await aiService.generateImage(prompt, {
      model,
      width,
      height,
      numImages
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Save images to database
    const savedImages = [];
    for (const imageData of result.images) {
      const image = new Image({
        user: req.user._id,
        title: title || `Generated: ${prompt.substring(0, 50)}...`,
        description: description || '',
        prompt,
        imageUrl: imageData.url,
        model,
        settings: {
          width,
          height,
        },
        metadata: {
          generationId: result.generationId,
          processingTime: result.metadata.processingTime,
          tokensUsed: result.metadata.tokensUsed,
          cost: result.metadata.cost
        },
        tags,
        isPublic: (isPublic === false || isPublic === 'false') ? false : true,
        status: 'completed'
      });

      await image.save();
      savedImages.push(image);
    }

    res.json({
      message: 'Images generated successfully',
      images: savedImages,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate images' });
  }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { title, description, tags = [], isPublic } = req.body;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-generator',
          resource_type: 'image',
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

    // Create thumbnail
    const thumbnailResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-generator/thumbnails',
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
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
    const image = new Image({
      user: req.user._id,
      title: title || 'Uploaded Image',
      description: description || '',
      prompt: 'Uploaded image',
      imageUrl: result.secure_url,
      thumbnailUrl: thumbnailResult.secure_url,
      model: 'upload',
      settings: {
        width: result.width,
        height: result.height
      },
      metadata: {
        fileSize: result.bytes,
        format: result.format
      },
      tags,
      isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : true,
      status: 'completed'
    });

    await image.save();
    await image.populate('user', 'username');

    res.json({
      message: 'Image uploaded successfully',
      image
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// TODO: Check and test this combine images route for reliability and issues
router.post('/combine', auth, async (req, res) => {
  try {
    const { imageIds, layout = 'grid', width = 1024, height = 1024, spacing = 10 } = req.body;

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

    // Combine images using AI service
    const imageUrls = images.map(img => img.imageUrl);
    const result = await aiService.combineImages(imageUrls, {
      layout,
      width,
      height,
      spacing
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Upload combined image to Cloudinary
    const combinedImageBuffer = Buffer.from(result.imageUrl.split(',')[1], 'base64');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-generator/combined',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(combinedImageBuffer);
    });

    // Save combined image
    const combinedImage = new Image({
      user: req.user._id,
      title: `Combined Image (${layout})`,
      description: `Combined ${images.length} images using ${layout} layout`,
      prompt: 'Combined images',
      imageUrl: uploadResult.secure_url,
      model: 'combined',
      settings: {
        width,
        height
      },
      metadata: {
        layout,
        imageCount: images.length,
        sourceImages: imageIds
      },
      tags: ['combined'],
      status: 'completed'
    });

    await combinedImage.save();

    res.json({
      message: 'Images combined successfully',
      image: combinedImage,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Image combination error:', error);
    res.status(500).json({ error: 'Failed to combine images' });
  }
});

// Get user's images
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, model, status } = req.query;

    const query = { user: userId };
    if (model) query.model = model;
    if (status) query.status = status;

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username');

    const total = await Image.countDocuments(query);

    res.json({
      images,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user images error:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

// Like/unlike image
router.post('/:id/like', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const likeIndex = image.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      image.likes.splice(likeIndex, 1);
    } else {
      // Like
      image.likes.push(req.user._id);
    }

    await image.save();

    res.json({
      message: likeIndex > -1 ? 'Image unliked' : 'Image liked',
      likes: image.likes.length
    });

  } catch (error) {
    console.error('Like image error:', error);
    res.status(500).json({ error: 'Failed to like/unlike image' });
  }
});

// Get single image
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('user', 'username');

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If the image is not public, only the owner can view it
    if (!image.isPublic) {
      if (!req.user || String(image.user._id) !== String(req.user._id)) {
        return res.status(403).json({ error: 'Not authorized to view this image' });
      }
    }

    res.json({ image });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to get image' });
  }
});

// Update image
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;

    const image = await Image.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({
      message: 'Image updated successfully',
      image: updatedImage
    });

  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from Cloudinary if it's an uploaded image
    if (image.model === 'upload' && image.imageUrl) {
      const publicId = image.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router; 
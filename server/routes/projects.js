const express = require('express');
const Project = require('../models/Project');
const Image = require('../models/Image');
const Video = require('../models/Video');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags = [], isPublic = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const project = new Project({
      user: req.user._id,
      title,
      description,
      tags,
      isPublic
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get user's projects
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, isArchived } = req.query;

    const query = { user: userId };
    if (isArchived !== undefined) query.isArchived = isArchived;

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username')
      .populate('images', 'title imageUrl')
      .populate('videos', 'title videoUrl thumbnailUrl');

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', 'username')
      .populate('images', 'title imageUrl description')
      .populate('videos', 'title videoUrl thumbnailUrl description');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, tags, isPublic, isArchived } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (isArchived !== undefined) updates.isArchived = isArchived;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('user', 'username');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add image to project
router.post('/:id/images', auth, async (req, res) => {
  try {
    const { imageId } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if image exists and belongs to user
    const image = await Image.findOne({
      _id: imageId,
      user: req.user._id
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Add image to project if not already present
    if (!project.images.includes(imageId)) {
      project.images.push(imageId);
      await project.save();
    }

    res.json({
      message: 'Image added to project successfully',
      project
    });

  } catch (error) {
    console.error('Add image to project error:', error);
    res.status(500).json({ error: 'Failed to add image to project' });
  }
});

// Remove image from project
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    const { imageId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove image from project
    project.images = project.images.filter(id => id.toString() !== imageId);
    await project.save();

    res.json({
      message: 'Image removed from project successfully',
      project
    });

  } catch (error) {
    console.error('Remove image from project error:', error);
    res.status(500).json({ error: 'Failed to remove image from project' });
  }
});

// Add video to project
router.post('/:id/videos', auth, async (req, res) => {
  try {
    const { videoId } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if video exists and belongs to user
    const video = await Video.findOne({
      _id: videoId,
      user: req.user._id
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Add video to project if not already present
    if (!project.videos.includes(videoId)) {
      project.videos.push(videoId);
      await project.save();
    }

    res.json({
      message: 'Video added to project successfully',
      project
    });

  } catch (error) {
    console.error('Add video to project error:', error);
    res.status(500).json({ error: 'Failed to add video to project' });
  }
});

// Remove video from project
router.delete('/:id/videos/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove video from project
    project.videos = project.videos.filter(id => id.toString() !== videoId);
    await project.save();

    res.json({
      message: 'Video removed from project successfully',
      project
    });

  } catch (error) {
    console.error('Remove video from project error:', error);
    res.status(500).json({ error: 'Failed to remove video from project' });
  }
});

// Add collaborator to project
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    project.collaborators.push({
      user: userId,
      role
    });

    await project.save();

    res.json({
      message: 'Collaborator added successfully',
      project
    });

  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Remove collaborator from project
router.delete('/:id/collaborators/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.user.toString() !== userId
    );

    await project.save();

    res.json({
      message: 'Collaborator removed successfully',
      project
    });

  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

module.exports = router;

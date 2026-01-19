const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET all comments (pinned first, then by timestamp)
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ isPinned: -1, timestamp: -1 });
    // Transform to match frontend format
    const formatted = comments.map(c => ({
      id: c._id.toString(),
      authorId: c.authorId,
      authorName: c.authorName,
      authorAvatarColor: c.authorAvatarColor,
      text: c.text,
      timestamp: c.timestamp.toISOString(),
      parentId: c.parentId,
      isPinned: c.isPinned || false,
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET comments by parentId (pinned first, then by timestamp)
router.get('/parent/:parentId', async (req, res) => {
  try {
    const comments = await Comment.find({ parentId: req.params.parentId }).sort({ isPinned: -1, timestamp: 1 });
    const formatted = comments.map(c => ({
      id: c._id.toString(),
      authorId: c.authorId,
      authorName: c.authorName,
      authorAvatarColor: c.authorAvatarColor,
      text: c.text,
      timestamp: c.timestamp.toISOString(),
      parentId: c.parentId,
      isPinned: c.isPinned || false,
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST new comment
router.post('/', async (req, res) => {
  try {
    const { authorId, authorName, authorAvatarColor, text, parentId } = req.body;
    const comment = new Comment({
      authorId,
      authorName,
      authorAvatarColor: authorAvatarColor || '#3B82F6',
      text,
      parentId,
    });
    await comment.save();
    res.status(201).json({
      id: comment._id.toString(),
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatarColor: comment.authorAvatarColor,
      text: comment.text,
      timestamp: comment.timestamp.toISOString(),
      parentId: comment.parentId,
      isPinned: comment.isPinned || false,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PUT pin/unpin comment (max 2 pinned per post)
router.put('/:id/pin', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // If trying to pin, check if we already have 2 pinned for this parent
    if (!comment.isPinned) {
      const pinnedCount = await Comment.countDocuments({
        parentId: comment.parentId,
        isPinned: true
      });
      if (pinnedCount >= 2) {
        return res.status(400).json({ error: 'Maximum of 2 pinned comments allowed per post. Unpin another comment first.' });
      }
    }

    // Toggle pin status
    comment.isPinned = !comment.isPinned;
    await comment.save();

    res.json({
      id: comment._id.toString(),
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatarColor: comment.authorAvatarColor,
      text: comment.text,
      timestamp: comment.timestamp.toISOString(),
      parentId: comment.parentId,
      isPinned: comment.isPinned,
    });
  } catch (error) {
    console.error('Error pinning comment:', error);
    res.status(500).json({ error: 'Failed to pin comment' });
  }
});

// DELETE comment
router.delete('/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    // Transform to match frontend format
    const formatted = announcements.map(a => ({
      id: a._id.toString(),
      title: a.title,
      content: a.content,
      priority: a.priority,
      author: a.author,
      authorId: a.authorId,
      date: a.date.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST new announcement
router.post('/', async (req, res) => {
  try {
    const { title, content, priority, author, authorId } = req.body;
    const announcement = new Announcement({
      title,
      content,
      priority: priority || 'NORMAL',
      author,
      authorId,
    });
    await announcement.save();
    res.status(201).json({
      id: announcement._id.toString(),
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      author: announcement.author,
      authorId: announcement.authorId,
      date: announcement.date.toISOString(),
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// DELETE announcement
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;

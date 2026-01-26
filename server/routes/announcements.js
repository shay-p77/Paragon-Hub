const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Helper to format announcement response
const formatAnnouncement = (a) => ({
  id: a._id.toString(),
  title: a.title,
  content: a.content,
  priority: a.priority,
  author: a.author,
  authorId: a.authorId,
  date: a.date.toISOString(),
  isPinned: a.isPinned || false,
  isArchived: a.isArchived || false,
});

// GET all announcements (non-archived by default, pinned first, then by date)
router.get('/', async (req, res) => {
  try {
    // Only get non-archived announcements by default
    const showArchived = req.query.archived === 'true';
    const filter = showArchived ? {} : { isArchived: { $ne: true } };
    const announcements = await Announcement.find(filter).sort({ isPinned: -1, date: -1 });
    res.json(announcements.map(formatAnnouncement));
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
    res.status(201).json(formatAnnouncement(announcement));
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// PUT update announcement
router.put('/:id', async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, priority },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(formatAnnouncement(announcement));
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// PUT pin/unpin announcement (max 2 pinned)
router.put('/:id/pin', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // If trying to pin, check if we already have 2 pinned
    if (!announcement.isPinned) {
      const pinnedCount = await Announcement.countDocuments({ isPinned: true, isArchived: { $ne: true } });
      if (pinnedCount >= 2) {
        return res.status(400).json({ error: 'Maximum of 2 pinned posts allowed. Unpin another post first.' });
      }
    }

    // Toggle pin status
    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json(formatAnnouncement(announcement));
  } catch (error) {
    console.error('Error pinning announcement:', error);
    res.status(500).json({ error: 'Failed to pin announcement' });
  }
});

// PUT archive/unarchive announcement
router.put('/:id/archive', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Toggle archive status
    announcement.isArchived = !announcement.isArchived;

    // If archiving, also unpin
    if (announcement.isArchived) {
      announcement.isPinned = false;
    }

    await announcement.save();

    res.json(formatAnnouncement(announcement));
  } catch (error) {
    console.error('Error archiving announcement:', error);
    res.status(500).json({ error: 'Failed to archive announcement' });
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

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications - Get notifications for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    // Format for frontend
    const formatted = notifications.map(n => ({
      id: n._id.toString(),
      userId: n.userId,
      message: n.message,
      type: n.type,
      read: n.read,
      timestamp: n.createdAt.toISOString(),
      link: n.link || undefined,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications - Create a notification
router.post('/', async (req, res) => {
  try {
    const { userId, message, type, link } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const notification = new Notification({
      userId,
      message,
      type: type || 'ASSIGN',
      link: link || '',
    });

    await notification.save();

    res.status(201).json({
      id: notification._id.toString(),
      userId: notification.userId,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      timestamp: notification.createdAt.toISOString(),
      link: notification.link || undefined,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// POST /api/notifications/bulk - Create multiple notifications at once
router.post('/bulk', async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'notifications array is required' });
    }

    const docs = notifications.map(n => ({
      userId: n.userId,
      message: n.message,
      type: n.type || 'ASSIGN',
      link: n.link || '',
    }));

    const created = await Notification.insertMany(docs);

    res.status(201).json({
      success: true,
      count: created.length,
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    res.status(500).json({ error: 'Failed to create notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      id: notification._id.toString(),
      read: notification.read,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read for a user
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// DELETE /api/notifications - Clear all notifications for a user
router.delete('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await Notification.deleteMany({ userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

module.exports = router;

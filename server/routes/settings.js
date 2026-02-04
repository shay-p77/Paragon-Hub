const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');

// GET system settings (creates default if none exists)
router.get('/', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'main' });

    // Create default settings if none exist
    if (!settings) {
      settings = new SystemSettings({ key: 'main' });
      await settings.save();
    }

    res.json({
      markups: settings.markups,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update system settings
router.put('/', async (req, res) => {
  try {
    const { markups, updatedBy } = req.body;

    let settings = await SystemSettings.findOne({ key: 'main' });

    if (!settings) {
      settings = new SystemSettings({ key: 'main' });
    }

    // Update markups if provided
    if (markups) {
      if (markups.flight) {
        settings.markups.flight = markups.flight;
      }
      if (markups.hotel) {
        settings.markups.hotel = markups.hotel;
      }
      if (markups.logistics) {
        settings.markups.logistics = markups.logistics;
      }
      if (markups.conciergePerDay) {
        settings.markups.conciergePerDay = markups.conciergePerDay;
      }
    }

    if (updatedBy) {
      settings.updatedBy = updatedBy;
    }

    await settings.save();

    res.json({
      markups: settings.markups,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;

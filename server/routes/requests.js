const express = require('express');
const router = express.Router();
const BookingRequest = require('../models/BookingRequest');

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await BookingRequest.find().sort({ timestamp: -1 });
    // Transform to match frontend format
    const formatted = requests.map(r => ({
      id: r._id.toString(),
      agentId: r.agentId,
      agentName: r.agentName,
      clientId: r.clientId,
      clientName: r.clientName,
      type: r.type,
      status: r.status,
      priority: r.priority,
      notes: r.notes,
      timestamp: r.timestamp.toISOString(),
      details: r.details,
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET pending requests only
router.get('/pending', async (req, res) => {
  try {
    const requests = await BookingRequest.find({ status: 'PENDING' }).sort({ timestamp: -1 });
    const formatted = requests.map(r => ({
      id: r._id.toString(),
      agentId: r.agentId,
      agentName: r.agentName,
      clientId: r.clientId,
      clientName: r.clientName,
      type: r.type,
      status: r.status,
      priority: r.priority,
      notes: r.notes,
      timestamp: r.timestamp.toISOString(),
      details: r.details,
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// POST new request
router.post('/', async (req, res) => {
  try {
    const { agentId, agentName, clientId, clientName, type, priority, notes, details } = req.body;
    const request = new BookingRequest({
      agentId,
      agentName,
      clientId: clientId || '',
      clientName: clientName || '',
      type: type || 'GENERAL',
      priority: priority || 'NORMAL',
      notes,
      details: details || {},
    });
    await request.save();
    res.status(201).json({
      id: request._id.toString(),
      agentId: request.agentId,
      agentName: request.agentName,
      clientId: request.clientId,
      clientName: request.clientName,
      type: request.type,
      status: request.status,
      priority: request.priority,
      notes: request.notes,
      timestamp: request.timestamp.toISOString(),
      details: request.details,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// PUT update request status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({
      id: request._id.toString(),
      agentId: request.agentId,
      agentName: request.agentName,
      clientId: request.clientId,
      clientName: request.clientName,
      type: request.type,
      status: request.status,
      priority: request.priority,
      notes: request.notes,
      timestamp: request.timestamp.toISOString(),
      details: request.details,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    await BookingRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;

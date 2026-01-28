const express = require('express');
const router = express.Router();
const PipelineTrip = require('../models/PipelineTrip');
const { logAudit } = require('../utils/auditLogger');

// GET all pipeline trips
router.get('/', async (req, res) => {
  try {
    const trips = await PipelineTrip.find().sort({ createdAt: -1 });
    const formatted = trips.map(t => ({
      id: t._id.toString(),
      name: t.name,
      clientName: t.clientName,
      stage: t.stage,
      hasFlights: t.hasFlights,
      hasHotels: t.hasHotels,
      hasLogistics: t.hasLogistics,
      isUrgent: t.isUrgent,
      tasks: t.tasks,
      startDate: t.startDate || undefined,
      endDate: t.endDate || undefined,
      agent: t.agent,
      notes: t.notes || undefined,
      createdAt: t.createdAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching pipeline trips:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline trips' });
  }
});

// POST create new pipeline trip
router.post('/', async (req, res) => {
  try {
    const { name, clientName, stage, hasFlights, hasHotels, hasLogistics, isUrgent, tasks, startDate, endDate, agent, notes } = req.body;

    const trip = new PipelineTrip({
      name,
      clientName,
      stage: stage || 'NEW',
      hasFlights: hasFlights || false,
      hasHotels: hasHotels || false,
      hasLogistics: hasLogistics || false,
      isUrgent: isUrgent || false,
      tasks: tasks || [],
      startDate: startDate || '',
      endDate: endDate || '',
      agent,
      notes: notes || '',
    });

    await trip.save();

    await logAudit({
      action: 'CREATE_PIPELINE_TRIP',
      resourceType: 'PipelineTrip',
      resourceId: trip._id,
      resourceName: `${name} - ${clientName}`,
      details: { stage, agent },
      req
    });

    res.status(201).json({
      id: trip._id.toString(),
      name: trip.name,
      clientName: trip.clientName,
      stage: trip.stage,
      hasFlights: trip.hasFlights,
      hasHotels: trip.hasHotels,
      hasLogistics: trip.hasLogistics,
      isUrgent: trip.isUrgent,
      tasks: trip.tasks,
      startDate: trip.startDate || undefined,
      endDate: trip.endDate || undefined,
      agent: trip.agent,
      notes: trip.notes || undefined,
      createdAt: trip.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating pipeline trip:', error);
    res.status(500).json({ error: 'Failed to create pipeline trip' });
  }
});

// PUT update pipeline trip
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;

    const trip = await PipelineTrip.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Pipeline trip not found' });
    }

    await logAudit({
      action: 'UPDATE_PIPELINE_TRIP',
      resourceType: 'PipelineTrip',
      resourceId: trip._id,
      resourceName: `${trip.name} - ${trip.clientName}`,
      details: { updatedFields: Object.keys(updates) },
      req
    });

    res.json({
      id: trip._id.toString(),
      name: trip.name,
      clientName: trip.clientName,
      stage: trip.stage,
      hasFlights: trip.hasFlights,
      hasHotels: trip.hasHotels,
      hasLogistics: trip.hasLogistics,
      isUrgent: trip.isUrgent,
      tasks: trip.tasks,
      startDate: trip.startDate || undefined,
      endDate: trip.endDate || undefined,
      agent: trip.agent,
      notes: trip.notes || undefined,
      createdAt: trip.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating pipeline trip:', error);
    res.status(500).json({ error: 'Failed to update pipeline trip' });
  }
});

// DELETE pipeline trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await PipelineTrip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Pipeline trip not found' });
    }

    await PipelineTrip.findByIdAndDelete(req.params.id);

    await logAudit({
      action: 'DELETE_PIPELINE_TRIP',
      resourceType: 'PipelineTrip',
      resourceId: trip._id,
      resourceName: `${trip.name} - ${trip.clientName}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pipeline trip:', error);
    res.status(500).json({ error: 'Failed to delete pipeline trip' });
  }
});

module.exports = router;

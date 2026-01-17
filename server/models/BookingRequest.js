const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    default: '',
  },
  clientName: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['FLIGHT', 'HOTEL', 'LOGISTICS', 'GENERAL'],
    default: 'GENERAL',
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_REVIEW', 'CONVERTED', 'REJECTED'],
    default: 'PENDING',
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'URGENT', 'CRITICAL'],
    default: 'NORMAL',
  },
  notes: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);

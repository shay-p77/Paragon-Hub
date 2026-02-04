const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
}, { _id: false });

const pipelineTaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: String,
    default: null,
  },
  deadline: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  comments: {
    type: [taskCommentSchema],
    default: [],
  },
}, { _id: false });

const pipelineTripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    default: null,
  },
  clientName: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    enum: ['NEW', 'PLANNING', 'IN_PROGRESS', 'FINALIZING'],
    default: 'NEW',
  },
  hasFlights: {
    type: Boolean,
    default: false,
  },
  hasHotels: {
    type: Boolean,
    default: false,
  },
  hasLogistics: {
    type: Boolean,
    default: false,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  tasks: {
    type: [pipelineTaskSchema],
    default: [],
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  agent: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PipelineTrip', pipelineTripSchema);

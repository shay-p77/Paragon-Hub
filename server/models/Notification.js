const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TAG', 'ASSIGN', 'STATUS', 'CHAT', 'REQUEST'],
    default: 'ASSIGN',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL',
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Announcement', announcementSchema);

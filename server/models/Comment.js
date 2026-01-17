const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatarColor: {
    type: String,
    default: '#3B82F6',
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
    required: true, // ID of the announcement or other entity
  },
});

module.exports = mongoose.model('Comment', commentSchema);

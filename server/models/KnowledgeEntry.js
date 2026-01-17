const mongoose = require('mongoose');

const knowledgeEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['PROCEDURE', 'LOCATION', 'CONTACT', 'NOTE'],
    required: true,
  },
  subcategory: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
knowledgeEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);

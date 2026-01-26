const mongoose = require('mongoose');
const encryptionPlugin = require('../utils/encryptionPlugin');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: '',
  },
  company: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  notes: {
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
});

// Encrypt sensitive PII fields
contactSchema.plugin(encryptionPlugin, {
  fields: ['phone', 'email', 'notes'],
});

module.exports = mongoose.model('Contact', contactSchema);

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['FLIGHT', 'HOTEL', 'LOGISTICS'],
    required: true,
  },
  // Commission details
  commissionPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  collectionMethod: {
    type: String,
    enum: ['AUTOMATIC', 'EMAIL', 'FORM', 'CHECK', 'INVOICE', 'OTHER'],
    default: 'OTHER',
  },
  paymentFrequency: {
    type: String,
    enum: ['MONTHLY', 'WEEKLY', 'PER_BOOKING', 'QUARTERLY', 'ANNUALLY', 'OTHER'],
    default: 'MONTHLY',
  },
  // Collection details
  collectionEmail: {
    type: String,
    default: '',
  },
  collectionFormUrl: {
    type: String,
    default: '',
  },
  collectionNotes: {
    type: String,
    default: '',
  },
  // Contact info
  contactName: {
    type: String,
    default: '',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  contactPhone: {
    type: String,
    default: '',
  },
  // General
  notes: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Update timestamp on save
vendorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
vendorSchema.index({ name: 'text', code: 'text' });
vendorSchema.index({ type: 1 });
vendorSchema.index({ isActive: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);

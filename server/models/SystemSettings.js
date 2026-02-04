const mongoose = require('mongoose');

// Markup setting schema (reusable for each booking type)
const markupSettingSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['FLAT', 'PERCENT'],
      default: 'FLAT',
    },
  },
  { _id: false }
);

const systemSettingsSchema = new mongoose.Schema({
  // Singleton identifier
  key: {
    type: String,
    default: 'main',
    unique: true,
  },

  // Default markups for each booking type
  markups: {
    flight: {
      type: markupSettingSchema,
      default: () => ({ amount: 0, type: 'FLAT' }),
    },
    hotel: {
      type: markupSettingSchema,
      default: () => ({ amount: 0, type: 'FLAT' }),
    },
    logistics: {
      type: markupSettingSchema,
      default: () => ({ amount: 0, type: 'FLAT' }),
    },
    conciergePerDay: {
      type: markupSettingSchema,
      default: () => ({ amount: 0, type: 'FLAT' }),
    },
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: '',
  },
});

// Update timestamp on save
systemSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

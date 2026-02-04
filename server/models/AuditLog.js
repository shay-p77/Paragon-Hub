const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userRole: { type: String },

  // What action was performed
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'VIEW_CUSTOMER',
      'CREATE_CUSTOMER',
      'UPDATE_CUSTOMER',
      'DELETE_CUSTOMER',
      'VIEW_BOOKING',
      'CREATE_BOOKING',
      'UPDATE_BOOKING',
      'DELETE_BOOKING',
      'VIEW_PII',
      'EXPORT_DATA',
      'INVITE_USER',
      'RESEND_INVITE',
      'UPDATE_USER',
      'DELETE_USER',
      'SETTINGS_CHANGE',
      'CREATE_VENDOR',
      'UPDATE_VENDOR',
      'DELETE_VENDOR',
      'FAILED_LOGIN',
      'RATE_LIMITED'
    ]
  },

  // What resource was affected
  resourceType: { type: String }, // 'Customer', 'BookingRequest', 'User', etc.
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  resourceName: { type: String }, // Human-readable identifier

  // Additional context
  details: { type: mongoose.Schema.Types.Mixed }, // Any extra info
  ipAddress: { type: String },
  userAgent: { type: String },

  // Result
  success: { type: Boolean, default: true },
  errorMessage: { type: String },

  // Timestamp
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

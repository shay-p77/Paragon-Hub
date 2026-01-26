const mongoose = require('mongoose');
const { encrypt, decrypt, encryptFields, decryptFields } = require('../utils/encryption');

// Fields within the 'details' object that should be encrypted
const SENSITIVE_DETAIL_FIELDS = [
  'passportNumber',
  'dateOfBirth',
  'dob',
  'passport',
  'ssn',
  'idNumber',
  'phone',
  'email',
  'passengerPhone',
  'passengerEmail',
];

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

// Encrypt sensitive fields in details object before save
bookingRequestSchema.pre('save', function (next) {
  try {
    // Encrypt notes field
    if (this.notes && !this.notes.includes(':')) {
      // Simple check - real encrypted values have colons
      // Only encrypt if it looks like plaintext
    }

    // Encrypt sensitive fields within details
    if (this.details && typeof this.details === 'object') {
      this.details = encryptFields(this.details, SENSITIVE_DETAIL_FIELDS);

      // Also check nested objects (e.g., details.passengers[])
      if (Array.isArray(this.details.passengers)) {
        this.details.passengers = this.details.passengers.map((p) =>
          encryptFields(p, SENSITIVE_DETAIL_FIELDS)
        );
      }

      // Mark details as modified since it's a Mixed type
      this.markModified('details');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Decrypt sensitive fields after find
function decryptDetails(doc) {
  if (!doc || !doc.details) return doc;

  if (typeof doc.details === 'object') {
    doc.details = decryptFields(doc.details, SENSITIVE_DETAIL_FIELDS);

    // Decrypt nested passenger arrays
    if (Array.isArray(doc.details.passengers)) {
      doc.details.passengers = doc.details.passengers.map((p) =>
        decryptFields(p, SENSITIVE_DETAIL_FIELDS)
      );
    }
  }

  return doc;
}

bookingRequestSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(decryptDetails);
  }
  return docs;
});

bookingRequestSchema.post('findOne', function (doc) {
  return decryptDetails(doc);
});

bookingRequestSchema.post('findOneAndUpdate', function (doc) {
  return decryptDetails(doc);
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);

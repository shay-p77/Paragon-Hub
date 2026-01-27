const mongoose = require('mongoose');
const encryptionPlugin = require('../utils/encryptionPlugin');

const loyaltyProgramSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    seatPreference: {
      type: String,
      enum: ['aisle', 'window', 'middle', ''],
      default: '',
    },
    dietaryRestrictions: [
      {
        type: String,
      },
    ],
    hotelPreferences: {
      type: String,
      default: '',
    },
    specialRequests: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema({
  // Basic Info
  legalFirstName: {
    type: String,
    required: true,
  },
  legalMiddleName: {
    type: String,
    default: '',
  },
  legalLastName: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },

  // Relationship - if set, this customer belongs to a primary
  primaryCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },

  // Travel Documents
  passportNumber: {
    type: String,
    default: '',
  },
  passportExpiry: {
    type: String,
    default: '',
  },
  passportCountry: {
    type: String,
    default: '',
  },

  // Loyalty Programs (numbers will be encrypted via custom handling)
  loyaltyPrograms: [loyaltyProgramSchema],

  // Preferences
  preferences: preferencesSchema,

  // Notes
  notes: {
    type: String,
    default: '',
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    default: '',
  },
});

// Encrypt sensitive PII fields automatically
customerSchema.plugin(encryptionPlugin, {
  fields: [
    'passportNumber',
    'dateOfBirth',
    'phone',
    'email',
    'notes',
  ],
});

// Encrypt loyalty program numbers separately (nested array)
const { encrypt, decrypt } = require('../utils/encryption');

customerSchema.pre('save', function (next) {
  try {
    // Encrypt loyalty program account numbers
    if (this.loyaltyPrograms && this.loyaltyPrograms.length > 0) {
      this.loyaltyPrograms = this.loyaltyPrograms.map((program) => {
        if (program.number && !program.number.includes(':')) {
          return {
            ...program.toObject(),
            number: encrypt(program.number),
          };
        }
        return program;
      });
      this.markModified('loyaltyPrograms');
    }

    // Update the updatedAt timestamp
    this.updatedAt = new Date();

    next();
  } catch (error) {
    next(error);
  }
});

// Decrypt loyalty program numbers after find
function decryptLoyaltyPrograms(doc) {
  if (!doc) return doc;

  if (doc.loyaltyPrograms && doc.loyaltyPrograms.length > 0) {
    doc.loyaltyPrograms = doc.loyaltyPrograms.map((program) => {
      if (program.number) {
        return {
          ...program.toObject ? program.toObject() : program,
          number: decrypt(program.number),
        };
      }
      return program;
    });
  }

  return doc;
}

customerSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(decryptLoyaltyPrograms);
  }
  return docs;
});

customerSchema.post('findOne', function (doc) {
  return decryptLoyaltyPrograms(doc);
});

customerSchema.post('findOneAndUpdate', function (doc) {
  return decryptLoyaltyPrograms(doc);
});

// Index for faster lookups
customerSchema.index({ displayName: 'text', legalFirstName: 'text', legalLastName: 'text' });
customerSchema.index({ primaryCustomerId: 1 });

module.exports = mongoose.model('Customer', customerSchema);

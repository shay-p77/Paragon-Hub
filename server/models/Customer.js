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

const passportSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    expiry: {
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

  // Travel Documents (legacy single passport - kept for backwards compatibility)
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

  // Multiple passports support
  passports: [passportSchema],

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
  // Agent who owns this customer (for CRM filtering)
  agentId: {
    type: String,
    default: '',
    index: true,
  },

  // Custom markup overrides (null = use global default, 0 = no markup)
  customMarkups: {
    flight: {
      amount: { type: Number, default: null },
      type: { type: String, enum: ['FLAT', 'PERCENT', null], default: null },
    },
    hotel: {
      amount: { type: Number, default: null },
      type: { type: String, enum: ['FLAT', 'PERCENT', null], default: null },
    },
    logistics: {
      amount: { type: Number, default: null },
      type: { type: String, enum: ['FLAT', 'PERCENT', null], default: null },
    },
    conciergePerDay: {
      amount: { type: Number, default: null },
      type: { type: String, enum: ['FLAT', 'PERCENT', null], default: null },
    },
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

    // Encrypt passport numbers in passports array
    if (this.passports && this.passports.length > 0) {
      this.passports = this.passports.map((passport) => {
        if (passport.number && !passport.number.includes(':')) {
          return {
            ...passport.toObject(),
            number: encrypt(passport.number),
          };
        }
        return passport;
      });
      this.markModified('passports');
    }

    // Update the updatedAt timestamp
    this.updatedAt = new Date();

    next();
  } catch (error) {
    next(error);
  }
});

// Decrypt loyalty program numbers and passport numbers after find
function decryptNestedFields(doc) {
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

  if (doc.passports && doc.passports.length > 0) {
    doc.passports = doc.passports.map((passport) => {
      if (passport.number) {
        return {
          ...passport.toObject ? passport.toObject() : passport,
          number: decrypt(passport.number),
        };
      }
      return passport;
    });
  }

  return doc;
}

customerSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach(decryptNestedFields);
  }
  return docs;
});

customerSchema.post('findOne', function (doc) {
  return decryptNestedFields(doc);
});

customerSchema.post('findOneAndUpdate', function (doc) {
  return decryptNestedFields(doc);
});

// Index for faster lookups
customerSchema.index({ displayName: 'text', legalFirstName: 'text', legalLastName: 'text' });
customerSchema.index({ primaryCustomerId: 1 });

module.exports = mongoose.model('Customer', customerSchema);

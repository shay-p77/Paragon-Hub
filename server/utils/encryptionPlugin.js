/**
 * Mongoose plugin for automatic field-level encryption
 *
 * Usage in model:
 *   const encryptionPlugin = require('../utils/encryptionPlugin');
 *
 *   const schema = new mongoose.Schema({ ... });
 *   schema.plugin(encryptionPlugin, {
 *     fields: ['passportNumber', 'dateOfBirth', 'phone', 'email']
 *   });
 */

const { encrypt, decrypt, hash } = require('./encryption');

/**
 * Mongoose plugin that encrypts specified fields on save and decrypts on find
 * @param {mongoose.Schema} schema - Mongoose schema to apply plugin to
 * @param {Object} options - Plugin options
 * @param {string[]} options.fields - Array of field names to encrypt
 */
function encryptionPlugin(schema, options = {}) {
  const { fields = [] } = options;

  if (fields.length === 0) {
    console.warn('encryptionPlugin: No fields specified for encryption');
    return;
  }

  // Add hash fields for searchable encrypted fields
  fields.forEach((field) => {
    const hashField = `_${field}Hash`;
    if (!schema.path(hashField)) {
      schema.add({
        [hashField]: {
          type: String,
          index: true,
          select: false, // Don't include in queries by default
        },
      });
    }
  });

  // Encrypt fields before saving
  schema.pre('save', function (next) {
    try {
      for (const field of fields) {
        const value = this.get(field);

        if (value !== undefined && value !== null && value !== '') {
          // Check if already encrypted (has colons like iv:authTag:ciphertext)
          if (typeof value === 'string' && value.split(':').length === 3) {
            continue; // Already encrypted, skip
          }

          // Encrypt the field
          this.set(field, encrypt(value));

          // Store hash for searching
          const hashField = `_${field}Hash`;
          this.set(hashField, hash(value));
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  // Encrypt fields before updateOne/updateMany
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function (next) {
    try {
      const update = this.getUpdate();
      if (!update) return next();

      // Handle $set operations
      if (update.$set) {
        for (const field of fields) {
          if (update.$set[field] !== undefined) {
            const value = update.$set[field];
            if (value !== null && value !== '') {
              // Check if already encrypted
              if (typeof value === 'string' && value.split(':').length === 3) {
                continue;
              }
              update.$set[field] = encrypt(value);
              update.$set[`_${field}Hash`] = hash(value);
            }
          }
        }
      }

      // Handle direct field updates
      for (const field of fields) {
        if (update[field] !== undefined && !update.$set) {
          const value = update[field];
          if (value !== null && value !== '') {
            if (typeof value === 'string' && value.split(':').length === 3) {
              continue;
            }
            update[field] = encrypt(value);
            update[`_${field}Hash`] = hash(value);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  });

  // Decrypt fields after finding documents
  function decryptDocument(doc) {
    if (!doc) return doc;

    for (const field of fields) {
      const value = doc[field];
      if (value !== undefined && value !== null) {
        doc[field] = decrypt(value);
      }
    }

    return doc;
  }

  // Post hooks for decryption
  schema.post('find', function (docs) {
    if (Array.isArray(docs)) {
      docs.forEach(decryptDocument);
    }
    return docs;
  });

  schema.post('findOne', function (doc) {
    return decryptDocument(doc);
  });

  schema.post('findOneAndUpdate', function (doc) {
    return decryptDocument(doc);
  });

  // Add method to search by encrypted field using hash
  schema.statics.findByEncryptedField = async function (field, value) {
    if (!fields.includes(field)) {
      throw new Error(`Field '${field}' is not configured for encryption`);
    }

    const hashField = `_${field}Hash`;
    const hashedValue = hash(value);

    return this.find({ [hashField]: hashedValue });
  };

  // Add method to search one by encrypted field using hash
  schema.statics.findOneByEncryptedField = async function (field, value) {
    if (!fields.includes(field)) {
      throw new Error(`Field '${field}' is not configured for encryption`);
    }

    const hashField = `_${field}Hash`;
    const hashedValue = hash(value);

    return this.findOne({ [hashField]: hashedValue });
  };

  // Add instance method to get decrypted value
  schema.methods.getDecrypted = function (field) {
    if (!fields.includes(field)) {
      return this.get(field);
    }
    return decrypt(this.get(field));
  };

  // Virtual for checking if a field is encrypted
  schema.methods.isFieldEncrypted = function (field) {
    const value = this.get(field);
    return typeof value === 'string' && value.split(':').length === 3;
  };
}

module.exports = encryptionPlugin;

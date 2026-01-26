/**
 * Field-level encryption utility using AES-256-GCM
 *
 * Usage:
 *   const { encrypt, decrypt } = require('./utils/encryption');
 *   const encrypted = encrypt('sensitive data');
 *   const decrypted = decrypt(encrypted);
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 * Must be a 32-byte (256-bit) key, either as hex or base64
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('ENCRYPTION_KEY not set - encryption disabled');
    return null;
  }

  // Support both hex (64 chars) and base64 (44 chars) encoded keys
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  } else if (key.length === 44) {
    return Buffer.from(key, 'base64');
  } else if (key.length === 32) {
    return Buffer.from(key, 'utf8');
  }

  console.warn('ENCRYPTION_KEY invalid length - encryption disabled');
  return null;
}

/**
 * Encrypt a string value
 * @param {string} plaintext - The value to encrypt
 * @returns {string} - Encrypted value as base64 (format: iv:authTag:ciphertext)
 */
function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return plaintext;
  }

  // Convert to string if not already
  const text = String(plaintext);

  const key = getEncryptionKey();

  // If no key, return plaintext (encryption disabled)
  if (!key) {
    return text;
  }
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string value
 * @param {string} encryptedValue - The encrypted value (format: iv:authTag:ciphertext)
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedValue) {
  if (encryptedValue === null || encryptedValue === undefined || encryptedValue === '') {
    return encryptedValue;
  }

  // Check if this looks like an encrypted value
  if (!encryptedValue.includes(':')) {
    // Not encrypted, return as-is (for backwards compatibility with existing data)
    return encryptedValue;
  }

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    // Not in expected format, return as-is
    return encryptedValue;
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;

  try {
    const key = getEncryptionKey();

    // If no key, can't decrypt - return encrypted value
    if (!key) {
      console.warn('Cannot decrypt: ENCRYPTION_KEY not set');
      return encryptedValue;
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // If decryption fails, the data might not be encrypted (legacy data)
    console.warn('Decryption failed, returning original value:', error.message);
    return encryptedValue;
  }
}

/**
 * Encrypt an object's specified fields
 * @param {Object} obj - Object with fields to encrypt
 * @param {string[]} fields - Array of field names to encrypt
 * @returns {Object} - New object with encrypted fields
 */
function encryptFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null && result[field] !== '') {
      result[field] = encrypt(result[field]);
    }
  }

  return result;
}

/**
 * Decrypt an object's specified fields
 * @param {Object} obj - Object with fields to decrypt
 * @param {string[]} fields - Array of field names to decrypt
 * @returns {Object} - New object with decrypted fields
 */
function decryptFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = decrypt(result[field]);
    }
  }

  return result;
}

/**
 * Hash a value (one-way, for searching encrypted fields)
 * Use this when you need to search by an encrypted field
 * @param {string} value - Value to hash
 * @returns {string} - SHA-256 hash as hex
 */
function hash(value) {
  if (!value) return value;

  const salt = process.env.ENCRYPTION_KEY || 'default-salt';
  return crypto
    .createHmac('sha256', salt)
    .update(String(value))
    .digest('hex');
}

/**
 * Check if encryption is properly configured
 * @returns {boolean}
 */
function isEncryptionConfigured() {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key (for setup)
 * @returns {string} - 32-byte key as hex
 */
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
  hash,
  isEncryptionConfigured,
  generateKey,
};

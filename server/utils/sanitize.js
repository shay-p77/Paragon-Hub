/**
 * Data sanitization utility for removing/masking PII before external processing
 * Use this when sending data to external AI services
 */

// Patterns for sensitive data that should be masked
const PATTERNS = {
  // Passport numbers (various formats)
  // US: 9 digits, UK: 9 alphanumeric, etc.
  passport: /\b[A-Z]{0,2}\d{6,9}\b/gi,

  // US Social Security Number
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,

  // Credit card numbers (various formats)
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,

  // Bank account numbers (8-17 digits)
  bankAccount: /\b\d{8,17}\b/g,

  // Driver's license (varies by state/country, catch common patterns)
  driversLicense: /\b[A-Z]{1,2}\d{4,8}\b/gi,

  // Date of birth patterns (be careful not to mask travel dates)
  // Only mask when explicitly labeled as DOB/birth
  dobLabeled: /(?:dob|date\s*of\s*birth|birth\s*date|born)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/gi,

  // Phone numbers (international formats)
  phone: /(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g,

  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
};

// Mask replacement for each pattern type
const MASKS = {
  passport: '[PASSPORT-MASKED]',
  ssn: '[SSN-MASKED]',
  creditCard: '[CC-MASKED]',
  bankAccount: '[ACCOUNT-MASKED]',
  driversLicense: '[LICENSE-MASKED]',
  dobLabeled: 'DOB: [DOB-MASKED]',
  phone: '[PHONE-MASKED]',
  email: '[EMAIL-MASKED]',
};

/**
 * Sanitize text by masking sensitive PII patterns
 * @param {string} text - Text to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} options.maskPassport - Mask passport numbers (default: true)
 * @param {boolean} options.maskSSN - Mask SSNs (default: true)
 * @param {boolean} options.maskCreditCard - Mask credit cards (default: true)
 * @param {boolean} options.maskPhone - Mask phone numbers (default: false - often needed for bookings)
 * @param {boolean} options.maskEmail - Mask emails (default: false - often needed for bookings)
 * @param {boolean} options.maskDOB - Mask labeled DOB (default: true)
 * @returns {string} - Sanitized text
 */
function sanitizeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const defaults = {
    maskPassport: true,
    maskSSN: true,
    maskCreditCard: true,
    maskBankAccount: true,
    maskDriversLicense: true,
    maskDOB: true,
    maskPhone: false, // Often needed for bookings
    maskEmail: false, // Often needed for bookings
  };

  const config = { ...defaults, ...options };
  let sanitized = text;

  // Apply masks based on configuration
  if (config.maskSSN) {
    sanitized = sanitized.replace(PATTERNS.ssn, MASKS.ssn);
  }

  if (config.maskCreditCard) {
    sanitized = sanitized.replace(PATTERNS.creditCard, MASKS.creditCard);
  }

  if (config.maskPassport) {
    // More careful with passport - only mask if in context of "passport"
    sanitized = sanitized.replace(
      /passport[:\s#]*([A-Z]{0,2}\d{6,9})/gi,
      `passport: ${MASKS.passport}`
    );
  }

  if (config.maskBankAccount) {
    sanitized = sanitized.replace(
      /(?:account|acct)[:\s#]*(\d{8,17})/gi,
      `account: ${MASKS.bankAccount}`
    );
  }

  if (config.maskDriversLicense) {
    sanitized = sanitized.replace(
      /(?:license|licence|dl)[:\s#]*([A-Z]{1,2}\d{4,8})/gi,
      `license: ${MASKS.driversLicense}`
    );
  }

  if (config.maskDOB) {
    sanitized = sanitized.replace(PATTERNS.dobLabeled, MASKS.dobLabeled);
  }

  if (config.maskPhone) {
    sanitized = sanitized.replace(PATTERNS.phone, MASKS.phone);
  }

  if (config.maskEmail) {
    sanitized = sanitized.replace(PATTERNS.email, MASKS.email);
  }

  return sanitized;
}

/**
 * Sanitize an object's string fields recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} - New object with sanitized string fields
 */
function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value, options);
    } else if (typeof value === 'object') {
      result[key] = sanitizeObject(value, options);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Check if text contains potentially sensitive data
 * @param {string} text - Text to check
 * @returns {Object} - Object with boolean flags for each PII type found
 */
function detectPII(text) {
  if (!text || typeof text !== 'string') {
    return { hasPII: false };
  }

  const detected = {
    hasPII: false,
    hasSSN: PATTERNS.ssn.test(text),
    hasCreditCard: PATTERNS.creditCard.test(text),
    hasPassport: /passport[:\s#]*[A-Z]{0,2}\d{6,9}/i.test(text),
    hasDOB: PATTERNS.dobLabeled.test(text),
    hasPhone: PATTERNS.phone.test(text),
    hasEmail: PATTERNS.email.test(text),
  };

  // Reset lastIndex for regex patterns (they're global)
  Object.values(PATTERNS).forEach((pattern) => {
    pattern.lastIndex = 0;
  });

  detected.hasPII = Object.entries(detected)
    .filter(([key]) => key !== 'hasPII')
    .some(([, value]) => value);

  return detected;
}

/**
 * Log a warning if PII is detected (for audit purposes)
 * @param {string} text - Text that was processed
 * @param {string} context - Context/route where this was called
 */
function logPIIWarning(text, context = 'unknown') {
  const detected = detectPII(text);

  if (detected.hasPII) {
    const types = Object.entries(detected)
      .filter(([key, value]) => key !== 'hasPII' && value)
      .map(([key]) => key.replace('has', ''))
      .join(', ');

    console.warn(`[PII-AUDIT] Potential PII detected in ${context}: ${types}`);
  }

  return detected;
}

module.exports = {
  sanitizeText,
  sanitizeObject,
  detectPII,
  logPIIWarning,
  PATTERNS,
  MASKS,
};

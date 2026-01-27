const AuditLog = require('../models/AuditLog');

/**
 * Log an action to the audit trail
 * @param {Object} options
 * @param {Object} options.user - The user performing the action (from auth)
 * @param {string} options.action - The action type (see AuditLog enum)
 * @param {string} options.resourceType - Type of resource affected
 * @param {string} options.resourceId - ID of resource affected
 * @param {string} options.resourceName - Human-readable name
 * @param {Object} options.details - Additional context
 * @param {Object} options.req - Express request object (for IP/user agent)
 * @param {boolean} options.success - Whether the action succeeded
 * @param {string} options.errorMessage - Error message if failed
 */
async function logAudit({
  user,
  action,
  resourceType,
  resourceId,
  resourceName,
  details,
  req,
  success = true,
  errorMessage
}) {
  try {
    const auditEntry = new AuditLog({
      userId: user?._id || user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      ipAddress: req ? getClientIP(req) : undefined,
      userAgent: req?.headers?.['user-agent'],
      success,
      errorMessage
    });

    await auditEntry.save();
  } catch (error) {
    // Don't let audit logging failures break the app
    console.error('[AUDIT] Failed to log audit entry:', error.message);
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip;
}

/**
 * Express middleware to attach audit logger to request
 */
function auditMiddleware(req, res, next) {
  req.audit = (options) => logAudit({ ...options, req });
  next();
}

/**
 * Get audit logs with filtering
 */
async function getAuditLogs({
  userId,
  action,
  resourceType,
  resourceId,
  startDate,
  endDate,
  limit = 100,
  skip = 0
}) {
  const query = {};

  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (resourceId) query.resourceId = resourceId;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return AuditLog.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'email name role');
}

module.exports = {
  logAudit,
  auditMiddleware,
  getAuditLogs,
  getClientIP
};

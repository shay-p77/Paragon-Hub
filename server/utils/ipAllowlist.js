const { logAudit, getClientIP } = require('./auditLogger');

/**
 * IP Allowlist Middleware
 * Restricts access to certain routes based on IP address
 *
 * Usage:
 * 1. Set ADMIN_ALLOWED_IPS in .env (comma-separated list)
 * 2. Apply middleware to protected routes
 *
 * Example: ADMIN_ALLOWED_IPS=192.168.1.1,10.0.0.1
 */

// Parse allowed IPs from environment variable
function getAllowedIPs() {
  const envIPs = process.env.ADMIN_ALLOWED_IPS;
  if (!envIPs) {
    return null; // null means IP allowlisting is disabled
  }
  return envIPs.split(',').map(ip => ip.trim()).filter(ip => ip);
}

/**
 * Middleware to check if request IP is in allowlist
 * If ADMIN_ALLOWED_IPS is not set, allowlisting is disabled (all IPs allowed)
 */
function ipAllowlistMiddleware(req, res, next) {
  const allowedIPs = getAllowedIPs();

  // If no IPs configured, skip the check (disabled)
  if (!allowedIPs || allowedIPs.length === 0) {
    return next();
  }

  const clientIP = getClientIP(req);

  // Check if client IP is in the allowlist
  // Also check for localhost variations
  const isAllowed = allowedIPs.some(allowedIP => {
    // Exact match
    if (clientIP === allowedIP) return true;
    // Handle localhost variations
    if (allowedIP === 'localhost' && (clientIP === '127.0.0.1' || clientIP === '::1')) return true;
    if (allowedIP === '127.0.0.1' && (clientIP === 'localhost' || clientIP === '::1')) return true;
    // Handle IPv6 localhost
    if (allowedIP === '::1' && (clientIP === '127.0.0.1' || clientIP === 'localhost')) return true;
    return false;
  });

  if (isAllowed) {
    return next();
  }

  // Log the blocked attempt
  console.warn(`[IP-ALLOWLIST] Blocked request from ${clientIP} to ${req.originalUrl}`);

  logAudit({
    action: 'RATE_LIMITED',
    details: {
      reason: 'IP not in allowlist',
      blockedIP: clientIP,
      attemptedRoute: req.originalUrl
    },
    req,
    success: false,
    errorMessage: 'IP not in allowlist'
  });

  return res.status(403).json({
    error: 'Access denied',
    message: 'Your IP address is not authorized to access this resource'
  });
}

/**
 * Create a custom allowlist middleware with specific IPs
 * Useful for different route groups with different IP requirements
 */
function createIPAllowlist(allowedIPs) {
  return function(req, res, next) {
    if (!allowedIPs || allowedIPs.length === 0) {
      return next();
    }

    const clientIP = getClientIP(req);
    const isAllowed = allowedIPs.some(allowedIP => {
      if (clientIP === allowedIP) return true;
      if (allowedIP === 'localhost' && (clientIP === '127.0.0.1' || clientIP === '::1')) return true;
      if (allowedIP === '127.0.0.1' && (clientIP === 'localhost' || clientIP === '::1')) return true;
      if (allowedIP === '::1' && (clientIP === '127.0.0.1' || clientIP === 'localhost')) return true;
      return false;
    });

    if (isAllowed) {
      return next();
    }

    console.warn(`[IP-ALLOWLIST] Blocked request from ${clientIP}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address is not authorized'
    });
  };
}

module.exports = {
  ipAllowlistMiddleware,
  createIPAllowlist,
  getAllowedIPs
};

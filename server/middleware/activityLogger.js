const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Log admin actions to the ActivityLog collection.
 * Call this as a utility (not as middleware) within admin controllers.
 *
 * @param {object} params
 * @param {string} params.actorId   - Admin user ID
 * @param {string} params.action    - Action enum string
 * @param {string} [params.target]  - e.g. "User:507f..." or "Gig:..."
 * @param {string} [params.details] - Human-readable description
 * @param {object} [params.req]     - Express request (for IP/UA)
 */
const logActivity = async ({ actorId, action, target = '', details = '', req = null }) => {
  try {
    await ActivityLog.create({
      actor: actorId,
      action,
      target,
      details,
      ip: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || '',
    });
  } catch (err) {
    // Non-fatal — log to winston but don't crash the request
    logger.error(`ActivityLog write failed: ${err.message}`);
  }
};

module.exports = logActivity;

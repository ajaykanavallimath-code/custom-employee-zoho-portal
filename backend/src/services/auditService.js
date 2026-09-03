const AuditLogModel = require('../models/auditLogModel');

class AuditService {
  /**
   * Extract client IP from Express request
   */
  static getClientIp(req) {
    if (!req) return '127.0.0.1';
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1'
    );
  }

  /**
   * Record an audit log event
   */
  static async log({ req = null, userId = null, action, resource, details = null, ipAddress = null }) {
    try {
      const resolvedUserId = userId || (req?.user?.id ?? null);
      const resolvedIp = ipAddress || (req ? this.getClientIp(req) : '127.0.0.1');

      return await AuditLogModel.createLog({
        userId: resolvedUserId,
        action,
        resource,
        details,
        ipAddress: resolvedIp
      });
    } catch (err) {
      console.error('Audit Log recording failed (non-blocking):', err.message);
      return null;
    }
  }
}

module.exports = AuditService;

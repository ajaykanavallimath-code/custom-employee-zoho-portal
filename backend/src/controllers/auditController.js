const AuditLogModel = require('../models/auditLogModel');

class AuditController {
  /**
   * GET /api/audit-logs
   * Paginated audit logs with search & filters (Admin only)
   */
  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '25', 10);
      const offset = (page - 1) * limit;

      const { userId, action, resource, search, startDate, endDate } = req.query;

      const filterOpts = {
        userId: userId ? parseInt(userId, 10) : null,
        action,
        resource,
        search,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        limit,
        offset
      };

      const [logs, total] = await Promise.all([
        AuditLogModel.getLogs(filterOpts),
        AuditLogModel.countLogs(filterOpts)
      ]);

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/audit-logs/recent
   * Returns recent 15 activity feed items
   */
  static async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '10', 10);
      const logs = await AuditLogModel.getRecentActivity(limit);

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;

const db = require('../config/db');

class AuditLogModel {
  /**
   * Insert new audit log record
   */
  static async createLog({ userId = null, action, resource, details = null, ipAddress = null }) {
    const detailsStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : (details || null);
    
    const res = await db.query(
      `INSERT INTO audit_logs (user_id, action, resource, details, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, user_id, action, resource, details, ip_address, created_at`,
      [userId, action, resource, detailsStr, ipAddress]
    );
    return res.rows[0];
  }

  /**
   * Fetch paginated audit logs with dynamic search & filtering
   */
  static async getLogs({
    userId = null,
    action = '',
    resource = '',
    search = '',
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  } = {}) {
    let sql = `
      SELECT 
        al.id,
        al.user_id,
        u.name AS user_name,
        u.email AS user_email,
        al.action,
        al.resource,
        al.details,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (userId) {
      sql += ` AND al.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (action) {
      sql += ` AND al.action ILIKE $${paramIndex++}`;
      params.push(`%${action}%`);
    }

    if (resource) {
      sql += ` AND al.resource ILIKE $${paramIndex++}`;
      params.push(`%${resource}%`);
    }

    if (search) {
      sql += ` AND (
        al.action ILIKE $${paramIndex} OR 
        al.resource ILIKE $${paramIndex} OR 
        al.details ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND al.created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND al.created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const res = await db.query(sql, params);
    
    // Parse JSON details if string
    return res.rows.map(row => {
      let parsedDetails = row.details;
      if (typeof row.details === 'string') {
        try {
          parsedDetails = JSON.parse(row.details);
        } catch {
          parsedDetails = row.details;
        }
      }
      return {
        ...row,
        details: parsedDetails
      };
    });
  }

  /**
   * Count total logs for pagination
   */
  static async countLogs({
    userId = null,
    action = '',
    resource = '',
    search = '',
    startDate = null,
    endDate = null
  } = {}) {
    let sql = `
      SELECT COUNT(*) AS count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (userId) {
      sql += ` AND al.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (action) {
      sql += ` AND al.action ILIKE $${paramIndex++}`;
      params.push(`%${action}%`);
    }

    if (resource) {
      sql += ` AND al.resource ILIKE $${paramIndex++}`;
      params.push(`%${resource}%`);
    }

    if (search) {
      sql += ` AND (
        al.action ILIKE $${paramIndex} OR 
        al.resource ILIKE $${paramIndex} OR 
        al.details ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND al.created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND al.created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    const res = await db.query(sql, params);
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  /**
   * Get recent activity feed for admin dashboard
   */
  static async getRecentActivity(limit = 10) {
    const res = await db.query(
      `SELECT 
        al.id,
        al.user_id,
        u.name AS user_name,
        u.email AS user_email,
        al.action,
        al.resource,
        al.details,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1`,
      [limit]
    );

    return res.rows.map(row => {
      let parsedDetails = row.details;
      if (typeof row.details === 'string') {
        try {
          parsedDetails = JSON.parse(row.details);
        } catch {
          parsedDetails = row.details;
        }
      }
      return { ...row, details: parsedDetails };
    });
  }
}

module.exports = AuditLogModel;

const db = require('../config/db');

class PermissionModel {
  /**
   * Get all permissions grouped logically
   */
  static async getAllPermissions() {
    const res = await db.query(
      'SELECT id, name, description, created_at FROM permissions ORDER BY id ASC'
    );
    return res.rows;
  }

  /**
   * Get permission by ID
   */
  static async getById(id) {
    const res = await db.query('SELECT * FROM permissions WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Find permission by name
   */
  static async findByName(name) {
    const res = await db.query('SELECT * FROM permissions WHERE LOWER(name) = LOWER($1)', [name]);
    return res.rows[0] || null;
  }

  /**
   * Create permission
   */
  static async createPermission({ name, description }) {
    const res = await db.query(
      `INSERT INTO permissions (name, description, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING id, name, description, created_at`,
      [name, description]
    );
    return res.rows[0];
  }

  /**
   * Update permission
   */
  static async updatePermission(id, { name, description }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }

    params.push(id);
    const sql = `
      UPDATE permissions 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, name, description, created_at
    `;

    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }
}

module.exports = PermissionModel;

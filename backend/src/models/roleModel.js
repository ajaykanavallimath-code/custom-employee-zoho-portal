const db = require('../config/db');

class RoleModel {
  /**
   * Get all roles along with associated permissions
   */
  static async getAllRolesWithPermissions() {
    const rolesRes = await db.query(
      `SELECT r.id, r.name, r.description, r.created_at,
              COUNT(DISTINCT ur.user_id) AS user_count
       FROM roles r
       LEFT JOIN user_roles ur ON r.id = ur.role_id
       GROUP BY r.id, r.name, r.description, r.created_at
       ORDER BY r.id ASC`
    );
    const roles = rolesRes.rows;
    if (!roles.length) return [];

    // Fetch permissions for each role
    const permsRes = await db.query(
      `SELECT rp.role_id, p.id, p.name, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id`
    );

    const permsByRole = {};
    for (const p of permsRes.rows) {
      if (!permsByRole[p.role_id]) permsByRole[p.role_id] = [];
      permsByRole[p.role_id].push({
        id: p.id,
        name: p.name,
        description: p.description
      });
    }

    return roles.map(r => ({
      ...r,
      user_count: parseInt(r.user_count || '0', 10),
      permissions: permsByRole[r.id] || []
    }));
  }

  /**
   * Get role by ID with permissions
   */
  static async getRoleById(id) {
    const roleRes = await db.query(
      'SELECT id, name, description, created_at FROM roles WHERE id = $1',
      [id]
    );
    if (!roleRes.rows.length) return null;
    const role = roleRes.rows[0];

    const permsRes = await db.query(
      `SELECT p.id, p.name, p.description
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [id]
    );
    role.permissions = permsRes.rows;
    return role;
  }

  /**
   * Find role by name
   */
  static async findByName(name) {
    const res = await db.query('SELECT * FROM roles WHERE LOWER(name) = LOWER($1)', [name]);
    return res.rows[0] || null;
  }

  /**
   * Create role
   */
  static async createRole({ name, description }) {
    const res = await db.query(
      `INSERT INTO roles (name, description, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING id, name, description, created_at`,
      [name, description]
    );
    return res.rows[0];
  }

  /**
   * Update role
   */
  static async updateRole(id, { name, description }) {
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
      UPDATE roles 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, name, description, created_at
    `;

    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }

  /**
   * Delete role (prevent deleting default Admin role)
   */
  static async deleteRole(id) {
    const role = await this.getRoleById(id);
    if (role && role.name.toLowerCase() === 'admin') {
      throw new Error('Default Admin role cannot be deleted');
    }
    const res = await db.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }

  /**
   * Set permissions for a role
   */
  static async setRolePermissions(roleId, permissionIds) {
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

    if (!permissionIds || !permissionIds.length) return [];

    const inserted = [];
    for (const permId of permissionIds) {
      const res = await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING permission_id',
        [roleId, permId]
      );
      inserted.push(res.rows[0]);
    }
    return inserted;
  }
}

module.exports = RoleModel;

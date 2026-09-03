const db = require('../config/db');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const res = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const res = await db.query(
      'SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Get user with all assigned roles and aggregated permissions
   */
  static async getUserWithRolesAndPermissions(userId) {
    const userRes = await db.query(
      'SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (!userRes.rows.length) return null;
    const user = userRes.rows[0];

    // Fetch roles
    const rolesRes = await db.query(
      `SELECT r.id, r.name, r.description 
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    user.roles = rolesRes.rows;
    user.roleNames = rolesRes.rows.map(r => r.name);
    // Primary role (Admin, HR, Sales, Support, Finance)
    user.primaryRole = user.roleNames[0] || 'Employee';

    // Fetch permissions
    const permsRes = await db.query(
      `SELECT DISTINCT p.id, p.name, p.description
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    user.permissions = permsRes.rows;
    user.permissionNames = permsRes.rows.map(p => p.name);

    return user;
  }

  /**
   * Get paginated users with role details
   */
  static async getAllUsers({ search = '', role = '', status = '', limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.is_active, 
        u.created_at, 
        u.updated_at
      FROM users u
    `;
    const params = [];
    let paramIndex = 1;
    const whereClauses = [];

    if (search) {
      whereClauses.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== '' && status !== undefined) {
      whereClauses.push(`u.is_active = $${paramIndex}`);
      params.push(status === 'true' || status === true);
      paramIndex++;
    }

    if (role) {
      whereClauses.push(`u.id IN (
        SELECT ur_sub.user_id 
        FROM user_roles ur_sub 
        JOIN roles r_sub ON ur_sub.role_id = r_sub.id 
        WHERE LOWER(r_sub.name) = LOWER($${paramIndex})
      )`);
      params.push(role);
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    sql += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const usersRes = await db.query(sql, params);
    const users = usersRes.rows;

    if (!users.length) return [];

    // Fetch all assigned roles for these users
    const userIds = users.map(u => u.id);
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
    const rolesRes = await db.query(
      `SELECT ur.user_id, r.id, r.name, r.description
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id IN (${placeholders})`,
      userIds
    );

    const rolesByUser = {};
    for (const r of rolesRes.rows) {
      if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
      rolesByUser[r.user_id].push({
        id: r.id,
        name: r.name,
        description: r.description
      });
    }

    return users.map(u => ({
      ...u,
      roles: rolesByUser[u.id] || []
    }));
  }

  /**
   * Count total users matching filters
   */
  static async countUsers({ search = '', role = '', status = '' } = {}) {
    let sql = `
      SELECT COUNT(DISTINCT u.id) AS count
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== '' && status !== undefined) {
      sql += ` AND u.is_active = $${paramIndex}`;
      params.push(status === 'true' || status === true);
      paramIndex++;
    }

    if (role) {
      sql += ` AND r.name = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    const res = await db.query(sql, params);
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  /**
   * Create a new user
   */
  static async createUser({ name, email, passwordHash, isActive = true }) {
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, is_active, created_at, updated_at`,
      [name, email.toLowerCase(), passwordHash, isActive]
    );
    return res.rows[0];
  }

  /**
   * Update user details
   */
  static async updateUser(id, { name, email, isActive, passwordHash }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email.toLowerCase());
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(isActive);
    }
    if (passwordHash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, is_active, created_at, updated_at
    `;

    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }

  /**
   * Delete user
   */
  static async deleteUser(id) {
    const res = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }

  /**
   * Replace all roles assigned to a user
   */
  static async setUserRoles(userId, roleIds) {
    // Delete existing roles
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

    if (!roleIds || !roleIds.length) return [];

    // Insert new roles
    const inserted = [];
    for (const roleId of roleIds) {
      const res = await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) RETURNING role_id',
        [userId, roleId]
      );
      inserted.push(res.rows[0]);
    }
    return inserted;
  }

  /**
   * Assign a single role to a user
   */
  static async assignRole(userId, roleId) {
    const res = await db.query(
      `INSERT INTO user_roles (user_id, role_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, role_id) DO NOTHING 
       RETURNING *`,
      [userId, roleId]
    );
    return res.rows[0] || null;
  }

  /**
   * Get stats summary (total users, active users, inactive users)
   */
  static async getUserStats() {
    const totalRes = await db.query('SELECT COUNT(*) AS total FROM users');
    const activeRes = await db.query('SELECT COUNT(*) AS active FROM users WHERE is_active = TRUE');
    const rolesRes = await db.query('SELECT COUNT(*) AS total_roles FROM roles');

    return {
      totalUsers: parseInt(totalRes.rows[0]?.total || '0', 10),
      activeUsers: parseInt(activeRes.rows[0]?.active || '0', 10),
      inactiveUsers: parseInt(totalRes.rows[0]?.total || '0', 10) - parseInt(activeRes.rows[0]?.active || '0', 10),
      totalRoles: parseInt(rolesRes.rows[0]?.total_roles || '0', 10)
    };
  }
}

module.exports = UserModel;

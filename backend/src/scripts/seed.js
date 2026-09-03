const bcrypt = require('bcryptjs');
const db = require('../config/db');

const DEFAULT_PERMISSIONS = [
  // User Management
  { name: 'user:view', description: 'View user directory, profiles, and assigned roles' },
  { name: 'user:create', description: 'Create new user accounts' },
  { name: 'user:edit', description: 'Update existing user profile and settings' },
  { name: 'user:delete', description: 'Delete user accounts' },
  { name: 'user:status', description: 'Activate or deactivate user accounts' },

  // Role Management
  { name: 'role:view', description: 'View available system roles and assignments' },
  { name: 'role:create', description: 'Create new custom roles' },
  { name: 'role:edit', description: 'Modify roles and permission mappings' },
  { name: 'role:delete', description: 'Delete custom roles' },

  // Permissions & Auditing
  { name: 'permission:view', description: 'View system permissions catalog' },
  { name: 'audit:view', description: 'Inspect audit trail and security event logs' },

  // Zoho Application Access Permissions
  { name: 'access:zoho_people', description: 'Access and launch Zoho People HR portal' },
  { name: 'access:zoho_crm', description: 'Access and launch Zoho CRM sales portal' },
  { name: 'access:zoho_desk', description: 'Access and launch Zoho Desk support portal' },
  { name: 'access:zoho_books', description: 'Access and launch Zoho Books finance portal' }
];

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full portal administrative access, user/role management, audit logs, and all Zoho One applications.',
    permissions: [
      'user:view', 'user:create', 'user:edit', 'user:delete', 'user:status',
      'role:view', 'role:create', 'role:edit', 'role:delete',
      'permission:view', 'audit:view',
      'access:zoho_people', 'access:zoho_crm', 'access:zoho_desk', 'access:zoho_books'
    ]
  },
  {
    name: 'HR',
    description: 'Human Resources specialist with authorized access to Zoho People.',
    permissions: [
      'access:zoho_people'
    ]
  },
  {
    name: 'Sales',
    description: 'Sales representative with authorized access to Zoho CRM.',
    permissions: [
      'access:zoho_crm'
    ]
  },
  {
    name: 'Support',
    description: 'Customer support engineer with authorized access to Zoho Desk.',
    permissions: [
      'access:zoho_desk'
    ]
  },
  {
    name: 'Finance',
    description: 'Financial auditor / accountant with authorized access to Zoho Books.',
    permissions: [
      'access:zoho_books'
    ]
  },
  {
    name: 'Operations Manager',
    description: 'Operations leadership with cross-functional visibility, user directory access, and Zoho CRM & People access.',
    permissions: [
      'user:view', 'role:view', 'permission:view', 'audit:view',
      'access:zoho_people', 'access:zoho_crm'
    ]
  },
  {
    name: 'DevOps Lead',
    description: 'Infrastructure and platform monitoring with audit trail access and permissions catalog.',
    permissions: [
      'user:view', 'role:view', 'permission:view', 'audit:view'
    ]
  }
];

const DEMO_USERS = [
  {
    name: 'System Administrator',
    email: 'admin@example.com',
    password: 'Admin@12345',
    role: 'Admin'
  },
  {
    name: 'Sarah Connor (HR Lead)',
    email: 'hr@example.com',
    password: 'Hr@12345',
    role: 'HR'
  },
  {
    name: 'Jordan Belfort (Sales Exec)',
    email: 'sales@example.com',
    password: 'Sales@12345',
    role: 'Sales'
  },
  {
    name: 'Alex Mercer (Support Lead)',
    email: 'support@example.com',
    password: 'Support@12345',
    role: 'Support'
  },
  {
    name: 'Rachel Zane (Finance Manager)',
    email: 'finance@example.com',
    password: 'Finance@12345',
    role: 'Finance'
  },
  {
    name: 'Marcus Vance (Operations Manager)',
    email: 'ops@example.com',
    password: 'Ops@12345',
    role: 'Operations Manager'
  },
  {
    name: 'David Bowman (DevOps Lead)',
    email: 'devops@example.com',
    password: 'Devops@12345',
    role: 'DevOps Lead'
  }
];

async function seedDatabase(force = false) {
  try {
    // 1. Seed Permissions
    const permMap = new Map();
    for (const perm of DEFAULT_PERMISSIONS) {
      const existing = await db.query('SELECT id, name FROM permissions WHERE LOWER(name) = LOWER($1)', [perm.name]);
      if (existing.rows.length > 0) {
        permMap.set(perm.name, existing.rows[0].id);
      } else {
        const res = await db.query(
          'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING id, name',
          [perm.name, perm.description]
        );
        permMap.set(perm.name, res.rows[0].id);
      }
    }

    // 2. Seed Roles and RolePermissions
    const roleMap = new Map();
    for (const role of DEFAULT_ROLES) {
      let roleId;
      const existing = await db.query('SELECT id, name FROM roles WHERE LOWER(name) = LOWER($1)', [role.name]);
      
      if (existing.rows.length > 0) {
        roleId = existing.rows[0].id;
      } else {
        const res = await db.query(
          'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name',
          [role.name, role.description]
        );
        roleId = res.rows[0].id;
      }
      roleMap.set(role.name, roleId);

      // Attach Permissions to Role
      for (const permName of role.permissions) {
        const permId = permMap.get(permName);
        if (permId && roleId) {
          await db.query(
            `INSERT INTO role_permissions (role_id, permission_id) 
             VALUES ($1, $2) 
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [roleId, permId]
          );
        }
      }
    }

    // 3. Seed Demo Users
    for (const user of DEMO_USERS) {
      const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [user.email]);
      
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        if (force) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(user.password, salt);
          await db.query(
            'UPDATE users SET name = $1, password_hash = $2, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [user.name, hash, userId]
          );
        }
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        const res = await db.query(
          `INSERT INTO users (name, email, password_hash, is_active) 
           VALUES ($1, $2, $3, TRUE) 
           RETURNING id`,
          [user.name, user.email.toLowerCase(), hash]
        );
        userId = res.rows[0].id;
      }

      // Assign User Role
      const roleId = roleMap.get(user.role);
      if (userId && roleId) {
        await db.query(
          `INSERT INTO user_roles (user_id, role_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, role_id) DO NOTHING`,
          [userId, roleId]
        );
      }
    }

    console.log('✅ Database successfully seeded with default roles, permissions, and demo users.');
    return true;
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    throw err;
  }
}

async function runStandaloneSeed() {
  console.log('🌱 Seeding database...');
  try {
    await db.initializeDatabase();
    await seedDatabase(true);
    console.log('🌱 Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runStandaloneSeed();
}

module.exports = { seedDatabase, runStandaloneSeed };

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const { seedDatabase } = require('../src/scripts/seed');

describe('Full-Stack RBAC & Authentication Test Suite', () => {
  let adminToken;
  let hrToken;
  let salesToken;
  let supportToken;
  let financeToken;
  let opsToken;
  let devopsToken;
  let createdUserId;
  let createdRoleId;

  beforeAll(async () => {
    // Initialize test DB and seed data
    await db.initializeDatabase();
    await seedDatabase(true);
  });

  // 1. Authentication Tests
  describe('POST /api/auth/login', () => {
    it('should authenticate Admin user and return JWT + all 4 authorized Zoho apps', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.roleNames).toContain('Admin');
      expect(res.body.user.password_hash).toBeUndefined();
      expect(res.body.user.authorizedApps.length).toBe(4);

      adminToken = res.body.token;
    });

    it('should authenticate HR user and return JWT + only Zoho People app', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hr@example.com',
          password: 'Hr@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.roleNames).toContain('HR');
      expect(res.body.user.authorizedApps.length).toBe(1);
      expect(res.body.user.authorizedApps[0].id).toBe('zoho-people');

      hrToken = res.body.token;
    });

    it('should authenticate Sales user and return JWT + only Zoho CRM app', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sales@example.com',
          password: 'Sales@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.authorizedApps.length).toBe(1);
      expect(res.body.user.authorizedApps[0].id).toBe('zoho-crm');

      salesToken = res.body.token;
    });

    it('should authenticate Support user and return JWT + only Zoho Desk app', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'support@example.com',
          password: 'Support@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.authorizedApps.length).toBe(1);
      expect(res.body.user.authorizedApps[0].id).toBe('zoho-desk');

      supportToken = res.body.token;
    });

    it('should authenticate Finance user and return JWT + only Zoho Books app', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'finance@example.com',
          password: 'Finance@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.authorizedApps.length).toBe(1);
      expect(res.body.user.authorizedApps[0].id).toBe('zoho-books');

      financeToken = res.body.token;
    });

    it('should authenticate Operations Manager and return JWT + People & CRM apps', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ops@example.com',
          password: 'Ops@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.roleNames).toContain('Operations Manager');
      expect(res.body.user.authorizedApps.length).toBe(2);

      opsToken = res.body.token;
    });

    it('should authenticate DevOps Lead user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'devops@example.com',
          password: 'Devops@12345'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.roleNames).toContain('DevOps Lead');

      devopsToken = res.body.token;
    });

    it('should reject login with incorrect password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'WrongPassword999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('InvalidCredentials');
    });

    it('should reject login with non-existent email (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'SomePassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 2. JWT & Current User Profile Tests
  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@example.com');
      expect(res.body.user.password_hash).toBeUndefined();
    });

    it('should reject request without Bearer token (401)', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject request with malformed Bearer token (401)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');
      expect(res.status).toBe(401);
    });
  });

  // 3. RBAC Admin-Only Protection Tests
  describe('Admin Routes Protection (HTTP 403 Verification)', () => {
    it('Admin can access GET /api/users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Non-Admin (HR) is forbidden from GET /api/users (403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('Non-Admin (Sales) is forbidden from GET /api/audit-logs (403)', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('Non-Admin (Finance) is forbidden from GET /api/roles (403)', async () => {
      const res = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${financeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  // 4. Role-Specific Application Entitlement Tests
  describe('Zoho Applications RBAC Matrix Enforcement', () => {
    it('HR can access Zoho People (200)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-people')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.app.name).toBe('Zoho People');
    });

    it('HR is strictly FORBIDDEN from accessing Zoho CRM (403)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-crm')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('Sales can access Zoho CRM (200)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-crm')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.app.name).toBe('Zoho CRM');
    });

    it('Sales is strictly FORBIDDEN from accessing Zoho Books (403)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-books')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('Support can access Zoho Desk (200)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-desk')
        .set('Authorization', `Bearer ${supportToken}`);

      expect(res.status).toBe(200);
      expect(res.body.app.name).toBe('Zoho Desk');
    });

    it('Finance can access Zoho Books (200)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-books')
        .set('Authorization', `Bearer ${financeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.app.name).toBe('Zoho Books');
    });

    it('Operations Manager can access Zoho People and Zoho CRM (200)', async () => {
      const peopleRes = await request(app)
        .get('/api/apps/zoho-people')
        .set('Authorization', `Bearer ${opsToken}`);
      expect(peopleRes.status).toBe(200);

      const crmRes = await request(app)
        .get('/api/apps/zoho-crm')
        .set('Authorization', `Bearer ${opsToken}`);
      expect(crmRes.status).toBe(200);
    });

    it('Operations Manager is FORBIDDEN from Zoho Desk (403)', async () => {
      const res = await request(app)
        .get('/api/apps/zoho-desk')
        .set('Authorization', `Bearer ${opsToken}`);
      expect(res.status).toBe(403);
    });

    it('Admin can access ALL Zoho applications (200 for each)', async () => {
      const apps = ['zoho-people', 'zoho-crm', 'zoho-desk', 'zoho-books'];
      for (const appKey of apps) {
        const res = await request(app)
          .get(`/api/apps/${appKey}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
      }
    });
  });

  // 5. User Management CRUD & Persistence Tests
  describe('User Management End-to-End Flow', () => {
    it('Admin can create a new user with multiple roles', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Samantha Wright',
          email: 'samantha.wright@example.com',
          password: 'Password@123',
          isActive: true,
          roleIds: [2, 3] // HR and Sales
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Samantha Wright');
      expect(res.body.user.roleNames).toContain('HR');
      expect(res.body.user.roleNames).toContain('Sales');

      createdUserId = res.body.user.id;
    });

    it('Admin can update the user details and role assignments', async () => {
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Samantha Wright (Lead)',
          email: 'samantha.wright@example.com',
          isActive: true,
          roleIds: [1] // Promoted to Admin
        });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Samantha Wright (Lead)');
      expect(res.body.user.roleNames).toContain('Admin');
    });

    it('Admin can deactivate and reactivate a user', async () => {
      // Deactivate
      const deactRes = await request(app)
        .patch(`/api/users/${createdUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(deactRes.status).toBe(200);

      // Verify deactivated user cannot log in
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'samantha.wright@example.com',
          password: 'Password@123'
        });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error).toBe('AccountDeactivated');

      // Reactivate
      const reactRes = await request(app)
        .patch(`/api/users/${createdUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(reactRes.status).toBe(200);
    });

    it('Admin can delete user', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  // 6. Role & Permission Management CRUD Tests
  describe('Role Management Flow', () => {
    it('Admin can create custom role', async () => {
      const res = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Security Analyst',
          description: 'Cybersecurity inspection and compliance monitoring',
          permissionIds: [1, 11]
        });

      expect(res.status).toBe(201);
      expect(res.body.role.name).toBe('Security Analyst');
      createdRoleId = res.body.role.id;
    });

    it('Admin can fetch all roles with permissions', async () => {
      const res = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const roleNames = res.body.data.map(r => r.name);
      expect(roleNames).toContain('Admin');
      expect(roleNames).toContain('HR');
      expect(roleNames).toContain('Operations Manager');
      expect(roleNames).toContain('Security Analyst');
    });

    it('Admin can delete custom role', async () => {
      const res = await request(app)
        .delete(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  // 7. Audit Trail Verification
  describe('Audit Trail Logging', () => {
    it('Admin can query audit logs and view recorded events', async () => {
      const res = await request(app)
        .get('/api/audit-logs?limit=50')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const actions = res.body.data.map(l => l.action);
      expect(actions).toContain('LOGIN_SUCCESS');
      expect(actions).toContain('UNAUTHORIZED_APP_ACCESS_DENIED');
    });
  });

  // 8. Zero Credentials Exposure Security Test
  describe('Security Check: No Sensitive Credentials Exposed', () => {
    it('should never expose Zoho Client Secret or Refresh Token in API responses', async () => {
      const res = await request(app)
        .get('/api/apps/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toContain('client_secret');
      expect(bodyStr).not.toContain('refresh_token');
      expect(bodyStr).not.toContain('password_hash');
    });
  });
});

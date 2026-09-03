# Custom Employee Portal with Zoho One Integration

> **Production-Grade Enterprise Employee Portal** featuring strict Role-Based Access Control (RBAC), JWT authentication, immutable security audit logging, and secure backend-isolated Zoho One OAuth 2.0 integration.

---

## 🌟 Executive Summary & Features

- **Strict Role-Based Access Control (RBAC)**: Enforced both on the frontend UI and at the backend API gateway. Unauthorized requests are strictly denied with `HTTP 403 Forbidden` and recorded in audit logs.
- **Enterprise Dark Theme UI**: Built with React and modern CSS design tokens, featuring glassmorphic navigation, responsive drawers, dynamic authorized application grids, modal dialogues, and toast notifications with high contrast WCAG-compliant readability.
- **Zero Credential Exposure**: Zoho OAuth secrets (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`) reside strictly on the backend server in environment variables. Employees and client browsers never receive or handle Zoho secrets.
- **Dynamic Authorized Application Delivery**:
  - **Admin**: Full portal access + all 4 Zoho One apps (Zoho People, Zoho CRM, Zoho Desk, Zoho Books) + complete Admin Center.
  - **HR**: Authorized access exclusively to **Zoho People** (HR management).
  - **Sales**: Authorized access exclusively to **Zoho CRM** (Customer Relationship Management).
  - **Support**: Authorized access exclusively to **Zoho Desk** (Support Ticket & Case Management).
  - **Finance**: Authorized access exclusively to **Zoho Books** (Financial & Accounting Management).
  - **Operations Manager**: Cross-functional access to **Zoho People** and **Zoho CRM**.
  - **DevOps Lead**: Infrastructure & audit trail inspection with permissions catalog.
- **Admin Center Management**:
  - **User Governance**: Create, edit, activate/deactivate, assign dynamic roles, and delete users.
  - **Roles & Permissions Matrix**: Create custom roles and configure granular permission flags.
  - **Security Audit Trails**: Filterable, searchable logs with IP tracking and JSON payload inspection.
  - **Zoho Diagnostics Widget**: Safe live verification of OAuth token health and base endpoint connectivity.
- **Robust Database Layer**: PostgreSQL relational schema with 6 relational tables (`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `audit_logs`), foreign key constraints, cascade triggers, and performance indexes.
- **Reviewer-Friendly Quick Login**: One-click demo credentials quick-fill buttons on the login screen.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React.js + Vite)"]
        UI_Login["Login Page (Demo Quick-Select)"]
        UI_Dash["Employee Dashboard (Authorized App Cards)"]
        UI_Admin["Admin Center (Users, Roles, Audit Logs)"]
        UI_Axios["Axios API Client (JWT Interceptor)"]
    end

    subgraph Server ["Server Layer (Node.js + Express.js)"]
        MW_RateLimit["Rate Limiter & Helmet Security"]
        MW_Auth["JWT Authentication Middleware"]
        MW_RBAC["RBAC & Permission Enforcer (HTTP 403)"]
        MW_Audit["Audit Log Interceptor"]
        
        API_Auth["/api/auth (Login, Me, Profile, Logout)"]
        API_Users["/api/users (CRUD, Status, Roles)"]
        API_Roles["/api/roles (Roles & Permissions Matrix)"]
        API_Audit["/api/audit-logs (Search, Filter, Export)"]
        API_Apps["/api/apps (Authorized Zoho Apps & Launch)"]
        
        SVC_Zoho["zohoService.js (OAuth2 Token Refresh & Proxy)"]
    end

    subgraph Database ["Data Layer (PostgreSQL Relational DB)"]
        DB_Users[("users")]
        DB_Roles[("roles")]
        DB_Perms[("permissions")]
        DB_UserRoles[("user_roles")]
        DB_RolePerms[("role_permissions")]
        DB_Audit[("audit_logs")]
    end

    UI_Axios -->|Bearer JWT| MW_RateLimit
    MW_RateLimit --> MW_Auth
    MW_Auth --> MW_RBAC
    MW_RBAC --> MW_Audit
    
    MW_Audit --> API_Auth & API_Users & API_Roles & API_Audit & API_Apps
    API_Apps --> SVC_Zoho
    SVC_Zoho -.->|Encrypted OAuth2 Backend Only| ZohoCloud["Zoho One Cloud APIs"]
    
    API_Auth --> DB_Users
    API_Users --> DB_Users & DB_UserRoles
    API_Roles --> DB_Roles & DB_RolePerms
    API_Audit --> DB_Audit
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, React Router v7, Lucide React icons, Axios, Vanilla CSS Design System.
- **Backend**: Node.js, Express.js, `pg` (node-postgres), `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`, `express-rate-limit`.
- **Database**: PostgreSQL (Relational schema with 6 tables + indexes).
- **Testing**: Jest, Supertest (34/34 automated tests passing).

---

## 📁 Project Structure

```
custom-employee-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL connection pool & migrations
│   │   │   ├── env.js                # Validated environment configuration
│   │   │   └── zohoConfig.js         # Zoho One apps & RBAC metadata
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, me, profile, logout
│   │   │   ├── userController.js     # User management & status toggles
│   │   │   ├── roleController.js     # Role CRUD & permission matrix
│   │   │   ├── permissionController.js # Permissions catalog
│   │   │   ├── auditController.js    # Audit log querying & filtering
│   │   │   └── appController.js      # Authorized Zoho apps & secure launch
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # Bearer JWT verification & active status
│   │   │   ├── rbacMiddleware.js     # Role, permission, and app authorization (403)
│   │   │   ├── rateLimiter.js        # Auth & API rate limiters
│   │   │   ├── validator.js          # Input validation & sanitization
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   ├── schema.sql            # PostgreSQL DDL for 6 tables & indexes
│   │   │   ├── userModel.js          # User SQL queries
│   │   │   ├── roleModel.js          # Role SQL queries
│   │   │   ├── permissionModel.js    # Permission SQL queries
│   │   │   └── auditLogModel.js      # Audit log SQL queries
│   │   ├── routes/                   # Modular Express routers
│   │   ├── services/
│   │   │   ├── authService.js        # Bcrypt hashing & JWT signing
│   │   │   ├── auditService.js       # Security audit event recorder
│   │   │   └── zohoService.js        # Zoho OAuth refresh token grant & proxy
│   │   ├── scripts/
│   │   │   ├── migrate.js            # Database migration runner
│   │   │   └── seed.js               # Database seeder with demo accounts
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point
│   ├── tests/
│   │   └── auth_rbac.test.js         # Automated test suite (34 tests)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Sidebar, Navbar, Modal, ConfirmDialog, Toast
│   │   │   ├── auth/                 # ProtectedRoute guard
│   │   │   ├── dashboard/            # AppCard, AppLaunchModal
│   │   │   └── admin/                # UserModal, RoleModal, AuditDetailsModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state & RBAC helper methods
│   │   │   └── ToastContext.jsx      # Global toast dispatch
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Login with quick-fill demo pills
│   │   │   ├── DashboardPage.jsx     # Dynamic authorized Zoho app dashboard
│   │   │   ├── ApplicationsPage.jsx  # Dedicated Zoho apps portal
│   │   │   ├── ProfilePage.jsx       # Profile, permissions, password update
│   │   │   └── admin/                # Admin Center, Users, Roles, Audit Logs
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with JWT interceptor
│   │   ├── styles/                   # index.css, layout.css, components.css
│   │   ├── App.jsx                   # Application router & layout structure
│   │   └── main.jsx                  # React entry point
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation, the login page features **one-click quick-fill buttons** for each role:

| Role | Email | Password | Authorized Applications / Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@12345` | **All 4 Zoho Apps** (People, CRM, Desk, Books) + **Admin Center** |
| **HR Lead** | `hr@example.com` | `Hr@12345` | **Zoho People** only |
| **Sales Exec** | `sales@example.com` | `Sales@12345` | **Zoho CRM** only |
| **Support Lead** | `support@example.com` | `Support@12345` | **Zoho Desk** only |
| **Finance Manager** | `finance@example.com` | `Finance@12345` | **Zoho Books** only |
| **Operations Manager** | `ops@example.com` | `Ops@12345` | **Zoho People & Zoho CRM** |
| **DevOps Lead** | `devops@example.com` | `Devops@12345` | **Audit Logs & System Permissions Catalog** |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: (Optional for local live DB; in-memory PostgreSQL engine starts automatically if live DB is absent).

### 2. Installation
Clone the repository and install root, backend, and frontend dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Environment Setup

Copy `.env.example` templates to `.env`:

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

### 4. Database Setup & Seeding

If you have a live PostgreSQL database:
```bash
# Set your DATABASE_URL in backend/.env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/employee_portal_db

# Run migrations and initial seeding
cd backend
npm run migrate
npm run seed
cd ..
```

*(If PostgreSQL is not running locally, the backend automatically initializes an in-memory PostgreSQL engine with default seed data).*

### 5. Running the Application

You can start both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

Or run them individually:
```bash
# Start backend (Port 5000)
cd backend && npm run dev

# Start frontend (Port 5173)
cd frontend && npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Module / Endpoint | Admin | HR | Sales | Support | Finance | Operations | DevOps |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Zoho People** (`/api/apps/zoho-people`) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Zoho CRM** (`/api/apps/zoho-crm`) | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Zoho Desk** (`/api/apps/zoho-desk`) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Zoho Books** (`/api/apps/zoho-books`) | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **User Management** (`/api/users/*`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Role & Perm Matrix** (`/api/roles/*`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs** (`/api/audit-logs/*`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Employee Profile** (`/api/auth/profile`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Unauthorized attempts return `HTTP 403 Forbidden` with a security audit event recorded.*

---

## 🔐 Zoho One OAuth 2.0 Integration Guide

### Zero-Exposure Architecture
1. The client browser **never** communicates directly with Zoho OAuth endpoints.
2. All client keys, client secrets, and refresh tokens are stored exclusively in `backend/.env`.
3. When an employee clicks **Launch Application**:
   - Backend evaluates user's RBAC role and permission flags.
   - If unauthorized -> returns `HTTP 403 Forbidden` and writes an audit log.
   - If authorized -> requests or reuses a cached OAuth 2.0 Access Token via `grant_type=refresh_token`.
   - Returns a secure one-time session URL or proxies API data.

### How to Configure Real Zoho One Credentials
1. Register an application in the [Zoho API Console](https://api-console.zoho.com).
2. Choose **Server-based Applications**.
3. Set Authorized Redirect URI (e.g. `http://localhost:5000/api/auth/zoho/callback`).
4. Generate a Refresh Token with scopes:
   `ZohoCRM.modules.ALL,ZohoPeople.employee.ALL,Desk.tickets.ALL,ZohoBooks.fullaccess.ALL`
5. Place the credentials in `backend/.env`:
   ```env
   ZOHO_CLIENT_ID=1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ZOHO_REFRESH_TOKEN=1000.yyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
   ZOHO_API_BASE_URL=https://www.zohoapis.com
   ```
6. If credentials are not provided, the backend operates in **Safe Demonstration Mode** without exposing any secrets or crashing.

---

## 🧪 Automated Testing

To run the automated Jest integration test suite:

```bash
cd backend
npm test
```

### Test Suite Coverage (34 Tests Passing)
- **Authentication**: Valid login, bad password, non-existent user, deactivated user blocking.
- **JWT Middleware**: Token generation, verification, missing token (401), malformed token (401).
- **RBAC Matrix**: HTTP 403 enforcement across all non-admin roles and protected endpoints.
- **Zoho Access Control**: Application entitlements tested for HR, Sales, Support, Finance, Operations, and Admin.
- **User CRUD & Status**: Full lifecycle user creation, editing, active status toggle, and deletion.
- **Role CRUD**: Custom role creation, permission assignment, and role deletion.
- **Audit Logs**: Querying audit events (`LOGIN_SUCCESS`, `UNAUTHORIZED_APP_ACCESS_DENIED`).
- **Security Check**: Verification that Zoho secrets and password hashes are never exposed in API outputs.

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: `bcryptjs` with salt rounds = 10.
2. **JWT Signing**: Cryptographically signed with expiration (`JWT_EXPIRES_IN=8h`).
3. **Parameterization**: 100% of SQL queries use parameterized arguments (`$1, $2, ...`) to prevent SQL injection.
4. **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks.
5. **Security Headers**: `helmet` configures HTTP response security headers.
6. **Audit Trail**: Every authentication, authorization failure, and administrative action is logged with client IP and timestamps.

---

## 📄 License

This project was built for a technical hiring assignment. All rights reserved.

const env = require('./env');

const ZOHO_APPLICATIONS = [
  {
    id: 'zoho-people',
    key: 'zoho_people',
    name: 'Zoho People',
    tagline: 'HR & People Management',
    description: 'Manage employee records, time tracking, leave approvals, performance evaluations, and HR operations in one unified workspace.',
    category: 'Human Resources',
    authorizedRoles: ['Admin', 'HR'],
    requiredPermission: 'access:zoho_people',
    url: env.ZOHO_PEOPLE_URL,
    icon: 'Users',
    themeColor: '#10b981', // Emerald
    accentBg: 'rgba(16, 185, 129, 0.12)',
    features: [
      'Employee Directory & Profiles',
      'Leave & Attendance Tracker',
      'Timesheet Management',
      'Performance Appraisals'
    ]
  },
  {
    id: 'zoho-crm',
    key: 'zoho_crm',
    name: 'Zoho CRM',
    tagline: 'Customer Relationship Management',
    description: 'Engage leads, accelerate sales pipelines, manage client accounts, and track deals with intelligent customer lifecycle analytics.',
    category: 'Sales & Growth',
    authorizedRoles: ['Admin', 'Sales'],
    requiredPermission: 'access:zoho_crm',
    url: env.ZOHO_CRM_URL,
    icon: 'Briefcase',
    themeColor: '#3b82f6', // Blue
    accentBg: 'rgba(59, 130, 246, 0.12)',
    features: [
      'Lead & Pipeline Management',
      'Deal Stage Tracking',
      'Account & Contact Management',
      'Revenue Forecasting'
    ]
  },
  {
    id: 'zoho-desk',
    key: 'zoho_desk',
    name: 'Zoho Desk',
    tagline: 'Support & Help Desk Management',
    description: 'Manage customer service inquiries, resolve support tickets, maintain SLA compliance, and deliver exceptional post-sales support.',
    category: 'Customer Support',
    authorizedRoles: ['Admin', 'Support'],
    requiredPermission: 'access:zoho_desk',
    url: env.ZOHO_DESK_URL,
    icon: 'Headphones',
    themeColor: '#f59e0b', // Amber
    accentBg: 'rgba(245, 158, 11, 0.12)',
    features: [
      'Multi-channel Ticket Tracking',
      'SLA & Escalation Rules',
      'Customer Feedback & CSAT',
      'Knowledge Base Repository'
    ]
  },
  {
    id: 'zoho-books',
    key: 'zoho_books',
    name: 'Zoho Books',
    tagline: 'Financial & Accounting Management',
    description: 'Oversee corporate invoicing, manage cash flow, monitor billable expenses, track vendor payments, and generate tax reports.',
    category: 'Finance & Accounting',
    authorizedRoles: ['Admin', 'Finance'],
    requiredPermission: 'access:zoho_books',
    url: env.ZOHO_BOOKS_URL,
    icon: 'DollarSign',
    themeColor: '#8b5cf6', // Purple
    accentBg: 'rgba(139, 92, 246, 0.12)',
    features: [
      'Invoicing & Billing Automation',
      'Expense & Bill Approvals',
      'Bank Reconciliation',
      'Financial P&L Auditing'
    ]
  }
];

module.exports = {
  ZOHO_APPLICATIONS
};

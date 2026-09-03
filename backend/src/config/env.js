require('dotenv').config();

const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';
const isIndia = accountsUrl.includes('.in');

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_dev_jwt_secret_987654321_replace_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/employee_portal_db',
  
  // Zoho One OAuth credentials (strictly backend)
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID || '',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || '',
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN || '',
  ZOHO_ACCOUNTS_URL: accountsUrl,
  ZOHO_API_BASE_URL: process.env.ZOHO_API_BASE_URL || (isIndia ? 'https://www.zohoapis.in' : 'https://www.zohoapis.com'),
  
  // Configurable application access endpoints
  ZOHO_PEOPLE_URL: process.env.ZOHO_PEOPLE_URL || (isIndia ? 'https://people.zoho.in' : 'https://people.zoho.com'),
  ZOHO_CRM_URL: process.env.ZOHO_CRM_URL || (isIndia ? 'https://crm.zoho.in' : 'https://crm.zoho.com'),
  ZOHO_DESK_URL: process.env.ZOHO_DESK_URL || (isIndia ? 'https://desk.zoho.in' : 'https://desk.zoho.com'),
  ZOHO_BOOKS_URL: process.env.ZOHO_BOOKS_URL || (isIndia ? 'https://books.zoho.in' : 'https://books.zoho.com'),
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};

module.exports = env;

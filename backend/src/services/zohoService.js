const axios = require('axios');
const env = require('../config/env');
const { ZOHO_APPLICATIONS } = require('../config/zohoConfig');

class ZohoService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiresAt = 0; // Timestamp in ms
    this.tokenScope = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Check if Zoho OAuth environment credentials are configured
   */
  isConfigured() {
    return Boolean(
      env.ZOHO_CLIENT_ID &&
      env.ZOHO_CLIENT_SECRET &&
      env.ZOHO_REFRESH_TOKEN &&
      env.ZOHO_CLIENT_ID.trim() !== '' &&
      env.ZOHO_CLIENT_SECRET.trim() !== '' &&
      env.ZOHO_REFRESH_TOKEN.trim() !== ''
    );
  }

  /**
   * Safe status check for frontend & admin dashboard
   * Note: NEVER returns client secrets or refresh tokens!
   */
  getIntegrationStatus() {
    const configured = this.isConfigured();
    const tokenValid = Boolean(this.accessToken && Date.now() < this.tokenExpiresAt);
    
    return {
      configured,
      status: configured ? (tokenValid ? 'CONNECTED' : 'CONFIGURED') : 'NOT_CONFIGURED',
      accountsUrl: env.ZOHO_ACCOUNTS_URL,
      apiBaseUrl: env.ZOHO_API_BASE_URL,
      tokenCached: tokenValid,
      tokenExpiresInSeconds: tokenValid ? Math.max(0, Math.floor((this.tokenExpiresAt - Date.now()) / 1000)) : 0,
      supportedApps: ZOHO_APPLICATIONS.map(app => ({
        id: app.id,
        name: app.name,
        category: app.category,
        authorizedRoles: app.authorizedRoles,
        url: app.url
      })),
      message: configured
        ? 'Zoho One OAuth 2.0 integration configured in backend environment.'
        : 'Zoho integration is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN in backend/.env to connect real Zoho One APIs.'
    };
  }

  /**
   * Safe Health Check endpoint for /api/zoho/health
   */
  async getHealth() {
    const configured = this.isConfigured();
    let authenticated = false;

    if (configured) {
      try {
        await this.getAccessToken();
        authenticated = true;
      } catch (err) {
        authenticated = false;
      }
    }

    const region = env.ZOHO_ACCOUNTS_URL.includes('.in') ? 'in' : (env.ZOHO_ACCOUNTS_URL.includes('.eu') ? 'eu' : 'com');

    return {
      configured,
      authenticated,
      region,
      services: {
        people: true,
        crm: true,
        books: true,
        desk: true
      }
    };
  }

  /**
   * Fetch or refresh OAuth access token using refresh token grant
   */
  async getAccessToken() {
    if (!this.isConfigured()) {
      const err = new Error('Zoho integration is not configured in backend environment variables.');
      err.code = 'ZOHO_NOT_CONFIGURED';
      err.statusCode = 503;
      throw err;
    }

    // Return cached token if still valid (with 60s safety buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    // If a refresh is already in flight, reuse its promise
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const tokenUrl = `${env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
        const params = new URLSearchParams({
          refresh_token: env.ZOHO_REFRESH_TOKEN,
          client_id: env.ZOHO_CLIENT_ID,
          client_secret: env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token'
        });

        const response = await axios.post(tokenUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        });

        if (response.data.error) {
          throw new Error(`Zoho OAuth Error: ${response.data.error}`);
        }

        const { access_token, expires_in, scope } = response.data;
        if (!access_token) {
          throw new Error('No access_token returned in Zoho OAuth response');
        }

        this.accessToken = access_token;
        // Zoho expires_in is in seconds (typically 3600)
        this.tokenExpiresAt = Date.now() + (expires_in || 3600) * 1000;
        this.tokenScope = scope || null;

        console.log(`✅ Zoho OAuth Access Token refreshed successfully. Valid for ${expires_in || 3600}s`);
        return this.accessToken;
      } catch (error) {
        console.error('❌ Failed to refresh Zoho OAuth token:', error.response?.data || error.message);
        const err = new Error(
          error.response?.data?.error || error.message || 'Failed to obtain Zoho access token'
        );
        err.statusCode = error.response?.status || 502;
        throw err;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return await this.refreshPromise;
  }

  /**
   * Make an authorized backend proxy request to Zoho API
   * @param {string} endpoint - Path relative to ZOHO_API_BASE_URL
   * @param {string} method - GET, POST, PUT, DELETE
   * @param {object} data - Payload
   * @param {object} params - Query parameters
   */
  async request({ endpoint, method = 'GET', data = null, params = {} }) {
    const token = await this.getAccessToken();

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${env.ZOHO_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    try {
      const response = await axios({
        url,
        method,
        data,
        params,
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return response.data;
    } catch (error) {
      console.error(`Zoho API Request Error [${method} ${url}]:`, error.response?.data || error.message);
      const err = new Error(
        error.response?.data?.message || error.response?.data?.error || error.message || 'Zoho API request failed'
      );
      err.statusCode = error.response?.status || 502;
      err.zohoResponse = error.response?.data;
      throw err;
    }
  }

  /**
   * Filter and return authorized Zoho applications for a given user role & permissions
   */
  getAuthorizedApplications(user) {
    if (!user) return [];

    const userRoles = user.roleNames || (user.roles && user.roles.map(r => r.name)) || [];
    const userPermissions = user.permissionNames || (user.permissions && user.permissions.map(p => p.name)) || [];
    const isAdmin = userRoles.includes('Admin');

    return ZOHO_APPLICATIONS.filter(app => {
      // Admin gets access to all applications
      if (isAdmin) return true;

      // Check role authorization
      const hasRole = app.authorizedRoles.some(role => userRoles.includes(role));
      // Check granular permission authorization
      const hasPermission = userPermissions.includes(app.requiredPermission);

      return hasRole || hasPermission;
    }).map(app => ({
      id: app.id,
      key: app.key,
      name: app.name,
      tagline: app.tagline,
      description: app.description,
      category: app.category,
      url: app.url,
      icon: app.icon,
      themeColor: app.themeColor,
      accentBg: app.accentBg,
      features: app.features,
      authorizedRoles: app.authorizedRoles
    }));
  }

  /**
   * Verify if a specific user can access a specific application
   */
  canUserAccessApp(user, appIdentifier) {
    const authorized = this.getAuthorizedApplications(user);
    return authorized.some(
      app => app.id === appIdentifier || app.key === appIdentifier || app.name.toLowerCase() === appIdentifier.toLowerCase()
    );
  }
}

module.exports = new ZohoService();

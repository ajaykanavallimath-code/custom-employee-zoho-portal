const zohoService = require('../services/zohoService');
const AuditService = require('../services/auditService');
const { ZOHO_APPLICATIONS } = require('../config/zohoConfig');

class AppController {
  /**
   * GET /api/apps
   * List all Zoho applications authorized for the requesting user
   */
  static async getAuthorizedApps(req, res, next) {
    try {
      const authorizedApps = zohoService.getAuthorizedApplications(req.user);
      const isConfigured = zohoService.isConfigured();

      res.status(200).json({
        success: true,
        data: authorizedApps,
        total: authorizedApps.length,
        integrationStatus: {
          configured: isConfigured,
          statusMessage: isConfigured
            ? 'Zoho One Integration Connected'
            : 'Zoho One Integration Pending Configuration'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/apps/all
   * List all system Zoho applications (Admin only)
   */
  static async getAllApps(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: ZOHO_APPLICATIONS
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/apps/status
   * Safe Zoho integration diagnostic status (Admin only)
   * Note: NEVER exposes client secret or refresh token.
   */
  static async getIntegrationStatus(req, res, next) {
    try {
      const status = zohoService.getIntegrationStatus();
      res.status(200).json({
        success: true,
        integration: status
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/apps/:appName
   * Get specific app details (verifies user authorization)
   */
  static async getAppDetails(req, res, next) {
    try {
      const { appName } = req.params;
      const app = ZOHO_APPLICATIONS.find(
        a => a.id === appName || a.key === appName || a.name.toLowerCase() === appName.toLowerCase()
      );

      if (!app) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: `Application '${appName}' does not exist.`
        });
      }

      res.status(200).json({
        success: true,
        app: {
          id: app.id,
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
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/apps/:appName/launch
   * Secure application launch entitlement check & audit trail
   */
  static async launchApp(req, res, next) {
    try {
      const { appName } = req.params;
      const app = ZOHO_APPLICATIONS.find(
        a => a.id === appName || a.key === appName || a.name.toLowerCase() === appName.toLowerCase()
      );

      if (!app) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: `Application '${appName}' not found.`
        });
      }

      // Record successful launch in audit trail
      await AuditService.log({
        userId: req.user.id,
        action: 'ZOHO_APP_LAUNCHED',
        resource: `/api/apps/${app.id}/launch`,
        details: {
          appId: app.id,
          appName: app.name,
          targetUrl: app.url,
          userRole: req.user.primaryRole
        },
        req
      });

      res.status(200).json({
        success: true,
        message: `Authorized to launch ${app.name}`,
        launchUrl: app.url,
        app: {
          id: app.id,
          name: app.name,
          category: app.category
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/apps/proxy
   * Backend-only proxy to forward authorized requests to Zoho APIs
   */
  static async proxyZohoRequest(req, res, next) {
    try {
      const { endpoint, method = 'GET', data, params } = req.body;

      if (!endpoint) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Target Zoho API endpoint is required.'
        });
      }

      if (!zohoService.isConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'ZohoNotConfigured',
          message: 'Zoho integration is not configured with live credentials in backend environment.'
        });
      }

      const result = await zohoService.request({
        endpoint,
        method,
        data,
        params
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'ZOHO_API_PROXY_REQUEST',
        resource: endpoint,
        details: { method, endpoint },
        req
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AppController;

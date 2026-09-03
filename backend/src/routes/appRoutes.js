const express = require('express');
const router = express.Router();
const AppController = require('../controllers/appController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole, requireZohoAppAccess } = require('../middlewares/rbacMiddleware');

// All app routes require authentication
router.use(authenticateToken);

// List authorized applications for current user
router.get('/', AppController.getAuthorizedApps);

// Admin-only application catalog and integration diagnostics
router.get('/all', requireRole(['Admin']), AppController.getAllApps);
router.get('/status', requireRole(['Admin']), AppController.getIntegrationStatus);

// Specific application routes protected by application-level RBAC
router.get('/:appName', requireZohoAppAccess('appName'), AppController.getAppDetails);
router.post('/:appName/launch', requireZohoAppAccess('appName'), AppController.launchApp);

// Proxy requests to Zoho One backend APIs
router.post('/proxy/request', AppController.proxyZohoRequest);

module.exports = router;

const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');

// Audit logs are strictly restricted to Admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

router.get('/', AuditController.getAuditLogs);
router.get('/recent', AuditController.getRecentActivity);

module.exports = router;

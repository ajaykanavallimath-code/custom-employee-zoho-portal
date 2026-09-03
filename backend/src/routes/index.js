const express = require('express');
const router = express.Router();
const zohoService = require('../services/zohoService');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const auditRoutes = require('./auditRoutes');
const appRoutes = require('./appRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Custom Employee Portal API'
  });
});

// Dedicated Safe Zoho Integration Health Check (Never exposes secrets/tokens)
router.get('/zoho/health', async (req, res) => {
  try {
    const health = await zohoService.getHealth();
    res.status(200).json({
      success: true,
      ...health
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'HealthCheckFailed',
      message: err.message
    });
  }
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/apps', appRoutes);

module.exports = router;

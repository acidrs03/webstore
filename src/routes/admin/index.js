'use strict';

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const dashboardController = require('../../controllers/admin/dashboardController');

// Dashboard
router.get('/', requireAdmin, dashboardController.index);

// Sub-routers
router.use('/', require('./auth'));
router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/orders', require('./orders'));
router.use('/content', require('./content'));
router.use('/settings', require('./settings'));
router.use('/theme', require('./theme'));
router.use('/custom-requests', require('./customRequests'));
router.use('/shipping', require('./shipping'));

module.exports = router;

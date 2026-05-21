'use strict';

const express = require('express');
const router = express.Router();
const customRequestController = require('../../controllers/admin/customRequestController');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);
router.use(requirePermission('customRequests'));

router.get('/', customRequestController.index);
router.get('/:id', customRequestController.show);
router.post('/:id', verifyCsrf, customRequestController.update);

module.exports = router;

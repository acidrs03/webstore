'use strict';

const express = require('express');
const router = express.Router();
const themeController = require('../../controllers/admin/themeController');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);
router.use(requirePermission('theme'));

router.get('/', themeController.index);
router.post('/', verifyCsrf, themeController.update);

module.exports = router;

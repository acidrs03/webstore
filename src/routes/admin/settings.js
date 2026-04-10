'use strict';

const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/settingController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);

router.get('/', settingController.index);
router.post('/', verifyCsrf, settingController.update);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/settingController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');
const { maintenanceLogo } = require('../../middleware/upload');

router.use(requireAdmin);

router.get('/', settingController.index);
// maintenanceLogo (multer) runs first so it parses the multipart body before verifyCsrf reads _csrf
router.post('/', maintenanceLogo, verifyCsrf, settingController.update);

module.exports = router;

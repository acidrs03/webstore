'use strict';

const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/admin/contentController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');
const { heroImage } = require('../../middleware/upload');

router.use(requireAdmin);

router.get('/', contentController.index);
router.get('/:key/edit', contentController.edit);
router.post('/:key', heroImage, verifyCsrf, contentController.update);

module.exports = router;

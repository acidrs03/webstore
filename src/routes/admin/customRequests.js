'use strict';

const express = require('express');
const router = express.Router();
const customRequestController = require('../../controllers/admin/customRequestController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);

router.get('/', customRequestController.index);
router.get('/:id', customRequestController.show);
router.post('/:id', verifyCsrf, customRequestController.update);

module.exports = router;

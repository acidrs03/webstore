'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);

router.get('/', orderController.index);
router.get('/:id', orderController.show);
router.post('/:id/fulfillment', verifyCsrf, orderController.updateFulfillment);
router.post('/:id/notes', verifyCsrf, orderController.updateNotes);

module.exports = router;

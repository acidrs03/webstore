'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);
router.use(requirePermission('orders'));

router.get('/', orderController.index);
router.get('/:id', orderController.show);
router.post('/:id/fulfillment', verifyCsrf, orderController.updateFulfillment);
router.post('/:id/notes', verifyCsrf, orderController.updateNotes);
router.post('/:id/deposit', verifyCsrf, orderController.updateDeposit);

module.exports = router;

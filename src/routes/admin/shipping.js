'use strict';

const express = require('express');
const router = express.Router();
const shippingController = require('../../controllers/admin/shippingController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);

router.get('/', shippingController.index);
router.get('/new', shippingController.new);
router.post('/', verifyCsrf, shippingController.create);
router.post('/free-shipping/save', verifyCsrf, shippingController.updateFreeShipping);
router.get('/:id/edit', shippingController.edit);
router.post('/:id/delete', verifyCsrf, shippingController.destroy);
router.post('/:id', verifyCsrf, shippingController.update);

module.exports = router;

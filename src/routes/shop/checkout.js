'use strict';

const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/shop/checkoutController');
const { verifyCsrf } = require('../../middleware/csrf');

router.post('/session', verifyCsrf, checkoutController.createSession);
router.get('/success', checkoutController.success);
router.get('/cancel', checkoutController.cancel);

module.exports = router;

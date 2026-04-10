'use strict';

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe sends raw body — configured in app.js with express.raw()
router.post('/stripe', webhookController.stripeWebhook);

module.exports = router;

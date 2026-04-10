'use strict';

const express = require('express');
const router = express.Router();

// NOTE: /webhooks/stripe is mounted directly in app.js with express.raw()
// to ensure the raw body is preserved for Stripe signature verification.
// Do NOT add it here.

// Admin area
router.use('/admin', require('./admin/index'));

// Public storefront
router.use('/', require('./shop/index'));

module.exports = router;

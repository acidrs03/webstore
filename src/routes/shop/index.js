'use strict';

const express = require('express');
const router = express.Router();

router.use('/', require('./home'));
router.use('/shop', require('./shop'));
router.use('/cart', require('./cart'));
router.use('/checkout', require('./checkout'));
router.use('/pages', require('./pages'));
router.use('/contact', require('./contact'));
router.use('/custom-request', require('./customRequest'));

module.exports = router;

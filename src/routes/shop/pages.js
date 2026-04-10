'use strict';

const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/shop/pageController');

router.get('/faq', pageController.faq);
router.get('/about', pageController.about);
router.get('/shipping', pageController.shipping);
router.get('/returns', pageController.returns);

module.exports = router;

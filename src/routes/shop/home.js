'use strict';

const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/shop/homeController');

router.get('/', homeController.index);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const shopController = require('../../controllers/shop/shopController');
const productController = require('../../controllers/shop/productController');

router.get('/', shopController.index);
router.get('/search', shopController.search);
router.get('/category/:slug', shopController.index);
router.get('/:slug', productController.show);

module.exports = router;

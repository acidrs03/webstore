'use strict';

const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/shop/cartController');
const { verifyCsrf } = require('../../middleware/csrf');

router.get('/', cartController.index);
router.post('/add', verifyCsrf, cartController.add);
router.post('/update', verifyCsrf, cartController.update);
router.post('/remove', verifyCsrf, cartController.remove);
router.post('/clear', verifyCsrf, cartController.clear);

module.exports = router;

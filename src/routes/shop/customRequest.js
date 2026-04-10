'use strict';

const express = require('express');
const router = express.Router();
const customRequestController = require('../../controllers/shop/customRequestController');
const { verifyCsrf } = require('../../middleware/csrf');
const { requestImage } = require('../../middleware/upload');
const { customRequestValidation } = require('../../validators/customRequestValidator');

router.get('/', customRequestController.index);
router.post('/', verifyCsrf, requestImage, customRequestValidation, customRequestController.submit);

module.exports = router;

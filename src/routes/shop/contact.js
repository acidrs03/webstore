'use strict';

const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/shop/contactController');
const { verifyCsrf } = require('../../middleware/csrf');
const { contactValidation } = require('../../validators/contactValidator');

router.get('/', contactController.index);
router.post('/', verifyCsrf, contactValidation, contactController.submit);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { redirectIfAdmin } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');
const { loginValidation } = require('../../validators/authValidator');
const { verifyCsrf } = require('../../middleware/csrf');

router.get('/login', redirectIfAdmin, authController.showLogin);
router.post('/login', redirectIfAdmin, loginLimiter, verifyCsrf, loginValidation, authController.login);
router.post('/logout', verifyCsrf, authController.logout);

module.exports = router;

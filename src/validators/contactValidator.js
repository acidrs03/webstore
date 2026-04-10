'use strict';

const { body } = require('express-validator');

const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be 2000 characters or fewer'),
];

module.exports = { contactValidation };

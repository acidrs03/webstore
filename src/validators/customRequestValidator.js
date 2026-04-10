'use strict';

const { body } = require('express-validator');

const customRequestValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or fewer'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email required'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone must be 30 characters or fewer'),

  body('productInterest')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product interest must be 200 characters or fewer'),

  body('details')
    .trim()
    .notEmpty()
    .withMessage('Please describe your request')
    .isLength({ max: 2000 })
    .withMessage('Details must be 2000 characters or fewer'),
];

module.exports = { customRequestValidation };

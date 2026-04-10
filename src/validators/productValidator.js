'use strict';

const { body } = require('express-validator');

const productValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or fewer'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('compareAtPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Compare-at price must be a positive number'),

  body('inventoryQuantity')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer'),

  body('leadTimeDays')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Lead time must be a non-negative integer'),

  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('SKU must be 100 characters or fewer'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must be 500 characters or fewer'),

  body('seoTitle')
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage('SEO title must be 70 characters or fewer'),

  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description must be 160 characters or fewer'),
];

module.exports = { productValidation };

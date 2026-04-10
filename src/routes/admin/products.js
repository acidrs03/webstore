'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');
const { productImages } = require('../../middleware/upload');
const { productValidation } = require('../../validators/productValidator');

router.use(requireAdmin);

router.get('/', productController.index);
router.get('/new', productController.new);
router.post('/', productImages, verifyCsrf, productValidation, productController.create);
router.get('/:id/edit', productController.edit);
router.post('/:id/toggle-active', verifyCsrf, productController.toggleActive);
router.post('/:id/toggle-featured', verifyCsrf, productController.toggleFeatured);
router.post('/:id/archive', verifyCsrf, productController.archive);
router.post('/:id/duplicate', verifyCsrf, productController.duplicate);
router.post('/:id/delete', verifyCsrf, productController.destroy);
router.post('/:id', productImages, verifyCsrf, productValidation, productController.update);

module.exports = router;

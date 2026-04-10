'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const { requireAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');
const { categoryImage } = require('../../middleware/upload');

router.use(requireAdmin);

router.get('/', categoryController.index);
router.get('/new', categoryController.new);
router.post('/', verifyCsrf, categoryImage, categoryController.create);
router.get('/:id/edit', categoryController.edit);
router.post('/:id/delete', verifyCsrf, categoryController.destroy);
router.post('/:id', verifyCsrf, categoryImage, categoryController.update);

module.exports = router;

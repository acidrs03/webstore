'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/auth');
const { verifyCsrf } = require('../../middleware/csrf');

router.use(requireAdmin);
router.use(requireSuperAdmin);

router.get('/',           adminController.index);
router.get('/new',        adminController.new);
router.post('/',          verifyCsrf, adminController.create);
router.get('/:id/edit',   adminController.edit);
router.post('/:id',       verifyCsrf, adminController.update);
router.post('/:id/delete', verifyCsrf, adminController.destroy);

module.exports = router;

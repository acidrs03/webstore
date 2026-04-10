'use strict';

const { validationResult } = require('express-validator');
const categoryService = require('../../services/categoryService');
const mediaService = require('../../services/mediaService');

exports.index = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(true);
    // Add product counts
    const withCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        productCount: await categoryService.getProductCount(cat._id),
      }))
    );
    res.render('admin/categories/index', {
      title: 'Categories',
      categories: withCounts,
    });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => {
  res.render('admin/categories/form', {
    title: 'New Category',
    category: {},
    isNew: true,
  });
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.isActive = data.isActive === 'on';
    if (req.file) data.image = mediaService.saveFile(req.file);
    const category = await categoryService.createCategory(data);
    req.flash('success', `Category "${category.name}" created.`);
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found.');
      return res.redirect('/admin/categories');
    }
    res.render('admin/categories/form', {
      title: `Edit: ${category.name}`,
      category,
      isNew: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.isActive = data.isActive === 'on';
    if (req.file) data.image = mediaService.saveFile(req.file);
    const category = await categoryService.updateCategory(req.params.id, data);
    req.flash('success', `Category "${category.name}" updated.`);
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const count = await categoryService.getProductCount(req.params.id);
    if (count > 0) {
      req.flash('error', `Cannot delete this category — it has ${count} product(s). Reassign them first.`);
      return res.redirect('/admin/categories');
    }
    await categoryService.deleteCategory(req.params.id);
    req.flash('success', 'Category deleted.');
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

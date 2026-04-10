'use strict';

const { validationResult } = require('express-validator');
const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const mediaService = require('../../services/mediaService');

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { search, category, status } = req.query;

    const filters = { page, limit: 20, search };
    if (category) filters.categoryId = category;
    if (status === 'active') { filters.isActive = true; filters.isArchived = false; }
    else if (status === 'inactive') { filters.isActive = false; filters.isArchived = false; }
    else if (status === 'archived') { filters.isArchived = true; }
    else if (status === 'featured') { filters.isFeatured = true; filters.isArchived = false; }
    else { filters.isArchived = false; }

    const [result, categories] = await Promise.all([
      productService.getAllProducts(filters),
      categoryService.getAllCategories(true),
    ]);

    res.render('admin/products/index', {
      title: 'Products',
      products: result.products,
      pagination: result.pagination,
      categories,
      filters: req.query,
    });
  } catch (err) {
    next(err);
  }
};

exports.new = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(true);
    res.render('admin/products/form', {
      title: 'New Product',
      product: {},
      categories,
      isNew: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/admin/products/new');
    }

    const data = { ...req.body };
    // Convert price from dollars to cents
    data.price = Math.round(parseFloat(data.price || 0) * 100);
    data.compareAtPrice = Math.round(parseFloat(data.compareAtPrice || 0) * 100);
    // Checkboxes
    data.isActive = data.isActive === 'on';
    data.isFeatured = data.isFeatured === 'on';
    data.trackInventory = data.trackInventory === 'on';
    data.madeToOrder = data.madeToOrder === 'on';
    data.allowsCustomization = data.allowsCustomization === 'on';
    // Empty categoryId → null
    if (!data.categoryId) data.categoryId = null;
    // Tags
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    // Images
    if (req.files && req.files.length > 0) {
      data.images = mediaService.saveFiles(req.files);
    }

    const product = await productService.createProduct(data);
    req.flash('success', `"${product.title}" has been created.`);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const [product, categories] = await Promise.all([
      productService.getProductById(req.params.id),
      categoryService.getAllCategories(true),
    ]);
    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }
    res.render('admin/products/form', {
      title: `Edit: ${product.title}`,
      product,
      categories,
      isNew: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect(`/admin/products/${req.params.id}/edit`);
    }

    const data = { ...req.body };
    data.price = Math.round(parseFloat(data.price || 0) * 100);
    data.compareAtPrice = Math.round(parseFloat(data.compareAtPrice || 0) * 100);
    data.isActive = data.isActive === 'on';
    data.isFeatured = data.isFeatured === 'on';
    data.trackInventory = data.trackInventory === 'on';
    data.madeToOrder = data.madeToOrder === 'on';
    data.allowsCustomization = data.allowsCustomization === 'on';
    // Empty categoryId → null
    if (!data.categoryId) data.categoryId = null;
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Handle image uploads — append new images to existing
    const existing = await productService.getProductById(req.params.id);
    let images = existing.images || [];
    // Remove images flagged for removal
    if (data.removeImages) {
      const toRemove = Array.isArray(data.removeImages) ? data.removeImages : [data.removeImages];
      images = images.filter(img => !toRemove.includes(img));
      toRemove.forEach(img => mediaService.deleteFile(img));
    }
    if (req.files && req.files.length > 0) {
      const newPaths = mediaService.saveFiles(req.files);
      images = images.concat(newPaths);
    }
    data.images = images;

    const product = await productService.updateProduct(req.params.id, data);
    req.flash('success', `"${product.title}" has been updated.`);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const product = await productService.toggleActive(req.params.id);
    res.json({ success: true, isActive: product.isActive });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const product = await productService.toggleFeatured(req.params.id);
    res.json({ success: true, isFeatured: product.isFeatured });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.archive = async (req, res, next) => {
  try {
    const product = await productService.archiveProduct(req.params.id);
    req.flash('success', `"${product.title}" has been archived.`);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

exports.duplicate = async (req, res, next) => {
  try {
    const copy = await productService.duplicateProduct(req.params.id);
    req.flash('success', `Product duplicated. You are now editing the copy.`);
    res.redirect(`/admin/products/${copy._id}/edit`);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }
    if (!product.isArchived) {
      req.flash('error', 'Only archived products can be permanently deleted. Archive it first.');
      return res.redirect('/admin/products');
    }
    await product.deleteOne();
    req.flash('success', 'Product permanently deleted.');
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
};

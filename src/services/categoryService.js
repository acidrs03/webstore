'use strict';

const Category = require('../models/Category');
const Product = require('../models/Product');
const { uniqueSlug } = require('../utils/slugify');

/**
 * Get all categories sorted by sortOrder then name.
 * @param {boolean} includeInactive - When true, returns all categories including inactive.
 */
async function getAllCategories(includeInactive = false) {
  const query = includeInactive ? {} : { isActive: true };
  const categories = await Category.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return categories;
}

/**
 * Find an active category by slug.
 */
async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ slug, isActive: true }).lean();
  return category;
}

/**
 * Find a category by its MongoDB ID (any status).
 */
async function getCategoryById(id) {
  const category = await Category.findById(id).lean();
  return category;
}

/**
 * Create a new category. Auto-generates a unique slug from the name.
 */
async function createCategory(data) {
  const slug = await uniqueSlug(data.name, Category);
  const category = await Category.create({ ...data, slug });
  return category;
}

/**
 * Update a category by ID. Regenerates the slug if the name changed.
 */
async function updateCategory(id, data) {
  const existing = await Category.findById(id);
  if (!existing) return null;

  if (data.name && data.name !== existing.name) {
    data.slug = await uniqueSlug(data.name, Category, id);
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  return category;
}

/**
 * Delete a category only if no products reference it.
 * Returns { deleted: true } or { deleted: false, reason: string }.
 */
async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) return { deleted: false, reason: 'Category not found' };

  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    return {
      deleted: false,
      reason: `Cannot delete — ${productCount} product(s) still reference this category. Reassign or remove them first.`,
    };
  }

  await Category.findByIdAndDelete(id);
  return { deleted: true };
}

/**
 * Count how many products belong to a given category.
 */
async function getProductCount(categoryId) {
  const count = await Product.countDocuments({ categoryId });
  return count;
}

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductCount,
};

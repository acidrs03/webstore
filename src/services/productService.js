'use strict';

const Product = require('../models/Product');
const Category = require('../models/Category');
const { uniqueSlug } = require('../utils/slugify');
const { paginate } = require('../utils/paginate');

/**
 * Get all products with filtering, sorting, and pagination.
 * By default excludes archived products.
 */
async function getAllProducts({
  page = 1,
  limit = 20,
  categoryId,
  isActive,
  isArchived = false,
  isFeatured,
  search,
  sort = { createdAt: -1 },
} = {}) {
  const query = {};

  // Default: exclude archived unless explicitly requested
  if (isArchived !== undefined && isArchived !== null) {
    query.isArchived = isArchived;
  }

  if (isActive !== undefined && isActive !== null) {
    query.isActive = isActive;
  }

  if (isFeatured !== undefined && isFeatured !== null) {
    query.isFeatured = isFeatured;
  }

  if (categoryId) {
    query.categoryId = categoryId;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: paginate(total, pageNum, limitNum),
  };
}

/**
 * Get featured products for homepage display.
 */
async function getFeaturedProducts(limit = 8) {
  const products = await Product.find({
    isFeatured: true,
    isActive: true,
    isArchived: false,
  })
    .populate('categoryId', 'name slug')
    .sort('-createdAt')
    .limit(limit)
    .lean({ virtuals: true });

  return products;
}

/**
 * Find an active, non-archived product by slug.
 */
async function getProductBySlug(slug) {
  const product = await Product.findOne({
    slug,
    isActive: true,
    isArchived: false,
  })
    .populate('categoryId', 'name slug')
    .lean({ virtuals: true });

  return product;
}

/**
 * Find a product by its MongoDB ID (any status).
 */
async function getProductById(id) {
  const product = await Product.findById(id)
    .populate('categoryId', 'name slug')
    .lean({ virtuals: true });

  return product;
}

/**
 * Create a new product. Auto-generates a unique slug from the title.
 */
async function createProduct(data) {
  const slug = await uniqueSlug(data.title, Product);
  const product = await Product.create({ ...data, slug });
  return product;
}

/**
 * Update a product by ID. Regenerates the slug if the title changed.
 */
async function updateProduct(id, data) {
  const existing = await Product.findById(id);
  if (!existing) return null;

  if (data.title && data.title !== existing.title) {
    data.slug = await uniqueSlug(data.title, Product, id);
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean({ virtuals: true });

  return product;
}

/**
 * Toggle the isActive flag on a product.
 */
async function toggleActive(id) {
  const product = await Product.findById(id);
  if (!product) return null;

  product.isActive = !product.isActive;
  await product.save();
  return product;
}

/**
 * Toggle the isFeatured flag on a product.
 */
async function toggleFeatured(id) {
  const product = await Product.findById(id);
  if (!product) return null;

  product.isFeatured = !product.isFeatured;
  await product.save();
  return product;
}

/**
 * Archive a product — sets isArchived: true and isActive: false.
 */
async function archiveProduct(id) {
  const product = await Product.findByIdAndUpdate(
    id,
    { isArchived: true, isActive: false },
    { new: true }
  );
  return product;
}

/**
 * Duplicate a product with "Copy of" title prefix and a fresh unique slug.
 */
async function duplicateProduct(id) {
  const original = await Product.findById(id).lean();
  if (!original) return null;

  const newTitle = `Copy of ${original.title}`;
  const newSlug = await uniqueSlug(newTitle, Product);

  // Strip Mongoose metadata before cloning
  const { _id, createdAt, updatedAt, __v, slug, ...rest } = original;

  const clone = await Product.create({
    ...rest,
    title: newTitle,
    slug: newSlug,
    isActive: false,     // duplicates start inactive
    isFeatured: false,
    isArchived: false,
  });

  return clone;
}

/**
 * Full-text search across title, shortDescription, and tags.
 */
async function searchProducts(query, limit = 12) {
  const products = await Product.find({
    isActive: true,
    isArchived: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { shortDescription: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
    ],
  })
    .populate('categoryId', 'name slug')
    .limit(limit)
    .lean({ virtuals: true });

  return products;
}

/**
 * Get products belonging to a category identified by its slug.
 */
async function getProductsByCategory(slug, page = 1, limit = 20) {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) return { products: [], pagination: paginate(0, 1, limit), category: null };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    categoryId: category._id,
    isActive: true,
    isArchived: false,
  };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('categoryId', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true }),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: paginate(total, pageNum, limitNum),
    category,
  };
}

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  toggleActive,
  toggleFeatured,
  archiveProduct,
  duplicateProduct,
  searchProducts,
  getProductsByCategory,
};

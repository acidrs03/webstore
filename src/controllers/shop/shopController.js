'use strict';

const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const { category: categorySlug, sort, q } = req.query;

    const filters = { page, limit, isActive: true, isArchived: false };
    if (sort === 'price-asc') filters.sort = { price: 1 };
    else if (sort === 'price-desc') filters.sort = { price: -1 };
    else if (sort === 'featured') { filters.sort = { createdAt: -1 }; filters.isFeatured = true; }
    else filters.sort = { createdAt: -1 };

    let activeCategory = null;
    if (categorySlug) {
      activeCategory = await categoryService.getCategoryBySlug(categorySlug);
      if (activeCategory) filters.categoryId = activeCategory._id;
    }

    if (q) filters.search = q;

    const [result, categories] = await Promise.all([
      productService.getAllProducts(filters),
      categoryService.getAllCategories(),
    ]);

    const baseUrl = res.locals.baseUrl || '';

    // Canonical: strip sort/page params to prevent duplicate content indexing.
    // Category filter is meaningful, so include it.
    let canonical = `${baseUrl}/shop`;
    if (activeCategory) canonical += `?category=${encodeURIComponent(activeCategory.slug)}`;

    const metaDescription = activeCategory
      ? `Browse ${activeCategory.name} — handcrafted and laser engraved personalized items.`
      : 'Shop all handcrafted and personalized items.';

    res.render('shop/shop', {
      title: activeCategory ? activeCategory.name : 'Shop',
      metaDescription,
      canonical,
      products: result.products,
      pagination: result.pagination,
      categories,
      activeCategory,
      filters: req.query,
    });
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    let products = [];
    if (q) {
      products = await productService.searchProducts(q, 24);
    }
    res.render('shop/search', {
      title: q ? `Search: ${q}` : 'Search',
      noIndex: true,  // Search result pages should not be indexed
      products,
      query: q,
    });
  } catch (err) {
    next(err);
  }
};

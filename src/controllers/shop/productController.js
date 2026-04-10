'use strict';

const productService = require('../../services/productService');

exports.show = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    if (!product || !product.isActive || product.isArchived) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        siteName: process.env.SITE_NAME || 'My Store',
      });
    }

    // Related products from same category
    let relatedProducts = [];
    if (product.categoryId) {
      const result = await productService.getAllProducts({
        categoryId: product.categoryId._id || product.categoryId,
        isActive: true,
        isArchived: false,
        limit: 5,
        page: 1,
      });
      relatedProducts = result.products.filter(p => p._id.toString() !== product._id.toString()).slice(0, 4);
    }

    const baseUrl = res.locals.baseUrl || '';
    const canonical = `${baseUrl}/shop/${product.slug}`;

    // Use first product image as OG image (must be absolute URL)
    let ogImage = '';
    if (product.images && product.images[0]) {
      const img = product.images[0];
      ogImage = img.startsWith('http') ? img : `${baseUrl}${img}`;
    }

    res.render('shop/product', {
      title: product.seoTitle || product.title,
      metaDescription: product.seoDescription || product.shortDescription || '',
      canonical,
      ogImage,
      ogType: 'product',
      product,
      relatedProducts,
    });
  } catch (err) {
    next(err);
  }
};

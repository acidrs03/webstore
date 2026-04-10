'use strict';

const cartService = require('../../services/cartService');
const productService = require('../../services/productService');

exports.index = (req, res) => {
  const cart = cartService.getCart(req.session);
  res.render('shop/cart', {
    title: 'Your Cart',
    cart,
  });
};

exports.add = async (req, res, next) => {
  try {
    const { productId, quantity, customizationText } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    const product = await productService.getProductById(productId);
    if (!product || !product.isActive || product.isArchived) {
      req.flash('error', 'This product is not available.');
      return res.redirect('back');
    }

    // Check inventory if tracked
    if (product.trackInventory && product.inventoryQuantity < qty && !product.madeToOrder) {
      req.flash('error', `Only ${product.inventoryQuantity} left in stock.`);
      return res.redirect('back');
    }

    cartService.addItem(req.session, {
      productId: product._id.toString(),
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.images && product.images[0] ? product.images[0] : '',
      quantity: qty,
      customizationText: customizationText || '',
    });

    req.flash('success', `"${product.title}" added to cart.`);
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

exports.update = (req, res) => {
  const { index, quantity } = req.body;
  const qty = parseInt(quantity) || 0;
  cartService.updateItem(req.session, parseInt(index), qty);
  res.redirect('/cart');
};

exports.remove = (req, res) => {
  const { index } = req.body;
  cartService.removeItem(req.session, parseInt(index));
  res.redirect('/cart');
};

exports.clear = (req, res) => {
  cartService.clearCart(req.session);
  res.redirect('/cart');
};

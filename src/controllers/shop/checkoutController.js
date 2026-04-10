'use strict';

const cartService = require('../../services/cartService');
const stripeService = require('../../services/stripeService');
const orderService = require('../../services/orderService');
const shippingService = require('../../services/shippingService');
const logger = require('../../utils/logger');

exports.createSession = async (req, res, next) => {
  try {
    const cart = cartService.getCart(req.session);

    if (!cart.items.length) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    // Validate prices server-side before creating session
    await cartService.validateCartPrices(req.session);
    const validatedCart = cartService.getCart(req.session);

    if (!validatedCart.items.length) {
      req.flash('error', 'Some items in your cart are no longer available and have been removed.');
      return res.redirect('/cart');
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shippingOptions = await shippingService.buildStripeShippingOptions(validatedCart.subtotal);

    const session = await stripeService.createCheckoutSession({
      cart: validatedCart,
      customer: {},
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancel`,
      shippingOptions,
    });

    res.redirect(303, session.url);
  } catch (err) {
    logger.error('Checkout session creation failed:', err);
    req.flash('error', 'Unable to start checkout. Please try again.');
    res.redirect('/cart');
  }
};

exports.success = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    let order = null;

    if (session_id) {
      order = await orderService.getOrderByStripeSessionId(session_id);
    }

    // Clear cart
    cartService.clearCart(req.session);

    res.render('shop/checkout-success', {
      title: 'Order Confirmed!',
      order,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancel = (req, res) => {
  res.render('shop/checkout-cancel', { title: 'Checkout Cancelled' });
};

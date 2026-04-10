'use strict';

const { getStripe } = require('../config/stripe');

/**
 * Create a Stripe Checkout Session from cart and customer data.
 *
 * @param {object} options
 * @param {object} options.cart         - Cart object with items array and subtotal
 * @param {object} options.customer     - { name, email, phone }
 * @param {string} options.successUrl   - Redirect URL on successful payment
 * @param {string} options.cancelUrl    - Redirect URL when customer cancels
 * @param {string} [options.orderId]    - Optional internal order/reference ID
 *
 * @returns {Promise<Stripe.Checkout.Session>}
 */
async function createCheckoutSession({ cart, customer, successUrl, cancelUrl, orderId, shippingOptions }) {
  const stripe = getStripe();

  // Map cart items to Stripe line_items
  const lineItems = cart.items.map((item) => {
    const productData = {
      name: item.customizationText
        ? `${item.title} — ${item.customizationText}`
        : item.title,
    };

    // Include product image if available
    if (item.image) {
      // Stripe requires absolute URLs; pass them through only if they look absolute
      if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
        productData.images = [item.image];
      }
    }

    return {
      price_data: {
        currency: 'usd',
        unit_amount: item.price, // already in cents
        product_data: productData,
      },
      quantity: item.quantity,
    };
  });

  // Serialize cart and customer info into metadata (max 500 chars per value)
  // cartData is used in the webhook to reconstruct order items
  const cartDataStr = JSON.stringify(cart.items);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,

    // Pre-fill customer email
    customer_email: customer.email || undefined,

    // Collect shipping address at checkout
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },

    shipping_options: shippingOptions,

    metadata: {
      cartData: cartDataStr.substring(0, 500), // Stripe metadata values capped at 500 chars
      customerEmail: customer.email || '',
      customerName: customer.name || '',
      customerPhone: customer.phone || '',
      orderId: orderId ? String(orderId) : '',
    },

    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Verify and construct a Stripe webhook event from the raw request body and signature header.
 *
 * @param {Buffer|string} rawBody   - Raw request body (must be unparsed)
 * @param {string}        signature - Value of the 'stripe-signature' header
 * @returns {Stripe.Event}
 */
function constructWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  return event;
}

/**
 * Retrieve a Checkout Session with its line_items fully expanded.
 *
 * @param {string} sessionId - Stripe Checkout Session ID
 * @returns {Promise<Stripe.Checkout.Session>}
 */
async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  });

  return session;
}

module.exports = {
  createCheckoutSession,
  constructWebhookEvent,
  retrieveCheckoutSession,
};

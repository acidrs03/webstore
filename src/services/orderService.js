'use strict';

const Order = require('../models/Order');
const { generateOrderNumber } = require('../utils/orderNumber');
const { paginate } = require('../utils/paginate');

/**
 * Get paginated list of orders with optional filters.
 * Supports search on orderNumber and customer.email.
 */
async function getOrders({
  page = 1,
  limit = 20,
  paymentStatus,
  fulfillmentStatus,
  search,
} = {}) {
  const query = {};

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (fulfillmentStatus) query.fulfillmentStatus = fulfillmentStatus;

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.email': { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: paginate(total, pageNum, limitNum),
  };
}

/**
 * Find a single order by its MongoDB ID.
 */
async function getOrderById(id) {
  const order = await Order.findById(id).lean();
  return order;
}

/**
 * Find an order by the Stripe Checkout Session ID.
 */
async function getOrderByStripeSessionId(sessionId) {
  const order = await Order.findOne({ stripeCheckoutSessionId: sessionId }).lean();
  return order;
}

/**
 * Create a new order from a fulfilled Stripe Checkout Session and its line items.
 *
 * Stripe session shape expected:
 *   session.id                        — stripeCheckoutSessionId
 *   session.payment_intent            — stripePaymentIntentId
 *   session.amount_total              — total in cents
 *   session.shipping_cost.amount_total — shippingAmount in cents
 *   session.customer_details.address  — shippingAddress
 *   session.metadata.customerEmail
 *   session.metadata.customerName
 *   session.metadata.customerPhone
 *   session.metadata.cartData         — JSON string of cart items
 *
 * lineItems: array of Stripe line item objects (from expanded line_items.data)
 */
async function createOrderFromStripeSession(session, lineItems) {
  // Prevent duplicate orders for the same session
  const existing = await Order.findOne({
    stripeCheckoutSessionId: session.id,
  });
  if (existing) return existing;

  const orderNumber = generateOrderNumber();
  const metadata = session.metadata || {};

  // Parse cart items from metadata (set during checkout session creation)
  let cartItems = [];
  try {
    if (metadata.cartData) {
      cartItems = JSON.parse(metadata.cartData);
    }
  } catch {
    // Fall back to mapping Stripe line items if cartData is missing/corrupt
    cartItems = (lineItems || []).map((li) => ({
      title: li.description || '',
      price: li.price ? li.price.unit_amount : 0,
      quantity: li.quantity,
      customizationText: '',
      image: '',
      slug: '',
    }));
  }

  const address = session.customer_details?.address || {};
  const shippingAmount = session.shipping_cost?.amount_total || 0;
  const total = session.amount_total || 0;
  const subtotal = total - shippingAmount;

  const order = await Order.create({
    orderNumber,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || '',
    customer: {
      name: metadata.customerName || session.customer_details?.name || '',
      email: metadata.customerEmail || session.customer_details?.email || '',
      phone: metadata.customerPhone || session.customer_details?.phone || '',
    },
    shippingAddress: {
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      zip: address.postal_code || '',
      country: address.country || 'US',
    },
    items: cartItems,
    subtotal,
    shippingAmount,
    taxAmount: session.total_details?.amount_tax || 0,
    total,
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
  });

  return order;
}

/**
 * Update the fulfillment status of an order.
 * Optionally record a tracking number.
 */
async function updateFulfillmentStatus(id, status, trackingNumber) {
  const update = { fulfillmentStatus: status };
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;

  const order = await Order.findByIdAndUpdate(id, update, { new: true }).lean();
  return order;
}

/**
 * Update admin-only notes on an order.
 */
async function updateAdminNotes(id, notes) {
  const order = await Order.findByIdAndUpdate(
    id,
    { adminNotes: notes },
    { new: true }
  ).lean();
  return order;
}

/**
 * Dashboard summary statistics.
 * Returns totalOrders, totalRevenue (in cents), pendingOrders count, and last 5 orders.
 */
async function getDashboardStats() {
  const [totalOrders, pendingOrders, revenueResult, recentOrders] = await Promise.all([
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.countDocuments({
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
    }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    recentOrders,
  };
}

module.exports = {
  getOrders,
  getOrderById,
  getOrderByStripeSessionId,
  createOrderFromStripeSession,
  updateFulfillmentStatus,
  updateAdminNotes,
  getDashboardStats,
};

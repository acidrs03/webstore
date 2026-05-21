'use strict';

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    title: { type: String, default: '' },
    slug:  { type: String, default: '' },
    sku:   { type: String, default: '' },
    price: { type: Number, default: 0 }, // cents — deposit amount for deposit items, full price otherwise
    fullPrice: { type: Number, default: 0 }, // cents — full product price (populated for deposit items)
    quantity: { type: Number, default: 1 },
    customizationText: { type: String, default: '' },
    image: { type: String, default: '' },
    isDeposit: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    shippingAddress: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'US' },
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
    }, // cents
    shippingAmount: {
      type: Number,
      default: 0,
    }, // cents
    taxAmount: {
      type: Number,
      default: 0,
    }, // cents
    total: {
      type: Number,
      default: 0,
    }, // cents
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'unfulfilled',
    },
    notes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId:   { type: String },
    trackingNumber:          { type: String },

    // ── Deposit order fields ────────────────────────────────────────────────
    orderType: {
      type: String,
      enum: ['standard', 'deposit'],
      default: 'standard',
    },
    depositAmount: {
      type: Number,
      default: 0, // total deposit charged on items in cents (excludes shipping/tax)
    },
    depositStatus: {
      type: String,
      enum: ['deposit_paid', 'in_progress', 'invoiced', 'complete', 'cancelled'],
    },
    finalAmount: {
      type: Number,
      default: 0, // final agreed total in cents — set by admin
    },
    balanceDue: {
      type: Number,
      default: 0, // finalAmount - depositAmount — computed by admin action
    },
  },
  { timestamps: true }
);

orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ fulfillmentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ depositStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);

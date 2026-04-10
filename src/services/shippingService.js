'use strict';

const ShippingMethod = require('../models/ShippingMethod');
const settingService = require('./settingService');

async function getAllMethods() {
  return ShippingMethod.find({}).sort({ sortOrder: 1, name: 1 }).lean();
}

async function getActiveMethods() {
  return ShippingMethod.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
}

async function getMethodById(id) {
  return ShippingMethod.findById(id).lean();
}

async function createMethod(data) {
  return ShippingMethod.create(data);
}

async function updateMethod(id, data) {
  return ShippingMethod.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteMethod(id) {
  return ShippingMethod.findByIdAndDelete(id);
}

/**
 * Build the Stripe shipping_options array from active shipping methods.
 * If free shipping is enabled and cartSubtotal (cents) meets the threshold,
 * a Free Shipping option is prepended.
 *
 * @param {number} cartSubtotal - Cart subtotal in cents
 * @returns {Promise<object[]>} Array of Stripe shipping_rate_data objects
 */
async function buildStripeShippingOptions(cartSubtotal = 0) {
  const methods = await getActiveMethods();

  const options = methods.map((m) => ({
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: m.price, currency: 'usd' },
      display_name: m.name,
      ...(m.description && { metadata: { description: m.description } }),
      delivery_estimate: {
        minimum: { unit: 'business_day', value: m.estimatedMin },
        maximum: { unit: 'business_day', value: m.estimatedMax },
      },
    },
  }));

  // Check free shipping threshold
  const freeEnabled = await settingService.getSetting('freeShippingEnabled');
  const freeThresholdDollars = await settingService.getSetting('freeShippingThreshold');

  if (freeEnabled === 'true' && freeThresholdDollars) {
    const thresholdCents = Math.round(parseFloat(freeThresholdDollars) * 100);
    if (cartSubtotal >= thresholdCents) {
      options.unshift({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Free Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      });
    }
  }

  // Fallback if no methods configured
  if (options.length === 0) {
    options.push({
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 0, currency: 'usd' },
        display_name: 'Standard Shipping',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 5 },
          maximum: { unit: 'business_day', value: 10 },
        },
      },
    });
  }

  return options;
}

module.exports = {
  getAllMethods,
  getActiveMethods,
  getMethodById,
  createMethod,
  updateMethod,
  deleteMethod,
  buildStripeShippingOptions,
};

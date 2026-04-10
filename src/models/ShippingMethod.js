'use strict';

const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    }, // in cents
    estimatedMin: {
      type: Number,
      min: 0,
      default: 3,
    }, // business days
    estimatedMax: {
      type: Number,
      min: 0,
      default: 7,
    }, // business days
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

shippingMethodSchema.index({ sortOrder: 1, name: 1 });

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);

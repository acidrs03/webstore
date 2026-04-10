'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    }, // stored in CENTS
    compareAtPrice: {
      type: Number,
      min: 0,
      default: 0,
    }, // stored in CENTS
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    }, // array of file paths/URLs
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    trackInventory: {
      type: Boolean,
      default: false,
    },
    inventoryQuantity: {
      type: Number,
      default: 0,
    },
    madeToOrder: {
      type: Boolean,
      default: false,
    },
    allowsCustomization: {
      type: Boolean,
      default: false,
    },
    customizationLabel: {
      type: String,
      trim: true,
      default: 'Personalization',
    },
    customizationHelpText: {
      type: String,
      trim: true,
      default: '',
    },
    leadTimeDays: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ categoryId: 1 });

// Virtual: true if compareAtPrice > price (i.e. there is a sale)
productSchema.virtual('isOnSale').get(function () {
  return this.compareAtPrice > 0 && this.compareAtPrice > this.price;
});

// Virtual: price formatted as a dollar string
productSchema.virtual('formattedPrice').get(function () {
  return (this.price / 100).toFixed(2);
});

module.exports = mongoose.model('Product', productSchema);

'use strict';

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    }, // e.g. 'hero', 'faq', 'about', 'shipping-policy', 'return-policy', 'announcement'
    title: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      default: '',
    }, // can be HTML
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    }, // flexible JSON for structured content
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);

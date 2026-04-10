'use strict';

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      default: '',
    },
    group: {
      type: String,
      default: 'general',
    }, // e.g. 'general', 'contact', 'social', 'shipping'
    label: {
      type: String,
      trim: true,
    }, // human readable label for admin UI
    inputType: {
      type: String,
      enum: ['text', 'textarea', 'email', 'url', 'number', 'checkbox', 'select'],
      default: 'text',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);

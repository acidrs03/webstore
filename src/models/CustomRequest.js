'use strict';

const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    productInterest: {
      type: String,
      trim: true,
      default: '',
    },
    details: {
      type: String,
      required: true,
      trim: true,
    }, // the request description
    referenceImage: {
      type: String,
      default: '',
    }, // uploaded image path
    status: {
      type: String,
      enum: ['new', 'reviewing', 'quoted', 'accepted', 'declined', 'completed'],
      default: 'new',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomRequest', customRequestSchema);

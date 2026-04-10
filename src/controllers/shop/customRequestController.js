'use strict';

const { validationResult } = require('express-validator');
const customRequestService = require('../../services/customRequestService');
const categoryService = require('../../services/categoryService');
const emailService = require('../../services/emailService');
const mediaService = require('../../services/mediaService');

exports.index = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.render('shop/custom-request', {
      title: 'Request a Custom Order',
      categories,
    });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/custom-request');
    }

    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      productInterest: req.body.productInterest || '',
      details: req.body.details,
    };

    if (req.file) {
      data.referenceImage = mediaService.saveFile(req.file);
    }

    const request = await customRequestService.createRequest(data);
    await emailService.sendCustomRequestReceived({ customRequest: request });

    req.flash('success', "Your custom order request has been received! We'll be in touch within 1–2 business days.");
    res.redirect('/custom-request');
  } catch (err) {
    next(err);
  }
};

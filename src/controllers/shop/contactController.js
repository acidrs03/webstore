'use strict';

const { validationResult } = require('express-validator');
const emailService = require('../../services/emailService');
const logger = require('../../utils/logger');

exports.index = (req, res) => {
  res.render('shop/contact', { title: 'Contact Us' });
};

exports.submit = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/contact');
    }

    const { name, email, subject, message } = req.body;
    logger.info(`Contact form submission from ${email}: ${subject}`);

    req.flash('success', "Thanks for reaching out! We'll get back to you within 1–2 business days.");
    res.redirect('/contact');
  } catch (err) {
    next(err);
  }
};

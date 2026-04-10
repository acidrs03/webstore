'use strict';

const logger = require('../utils/logger');

function notFoundHandler(req, res, next) {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    siteName: process.env.SITE_NAME || 'My Store',
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  // Log server errors
  if (status >= 500) {
    logger.error(`${status} ${req.method} ${req.path}:`, err);
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    req.flash('error', 'File is too large. Maximum size is 10MB.');
    return res.redirect('back');
  }

  if (err.message && err.message.includes('Only image files')) {
    req.flash('error', err.message);
    return res.redirect('back');
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    req.flash('error', messages.join('. '));
    return res.redirect('back');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    req.flash('error', `A record with that ${field} already exists.`);
    return res.redirect('back');
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(status).render('errors/500', {
      title: 'Something Went Wrong',
      siteName: process.env.SITE_NAME || 'My Store',
    });
  }

  res.status(status).render('errors/500', {
    title: 'Server Error',
    siteName: process.env.SITE_NAME || 'My Store',
    error: err,
  });
}

module.exports = { notFoundHandler, errorHandler };

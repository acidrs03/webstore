'use strict';

const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Attach token to session and make available in templates
function csrfProtection(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// Verify CSRF token on mutating requests
function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const token = req.body._csrf || req.headers['x-csrf-token'];

  if (!token || !req.session.csrfToken || token !== req.session.csrfToken) {
    res.status(403);
    return res.render('errors/403', {
      title: 'Forbidden',
      message: 'Invalid CSRF token. Please refresh and try again.',
      layout: false,
    });
  }
  next();
}

module.exports = { csrfProtection, verifyCsrf };

'use strict';

// Protect admin routes — redirect to login if not authenticated
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUser) {
    return next();
  }
  req.flash('error', 'Please log in to access the admin area.');
  return res.redirect('/admin/login');
}

// Redirect authenticated admins away from login page
function redirectIfAdmin(req, res, next) {
  if (req.session && req.session.adminUser) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = { requireAdmin, redirectIfAdmin };

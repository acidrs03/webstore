'use strict';

// All valid permission keys — maps to admin sections
const PERMISSIONS = {
  products:       { label: 'Products',        description: 'Create, edit, archive and delete products' },
  categories:     { label: 'Categories',      description: 'Create, edit and delete categories' },
  orders:         { label: 'Orders',          description: 'View and manage orders' },
  customRequests: { label: 'Custom Requests', description: 'View and respond to custom requests' },
  content:        { label: 'Content Pages',   description: 'Edit static content pages' },
  shipping:       { label: 'Shipping',        description: 'Manage shipping methods and rates' },
  theme:          { label: 'Theme',           description: 'Customize store colours and appearance' },
  settings:       { label: 'Site Settings',   description: 'Manage site-wide settings and maintenance mode' },
};

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

// Guard a specific permission — superadmins always pass
function requirePermission(perm) {
  return (req, res, next) => {
    if (!req.session || !req.session.adminUser) {
      req.flash('error', 'Please log in to access the admin area.');
      return res.redirect('/admin/login');
    }
    const user = req.session.adminUser;
    if (user.role === 'superadmin' || (Array.isArray(user.permissions) && user.permissions.includes(perm))) {
      return next();
    }
    req.flash('error', 'You do not have permission to access that area.');
    return res.redirect('/admin');
  };
}

// Only superadmins may manage other admin users
function requireSuperAdmin(req, res, next) {
  if (!req.session || !req.session.adminUser) {
    req.flash('error', 'Please log in to access the admin area.');
    return res.redirect('/admin/login');
  }
  if (req.session.adminUser.role === 'superadmin') {
    return next();
  }
  req.flash('error', 'Only super admins can manage admin users.');
  return res.redirect('/admin');
}

module.exports = { requireAdmin, redirectIfAdmin, requirePermission, requireSuperAdmin, PERMISSIONS };

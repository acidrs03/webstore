'use strict';

const Admin = require('../../models/Admin');
const { PERMISSIONS } = require('../../middleware/auth');

exports.index = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: 1 }).lean();
    res.render('admin/admins/index', {
      title: 'Admin Users',
      admins,
    });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => {
  res.render('admin/admins/form', {
    title: 'New Admin User',
    admin: {},
    isNew: true,
    PERMISSIONS,
  });
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'Name, email, and password are required.');
      return res.redirect('/admin/admins/new');
    }
    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters.');
      return res.redirect('/admin/admins/new');
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash('error', 'An admin with that email already exists.');
      return res.redirect('/admin/admins/new');
    }

    const resolvedRole = role === 'superadmin' ? 'superadmin' : 'admin';
    const resolvedPerms = resolvedRole === 'superadmin'
      ? []
      : (Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []));

    await Admin.create({ name, email, password, role: resolvedRole, permissions: resolvedPerms });
    req.flash('success', `Admin user "${name}" created.`);
    res.redirect('/admin/admins');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).lean();
    if (!admin) {
      req.flash('error', 'Admin user not found.');
      return res.redirect('/admin/admins');
    }
    res.render('admin/admins/form', {
      title: `Edit: ${admin.name}`,
      admin,
      isNew: false,
      PERMISSIONS,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions, isActive } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      req.flash('error', 'Admin user not found.');
      return res.redirect('/admin/admins');
    }

    // Prevent the last superadmin from being demoted
    if (admin.role === 'superadmin' && role !== 'superadmin') {
      const superCount = await Admin.countDocuments({ role: 'superadmin' });
      if (superCount <= 1) {
        req.flash('error', 'Cannot demote the only super admin.');
        return res.redirect(`/admin/admins/${req.params.id}/edit`);
      }
    }

    admin.name     = name || admin.name;
    admin.email    = email || admin.email;
    admin.role     = role === 'superadmin' ? 'superadmin' : 'admin';
    admin.isActive = isActive === 'on';
    admin.permissions = admin.role === 'superadmin'
      ? []
      : (Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []));

    if (password && password.length >= 8) {
      admin.password = password; // pre-save hook hashes it
    } else if (password && password.length > 0) {
      req.flash('error', 'Password must be at least 8 characters — other changes were saved.');
    }

    await admin.save();
    req.flash('success', `Admin user "${admin.name}" updated.`);
    res.redirect('/admin/admins');
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      req.flash('error', 'Admin user not found.');
      return res.redirect('/admin/admins');
    }

    // Cannot delete yourself
    if (admin._id.toString() === req.session.adminUser.id.toString()) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/admin/admins');
    }

    // Cannot delete the last superadmin
    if (admin.role === 'superadmin') {
      const superCount = await Admin.countDocuments({ role: 'superadmin' });
      if (superCount <= 1) {
        req.flash('error', 'Cannot delete the only super admin.');
        return res.redirect('/admin/admins');
      }
    }

    await admin.deleteOne();
    req.flash('success', `Admin user "${admin.name}" deleted.`);
    res.redirect('/admin/admins');
  } catch (err) {
    next(err);
  }
};

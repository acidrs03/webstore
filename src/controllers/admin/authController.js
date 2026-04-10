'use strict';

const { validationResult } = require('express-validator');
const Admin = require('../../models/Admin');

exports.showLogin = (req, res) => {
  res.render('admin/login', { title: 'Admin Login', layout: 'admin-bare' });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/admin/login');
  }

  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });

    if (!admin || !(await admin.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    req.session.adminUser = { id: admin._id, name: admin.name, email: admin.email };
    req.flash('success', `Welcome back, ${admin.name}!`);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};

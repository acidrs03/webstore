'use strict';

const shippingService = require('../../services/shippingService');
const settingService = require('../../services/settingService');

exports.index = async (req, res, next) => {
  try {
    const methods = await shippingService.getAllMethods();
    const settingsMap = await settingService.getSettingsMap();
    res.render('admin/shipping/index', {
      title: 'Shipping Methods',
      methods,
      settingsMap,
    });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => {
  res.render('admin/shipping/form', {
    title: 'New Shipping Method',
    method: {},
    isNew: true,
  });
};

exports.create = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description || '',
      price: Math.round(parseFloat(req.body.price || 0) * 100), // dollars → cents
      estimatedMin: parseInt(req.body.estimatedMin, 10) || 3,
      estimatedMax: parseInt(req.body.estimatedMax, 10) || 7,
      isActive: req.body.isActive === 'on',
      sortOrder: parseInt(req.body.sortOrder, 10) || 0,
    };
    const method = await shippingService.createMethod(data);
    req.flash('success', `Shipping method "${method.name}" created.`);
    res.redirect('/admin/shipping');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const method = await shippingService.getMethodById(req.params.id);
    if (!method) {
      req.flash('error', 'Shipping method not found.');
      return res.redirect('/admin/shipping');
    }
    res.render('admin/shipping/form', {
      title: `Edit: ${method.name}`,
      method,
      isNew: false,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description || '',
      price: Math.round(parseFloat(req.body.price || 0) * 100),
      estimatedMin: parseInt(req.body.estimatedMin, 10) || 3,
      estimatedMax: parseInt(req.body.estimatedMax, 10) || 7,
      isActive: req.body.isActive === 'on',
      sortOrder: parseInt(req.body.sortOrder, 10) || 0,
    };
    const method = await shippingService.updateMethod(req.params.id, data);
    if (!method) {
      req.flash('error', 'Shipping method not found.');
      return res.redirect('/admin/shipping');
    }
    req.flash('success', `Shipping method "${method.name}" updated.`);
    res.redirect('/admin/shipping');
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await shippingService.deleteMethod(req.params.id);
    req.flash('success', 'Shipping method deleted.');
    res.redirect('/admin/shipping');
  } catch (err) {
    next(err);
  }
};

exports.updateFreeShipping = async (req, res, next) => {
  try {
    await settingService.upsertSetting('freeShippingEnabled', req.body.freeShippingEnabled === 'on' ? 'true' : 'false');
    await settingService.upsertSetting('freeShippingThreshold', req.body.freeShippingThreshold || '0');
    req.flash('success', 'Free shipping settings saved.');
    res.redirect('/admin/shipping');
  } catch (err) {
    next(err);
  }
};

'use strict';

const settingService = require('../services/settingService');

async function maintenanceMode(req, res, next) {
  // Always allow admin area through (login + panel)
  if (req.path.startsWith('/admin') || req.path.startsWith('/webhooks')) {
    return next();
  }

  // Allow logged-in admins to preview the storefront
  if (req.session && req.session.adminUser) {
    return next();
  }

  try {
    const enabled = await settingService.getSetting('maintenanceEnabled');
    if (enabled !== 'true') return next();

    const heading = await settingService.getSetting('maintenanceHeading') || 'Under Maintenance';
    const message = await settingService.getSetting('maintenanceMessage') || 'We\'ll be back soon.';
    const logo    = await settingService.getSetting('maintenanceLogo') || '';

    return res.status(503).render('maintenance', {
      title: heading,
      heading,
      message,
      logo,
    });
  } catch (_) {
    next();
  }
}

module.exports = { maintenanceMode };

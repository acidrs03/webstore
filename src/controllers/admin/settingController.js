'use strict';

const settingService = require('../../services/settingService');

exports.index = async (req, res, next) => {
  try {
    const settings = await settingService.getAllSettings();
    const settingsMap = await settingService.getSettingsMap();
    res.render('admin/settings/index', {
      title: 'Site Settings',
      settings,
      settingsMap,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body._csrf;

    // Checkboxes are omitted from the form body when unchecked.
    // Handle DB-registered checkboxes.
    const allSettings = await settingService.getAllSettings();
    for (const setting of allSettings) {
      if (setting.inputType === 'checkbox' && !(setting.key in body)) {
        body[setting.key] = 'false';
      }
    }

    // Handle maintenance toggle (not in the DB settings loop)
    if (!('maintenanceEnabled' in body)) {
      body.maintenanceEnabled = 'false';
    } else {
      body.maintenanceEnabled = 'true';
    }

    await settingService.bulkUpdate(body);
    req.flash('success', 'Settings saved.');
    res.redirect('/admin/settings');
  } catch (err) {
    next(err);
  }
};

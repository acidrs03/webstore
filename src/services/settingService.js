'use strict';

const Setting = require('../models/Setting');

/**
 * Return all settings as an array of Setting documents.
 *
 * @returns {Promise<object[]>}
 */
async function getAllSettings() {
  const settings = await Setting.find({}).sort({ group: 1, key: 1 }).lean();
  return settings;
}

/**
 * Return all settings as a flat { key: value } map.
 * Convenient for injecting into view templates.
 *
 * @returns {Promise<object>}
 */
async function getSettingsMap() {
  const settings = await getAllSettings();
  return settings.reduce((map, s) => {
    map[s.key] = s.value;
    return map;
  }, {});
}

/**
 * Get the value of a single setting by key.
 * Returns null if the key does not exist.
 *
 * @param {string} key
 * @returns {Promise<string|null>}
 */
async function getSetting(key) {
  const setting = await Setting.findOne({ key }).lean();
  return setting ? setting.value : null;
}

/**
 * Upsert a single setting by key.
 * Note: intentionally named 'upsettingSetting' to match the spec — alias also exported as 'upsertSetting'.
 *
 * @param {string} key
 * @param {string} value
 * @returns {Promise<object>}
 */
async function upsettingSetting(key, value) {
  const setting = await Setting.findOneAndUpdate(
    { key },
    { $set: { key, value } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return setting;
}

/**
 * Bulk upsert from a plain { key: value } object.
 * Runs all upserts in parallel.
 *
 * @param {object} settingsObj - e.g. { siteName: process.env.SITE_NAME || 'My Store', contactEmail: '...' }
 * @returns {Promise<object[]>} Array of updated Setting documents
 */
async function bulkUpdate(settingsObj) {
  const entries = Object.entries(settingsObj);
  const results = await Promise.all(
    entries.map(([key, value]) => upsettingSetting(key, value))
  );
  return results;
}

/**
 * Seed missing settings from a defaults array.
 * Skips any key that already exists in the database.
 *
 * @param {Array<{ key: string, value: string, group?: string, label?: string, inputType?: string }>} defaults
 * @returns {Promise<void>}
 */
async function initializeDefaults(defaults) {
  if (!Array.isArray(defaults) || defaults.length === 0) return;

  const existing = await Setting.find({}, 'key').lean();
  const existingKeys = new Set(existing.map((s) => s.key));

  const toInsert = defaults.filter((d) => !existingKeys.has(d.key));
  if (toInsert.length > 0) {
    await Setting.insertMany(toInsert);
  }
}

module.exports = {
  getAllSettings,
  getSettingsMap,
  getSetting,
  upsettingSetting,
  upsertSetting: upsettingSetting, // alias with the conventional spelling
  bulkUpdate,
  initializeDefaults,
};

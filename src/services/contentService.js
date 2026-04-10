'use strict';

const Content = require('../models/Content');
const Setting = require('../models/Setting');

/**
 * Find a content block by its unique key.
 * Returns null if not found.
 *
 * @param {string} key - e.g. 'hero', 'about', 'shipping-policy'
 * @returns {Promise<object|null>}
 */
async function getContent(key) {
  const content = await Content.findOne({ key }).lean();
  return content || null;
}

/**
 * Return a content block by key, or fall back to a default object if not found.
 *
 * @param {string} key      - Content key
 * @param {object} defaults - Default shape to return when content is missing
 * @returns {Promise<object>}
 */
async function getContentOrDefault(key, defaults = {}) {
  const content = await getContent(key);
  return content || { key, ...defaults };
}

/**
 * Upsert a content block by key.
 * Creates the document if it doesn't exist; updates it if it does.
 *
 * @param {string} key  - Content key
 * @param {object} data - Fields to set (title, body, data, isActive, etc.)
 * @returns {Promise<object>}
 */
async function upsertContent(key, data) {
  const content = await Content.findOneAndUpdate(
    { key },
    { $set: { ...data, key } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return content;
}

/**
 * Return an array of all content keys currently stored.
 *
 * @returns {Promise<string[]>}
 */
async function getAllContentKeys() {
  const docs = await Content.find({}, 'key').sort('key').lean();
  return docs.map((d) => d.key);
}

/**
 * Fetch all settings and return them as a plain { key: value } map.
 * Useful for passing global settings to every view.
 *
 * @returns {Promise<object>}
 */
async function getSettings() {
  const settings = await Setting.find({}).lean();
  return settings.reduce((map, s) => {
    map[s.key] = s.value;
    return map;
  }, {});
}

/**
 * Fetch settings belonging to a specific group.
 * Returns an array of Setting documents.
 *
 * @param {string} group - e.g. 'general', 'contact', 'social'
 * @returns {Promise<object[]>}
 */
async function getSettingsByGroup(group) {
  const settings = await Setting.find({ group }).sort('key').lean();
  return settings;
}

module.exports = {
  getContent,
  getContentOrDefault,
  upsertContent,
  getAllContentKeys,
  getSettings,
  getSettingsByGroup,
};

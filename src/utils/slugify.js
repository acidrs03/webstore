'use strict';

const slugifyLib = require('slugify');

function slugify(text) {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

// Generate a unique slug by appending a counter if needed
async function uniqueSlug(text, Model, excludeId = null) {
  const base = slugify(text);
  let slug = base;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Model.findOne(query);
    if (!existing) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { slugify, uniqueSlug };

'use strict';

const contentService = require('../../services/contentService');
const mediaService = require('../../services/mediaService');

const CONTENT_KEYS = [
  { key: 'hero', label: 'Homepage Hero' },
  { key: 'announcement', label: 'Announcement Bar' },
  { key: 'about', label: 'About Page' },
  { key: 'faq', label: 'FAQ Page' },
  { key: 'shipping-policy', label: 'Shipping Policy' },
  { key: 'return-policy', label: 'Return Policy' },
];

exports.index = async (req, res, next) => {
  try {
    const pages = await Promise.all(
      CONTENT_KEYS.map(async ({ key, label }) => {
        const content = await contentService.getContent(key);
        return { key, label, content, updatedAt: content ? content.updatedAt : null };
      })
    );
    res.render('admin/content/index', {
      title: 'Content Pages',
      pages,
    });
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { key } = req.params;
    const meta = CONTENT_KEYS.find(k => k.key === key);
    if (!meta) {
      req.flash('error', 'Content page not found.');
      return res.redirect('/admin/content');
    }
    const content = await contentService.getContent(key) || { key, title: meta.label, body: '', data: {} };
    res.render('admin/content/edit', {
      title: `Edit: ${meta.label}`,
      content,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { title, body, ...rest } = req.body;

    // Build structured data from remaining fields
    const data = {};
    Object.keys(rest).forEach(k => {
      if (k !== '_csrf' && k !== 'removeHeroImage') data[k] = rest[k];
    });

    // Handle hero image upload / removal
    if (key === 'hero') {
      const existing = await contentService.getContent('hero');
      const existingImage = existing && existing.data && existing.data.heroImage;

      if (req.body.removeHeroImage === '1' && existingImage) {
        await mediaService.deleteFile(existingImage);
        data.heroImage = '';
      } else if (req.file) {
        if (existingImage) await mediaService.deleteFile(existingImage);
        data.heroImage = mediaService.saveFile(req.file);
      } else if (existingImage) {
        data.heroImage = existingImage;
      }
    }

    await contentService.upsertContent(key, { title, body: body || '', data });
    req.flash('success', 'Content saved successfully.');
    res.redirect('/admin/content');
  } catch (err) {
    next(err);
  }
};

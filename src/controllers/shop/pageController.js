'use strict';

const contentService = require('../../services/contentService');

exports.faq = async (req, res, next) => {
  try {
    const content = await contentService.getContent('faq') || { title: 'FAQ', body: '' };
    const baseUrl = res.locals.baseUrl || '';
    res.render('shop/pages/faq', {
      title: 'FAQ',
      metaDescription: 'Frequently asked questions about ordering, customization, shipping, and returns.',
      canonical: `${baseUrl}/pages/faq`,
      content,
    });
  } catch (err) { next(err); }
};

exports.about = async (req, res, next) => {
  try {
    const content = await contentService.getContent('about') || { title: 'About Us', body: '' };
    const baseUrl = res.locals.baseUrl || '';
    res.render('shop/pages/about', {
      title: 'About Us',
      metaDescription: `Learn about ${res.locals.siteName || 'our store'} — handcrafted goods made with care.`,
      canonical: `${baseUrl}/pages/about`,
      content,
    });
  } catch (err) { next(err); }
};

exports.shipping = async (req, res, next) => {
  try {
    const content = await contentService.getContent('shipping-policy') || { title: 'Shipping Policy', body: '' };
    const baseUrl = res.locals.baseUrl || '';
    res.render('shop/pages/shipping', {
      title: 'Shipping Policy',
      metaDescription: 'Learn about our shipping methods, processing times, and delivery estimates.',
      canonical: `${baseUrl}/pages/shipping`,
      content,
    });
  } catch (err) { next(err); }
};

exports.returns = async (req, res, next) => {
  try {
    const content = await contentService.getContent('return-policy') || { title: 'Return Policy', body: '' };
    const baseUrl = res.locals.baseUrl || '';
    res.render('shop/pages/returns', {
      title: 'Return Policy',
      metaDescription: 'Our return and exchange policy for handcrafted and personalized items.',
      canonical: `${baseUrl}/pages/returns`,
      content,
    });
  } catch (err) { next(err); }
};

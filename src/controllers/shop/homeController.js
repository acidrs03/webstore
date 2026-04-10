'use strict';

const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const contentService = require('../../services/contentService');
const settingService = require('../../services/settingService');

exports.index = async (req, res, next) => {
  try {
    const [featuredProducts, categories, heroContent, settings] = await Promise.all([
      productService.getFeaturedProducts(8),
      categoryService.getAllCategories(),
      contentService.getContentOrDefault('hero', {
        data: {
          title: 'Handcrafted with Heart',
          subtitle: 'Custom laser engraved and personalized items made just for you.',
          ctaText: 'Shop Now',
          ctaUrl: '/shop',
        },
      }),
      settingService.getSettingsMap(),
    ]);

    const hero = heroContent.data || {};
    if (!hero.heroTitle && !hero.title) {
      hero.heroTitle = 'Handcrafted with Heart';
      hero.subtitle = 'Custom laser engraved and personalized items made just for you.';
      hero.ctaText = 'Shop Now';
      hero.ctaUrl = '/shop';
    }

    const baseUrl = res.locals.baseUrl || '';
    const siteName = settings.siteName || process.env.SITE_NAME || 'My Store';
    const tagline  = settings.siteTagline || 'Handcrafted laser engraved and personalized items made with care.';

    res.render('shop/home', {
      title: siteName,
      metaDescription: tagline,
      canonical: `${baseUrl}/`,
      featuredProducts,
      categories,
      hero,
      settings,
    });
  } catch (err) {
    next(err);
  }
};

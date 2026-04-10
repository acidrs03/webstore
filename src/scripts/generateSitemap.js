'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const seoService = require('../services/seoService');

async function generateSitemap() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_store';
  await mongoose.connect(uri);

  const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    console.log('  BASE_URL not set — skipping sitemap generation.');
    await mongoose.disconnect();
    return;
  }

  const xml = await seoService.generateSitemap(baseUrl);
  const sitemapPath = path.join(process.cwd(), 'src', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`✓ Sitemap written to ${sitemapPath}`);

  const robots = seoService.getRobotsContent(baseUrl);
  const robotsPath = path.join(process.cwd(), 'src', 'public', 'robots.txt');
  fs.writeFileSync(robotsPath, robots, 'utf8');
  console.log(`✓ robots.txt written to ${robotsPath}`);

  await mongoose.disconnect();
}

generateSitemap().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});

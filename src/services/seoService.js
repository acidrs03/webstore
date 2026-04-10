'use strict';

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Build a metadata object suitable for passing to view templates.
 */
function buildMeta({ title, description = '', image = '', url = '', siteName = process.env.SITE_NAME || 'My Store' }) {
  return {
    title: title ? `${title} | ${siteName}` : siteName,
    description,
    image,
    url,
    siteName,
    hasImage: !!image,
    hasDescription: !!description,
  };
}

/**
 * Generate a complete XML sitemap including Google image extension.
 * Includes static pages, active product pages (with images), and category filter pages.
 *
 * @param {string} baseUrl - e.g. 'https://craftedbysavageco.com'
 * @returns {Promise<string>} XML sitemap string
 */
async function generateSitemap(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  const now = new Date().toISOString();

  const [products, categories] = await Promise.all([
    Product.find({ isActive: true, isArchived: false }, 'slug title updatedAt images').lean(),
    Category.find({ isActive: true }, 'slug name updatedAt').lean(),
  ]);

  // ── Static pages ───────────────────────────────────────────────────────────
  const staticUrls = [
    { loc: `${base}/`,                changefreq: 'weekly',  priority: '1.0', lastmod: now },
    { loc: `${base}/shop`,            changefreq: 'daily',   priority: '0.9', lastmod: now },
    { loc: `${base}/pages/about`,     changefreq: 'monthly', priority: '0.6', lastmod: now },
    { loc: `${base}/pages/faq`,       changefreq: 'monthly', priority: '0.6', lastmod: now },
    { loc: `${base}/pages/shipping`,  changefreq: 'monthly', priority: '0.5', lastmod: now },
    { loc: `${base}/pages/returns`,   changefreq: 'monthly', priority: '0.5', lastmod: now },
    { loc: `${base}/custom-request`,  changefreq: 'monthly', priority: '0.7', lastmod: now },
    { loc: `${base}/contact`,         changefreq: 'monthly', priority: '0.5', lastmod: now },
  ];

  // ── Category filter pages ──────────────────────────────────────────────────
  // Each category is a filtered view of /shop using a query param.
  const categoryUrls = categories.map((c) => ({
    loc: `${base}/shop?category=${encodeURIComponent(c.slug)}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString() : now,
  }));

  // ── Simple URL entries (static + category) ─────────────────────────────────
  const simpleEntries = [...staticUrls, ...categoryUrls].map(
    (u) =>
      `  <url>\n` +
      `    <loc>${escapeXml(u.loc)}</loc>\n` +
      `    <lastmod>${u.lastmod}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      `  </url>`
  );

  // ── Product pages with image sitemap extension ─────────────────────────────
  const productEntries = products.map((p) => {
    const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString() : now;
    const loc = escapeXml(`${base}/shop/${p.slug}`);

    const imageBlocks = (p.images || [])
      .filter(Boolean)
      .map((img) => {
        const imgUrl = img.startsWith('http') ? img : `${base}${img}`;
        return (
          `    <image:image>\n` +
          `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n` +
          `      <image:title>${escapeXml(p.title)}</image:title>\n` +
          `    </image:image>`
        );
      })
      .join('\n');

    return (
      `  <url>\n` +
      `    <loc>${loc}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>0.8</priority>\n` +
      (imageBlocks ? `${imageBlocks}\n` : '') +
      `  </url>`
    );
  });

  const allEntries = [...simpleEntries, ...productEntries].join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset\n` +
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    allEntries + '\n' +
    `</urlset>`
  );
}

/**
 * Generate the content for a robots.txt file.
 *
 * @param {string} baseUrl - e.g. 'https://craftedbysavageco.com'
 * @returns {string}
 */
function getRobotsContent(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');

  return [
    '# robots.txt',
    '# https://www.robotstxt.org/',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Private / functional paths — do not index',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /cart',
    'Disallow: /cart/',
    'Disallow: /checkout',
    'Disallow: /checkout/',
    'Disallow: /webhooks/',
    'Disallow: /search',
    '',
    '# Block duplicate-content query strings',
    '# (canonical tags handle this for browsers; these guard against crawler traps)',
    'Disallow: /*?sort=',
    'Disallow: /*?page=',
    'Disallow: /*?_csrf=',
    '',
    '# Slow aggressive crawlers to 1 request every 2 seconds',
    'Crawl-delay: 2',
    '',
    `Sitemap: ${base}/sitemap.xml`,
  ].join('\n');
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  buildMeta,
  generateSitemap,
  getRobotsContent,
};

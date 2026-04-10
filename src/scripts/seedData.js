'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const Content = require('../models/Content');
const ShippingMethod = require('../models/ShippingMethod');
const { slugify } = require('../utils/slugify');

async function upsert(Model, filter, data) {
  return Model.findOneAndUpdate(filter, { $setOnInsert: data }, { upsert: true, new: true });
}

async function seedData() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_store';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  // ─── Categories ────────────────────────────────────────────────────────────
  const categoryDefs = [
    { name: 'Laser Engraved', description: 'Precision laser-engraved items with personalized designs.', sortOrder: 1 },
    { name: 'Personalized Gifts', description: 'Thoughtful gifts with a personal touch for every occasion.', sortOrder: 2 },
    { name: 'Home Decor', description: 'Handcrafted pieces to make your house a home.', sortOrder: 3 },
    { name: 'Wedding & Events', description: 'Custom pieces for weddings, showers, and special celebrations.', sortOrder: 4 },
  ];

  const categories = {};
  for (const def of categoryDefs) {
    const slug = slugify(def.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      console.log(`  Category exists: ${def.name}`);
      categories[def.name] = existing;
    } else {
      const cat = await Category.create({ ...def, slug, isActive: true });
      console.log(`✓ Category created: ${def.name}`);
      categories[def.name] = cat;
    }
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  const productDefs = [
    {
      title: 'Personalized Cutting Board',
      shortDescription: 'Laser-engraved hardwood cutting board with custom name or monogram.',
      description: '<p>A beautiful, high-quality hardwood cutting board laser-engraved with your custom name, monogram, or design. Makes the perfect wedding, housewarming, or holiday gift.</p><p>Available in maple and walnut. Each board is made to order.</p>',
      price: 4999,
      sku: 'ITEM-LCB-001',
      category: 'Laser Engraved',
      isFeatured: true,
      allowsCustomization: true,
      customizationLabel: 'Name or Text to Engrave',
      customizationHelpText: 'Enter up to 30 characters (e.g. "The Smith Family" or a monogram)',
      leadTimeDays: 5,
      madeToOrder: true,
      tags: ['cutting board', 'kitchen', 'personalized', 'wedding gift'],
    },
    {
      title: 'Custom Engraved Tumbler',
      shortDescription: 'Stainless steel 20oz tumbler with laser-engraved name or design.',
      description: '<p>Keep your drinks hot or cold in style with our custom laser-engraved 20oz stainless steel tumbler. Perfect for coffee, tea, or cold beverages.</p><p>Includes your choice of name, initials, or a custom design.</p>',
      price: 2999,
      sku: 'ITEM-TUM-001',
      category: 'Laser Engraved',
      isFeatured: true,
      allowsCustomization: true,
      customizationLabel: 'Name or Text',
      customizationHelpText: 'Enter name or text to engrave (max 20 characters)',
      leadTimeDays: 3,
      madeToOrder: true,
      tags: ['tumbler', 'drinkware', 'personalized', 'gift'],
    },
    {
      title: 'Personalized Baby Keepsake Box',
      shortDescription: 'Hand-crafted wooden keepsake box engraved with baby\'s name and birthdate.',
      description: '<p>Celebrate a new arrival with this beautiful hand-crafted wooden keepsake box, laser-engraved with the baby\'s name, birthdate, and birth stats. A treasure they\'ll keep forever.</p>',
      price: 5999,
      sku: 'ITEM-BABY-001',
      category: 'Personalized Gifts',
      isFeatured: true,
      allowsCustomization: true,
      customizationLabel: "Baby's Info",
      customizationHelpText: "Enter: Name, Date of Birth, Weight, Length (e.g. 'Emma Rose | June 3, 2024 | 7 lbs 4 oz | 20 inches')",
      leadTimeDays: 7,
      madeToOrder: true,
      tags: ['baby', 'keepsake', 'gift', 'newborn'],
    },
    {
      title: 'Custom Acrylic Wedding Sign',
      shortDescription: 'Elegant acrylic welcome sign personalized with your names and wedding date.',
      description: '<p>Set the tone for your big day with a stunning custom acrylic welcome sign. Each sign is laser-engraved with your names, wedding date, and optional venue name.</p><p>Available in multiple sizes. Frosted and clear acrylic options.</p>',
      price: 8999,
      sku: 'ITEM-WED-001',
      category: 'Wedding & Events',
      isFeatured: false,
      allowsCustomization: true,
      customizationLabel: 'Wedding Details',
      customizationHelpText: "Enter: Names & Date (e.g. 'Emma & James | October 12, 2024'). Venue name optional.",
      leadTimeDays: 10,
      madeToOrder: true,
      tags: ['wedding', 'sign', 'acrylic', 'custom'],
    },
    {
      title: 'Rustic Wood Home Sign',
      shortDescription: 'Handcrafted reclaimed wood sign with your family name and established year.',
      description: '<p>Add warmth and character to your home with a handcrafted reclaimed wood sign featuring your family name and the year your family was established. Each piece is unique.</p>',
      price: 6499,
      sku: 'ITEM-HMD-001',
      category: 'Home Decor',
      isFeatured: true,
      allowsCustomization: true,
      customizationLabel: 'Family Name & Year',
      customizationHelpText: "Enter: Family name and year (e.g. 'The Johnsons | Est. 2019')",
      leadTimeDays: 5,
      madeToOrder: true,
      tags: ['home decor', 'family sign', 'wood', 'personalized'],
    },
    {
      title: 'Laser Engraved Ornament Set',
      shortDescription: 'Set of 4 personalized wood ornaments, perfect for gifting or decorating.',
      description: '<p>Beautiful set of 4 laser-engraved maple wood ornaments. Choose from round, star, snowflake, or heart shapes. Each ornament can be personalized with a name or short message.</p>',
      price: 3499,
      sku: 'ITEM-ORN-001',
      category: 'Personalized Gifts',
      isFeatured: false,
      allowsCustomization: true,
      customizationLabel: 'Names for Each Ornament',
      customizationHelpText: "Enter up to 4 names, separated by commas (e.g. 'Mom, Dad, Emma, Jake')",
      leadTimeDays: 4,
      madeToOrder: true,
      tags: ['ornament', 'holiday', 'christmas', 'gift set'],
    },
  ];

  for (const def of productDefs) {
    const category = categories[def.category];
    const slug = slugify(def.title);
    const existing = await Product.findOne({ slug });
    if (existing) {
      console.log(`  Product exists: ${def.title}`);
      continue;
    }
    const { category: catName, ...productData } = def;
    await Product.create({
      ...productData,
      slug,
      categoryId: category ? category._id : null,
      isActive: true,
      isArchived: false,
    });
    console.log(`✓ Product created: ${def.title}`);
  }

  // ─── Settings ──────────────────────────────────────────────────────────────
  const settingDefs = [
    { key: 'siteName', value: process.env.SITE_NAME || 'My Store', group: 'general', label: 'Site Name', inputType: 'text' },
    { key: 'siteTagline', value: 'Handcrafted with heart, engraved with precision.', group: 'general', label: 'Tagline', inputType: 'text' },
    { key: 'contactEmail', value: process.env.ADMIN_EMAIL || 'hello@example.com', group: 'contact', label: 'Contact Email', inputType: 'email' },
    { key: 'contactPhone', value: '', group: 'contact', label: 'Phone Number', inputType: 'text' },
    { key: 'contactAddress', value: '', group: 'contact', label: 'Business Address', inputType: 'textarea' },
    { key: 'instagramUrl', value: '', group: 'social', label: 'Instagram URL', inputType: 'url' },
    { key: 'facebookUrl', value: '', group: 'social', label: 'Facebook URL', inputType: 'url' },
    { key: 'announcementText', value: '', group: 'announcement', label: 'Announcement Text', inputType: 'text' },
    { key: 'announcementActive', value: 'false', group: 'announcement', label: 'Show Announcement Bar', inputType: 'checkbox' },
    // Theme (seeded as rustic defaults)
    { key: 'activeTheme',        value: 'rustic',   group: 'theme', label: 'Active Theme',        inputType: 'text' },
    { key: 'themePrimary',       value: '#8B4513',  group: 'theme', label: 'Primary Color',        inputType: 'text' },
    { key: 'themePrimaryLight',  value: '#A0522D',  group: 'theme', label: 'Primary Light',        inputType: 'text' },
    { key: 'themePrimaryDark',   value: '#6B3410',  group: 'theme', label: 'Primary Dark',         inputType: 'text' },
    { key: 'themeAccent',        value: '#D4A574',  group: 'theme', label: 'Accent',               inputType: 'text' },
    { key: 'themeAccentLight',   value: '#F5E6D3',  group: 'theme', label: 'Accent Light',         inputType: 'text' },
    { key: 'themeBg',            value: '#FDFAF6',  group: 'theme', label: 'Background',           inputType: 'text' },
    { key: 'themeBgWarm',        value: '#FEF6EE',  group: 'theme', label: 'Background Warm',      inputType: 'text' },
    { key: 'themeText',          value: '#2C1810',  group: 'theme', label: 'Text',                 inputType: 'text' },
    { key: 'themeTextMuted',     value: '#6B5A4E',  group: 'theme', label: 'Text Muted',           inputType: 'text' },
    { key: 'themeBorder',        value: '#E8DDD4',  group: 'theme', label: 'Border',               inputType: 'text' },
    { key: 'themeHeroBgFrom',    value: '#FEF6EE',  group: 'theme', label: 'Hero Gradient From',   inputType: 'text' },
    { key: 'themeHeroBgMid',     value: '#F5E6D3',  group: 'theme', label: 'Hero Gradient Mid',    inputType: 'text' },
    { key: 'themeHeroBgTo',      value: '#EDD9C0',  group: 'theme', label: 'Hero Gradient To',     inputType: 'text' },
    { key: 'themeFooterBg',      value: '#1a1207',  group: 'theme', label: 'Footer Background',    inputType: 'text' },
    { key: 'maintenanceEnabled', value: 'false', group: 'maintenance', label: 'Maintenance Mode', inputType: 'checkbox' },
    { key: 'maintenanceHeading', value: 'Under Maintenance', group: 'maintenance', label: 'Maintenance Heading', inputType: 'text' },
    { key: 'maintenanceMessage', value: "We'll be back soon.", group: 'maintenance', label: 'Maintenance Message', inputType: 'text' },
    { key: 'freeShippingEnabled', value: 'false', group: 'shipping', label: 'Enable Free Shipping', inputType: 'checkbox' },
    { key: 'freeShippingThreshold', value: '75', group: 'shipping', label: 'Free Shipping Minimum ($)', inputType: 'number' },
  ];

  for (const def of settingDefs) {
    const existing = await Setting.findOne({ key: def.key });
    if (existing) continue;
    await Setting.create(def);
    console.log(`✓ Setting created: ${def.key}`);
  }

  // ─── Content ───────────────────────────────────────────────────────────────
  const contentDefs = [
    {
      key: 'hero',
      title: 'Homepage Hero',
      body: '',
      data: {
        title: 'Handcrafted with Heart',
        subtitle: 'Custom laser engraved and personalized items made just for you.',
        ctaText: 'Shop Now',
        ctaUrl: '/shop',
      },
    },
    {
      key: 'about',
      title: 'About Us',
      body: `<p class="lead">Welcome to our store — where every item is made with intention and care.</p>
<p>We're a small, passionate business specializing in handcrafted and personalized items. We pour our heart into each piece we create.</p>
<p>Every order is made with care. We believe in quality over quantity, and in creating items that last a lifetime.</p>
<p>Have a special idea? We'd love to bring it to life. <a href="/custom-request">Send us a custom order request</a> and let's create something together.</p>`,
      data: {},
    },
    {
      key: 'faq',
      title: 'Frequently Asked Questions',
      body: '',
      data: {},
    },
    {
      key: 'shipping-policy',
      title: 'Shipping Policy',
      body: '',
      data: {},
    },
    {
      key: 'return-policy',
      title: 'Return Policy',
      body: '',
      data: {},
    },
    {
      key: 'announcement',
      title: 'Announcement Bar',
      body: '',
      data: { text: '', isActive: false },
    },
  ];

  for (const def of contentDefs) {
    const existing = await Content.findOne({ key: def.key });
    if (existing) continue;
    await Content.create({ ...def, isActive: true });
    console.log(`✓ Content created: ${def.key}`);
  }

  // ─── Shipping Methods ──────────────────────────────────────────────────────
  const shippingMethodDefs = [
    { name: 'Standard Shipping', description: 'USPS First Class or Ground', price: 599, estimatedMin: 5, estimatedMax: 10, isActive: true, sortOrder: 1 },
    { name: 'Priority Shipping', description: 'USPS Priority Mail', price: 1099, estimatedMin: 2, estimatedMax: 4, isActive: true, sortOrder: 2 },
  ];

  for (const def of shippingMethodDefs) {
    const existing = await ShippingMethod.findOne({ name: def.name });
    if (existing) {
      console.log(`  Shipping method exists: ${def.name}`);
      continue;
    }
    await ShippingMethod.create(def);
    console.log(`✓ Shipping method created: ${def.name}`);
  }

  console.log('\n✓ Seed complete!\n');
  await mongoose.disconnect();
}

seedData().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_store';
  await mongoose.connect(uri);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme123!';
  const name = 'Admin';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin with email ${email} already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const admin = new Admin({ email, password, name });
  await admin.save();

  console.log('');
  console.log('✓ Admin user created successfully!');
  console.log('  Email:    ' + email);
  console.log('  Password: ' + password);
  console.log('');
  console.log('  → Change this password immediately after first login!');
  console.log('  → Admin login URL: http://localhost:3000/admin/login');
  console.log('');

  await mongoose.disconnect();
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

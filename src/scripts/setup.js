'use strict';

/**
 * Local development setup script.
 * Creates required directories that are gitignored.
 * Run once before first `npm run dev`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const dirs = [
  'uploads',
  'uploads/products',
  'uploads/categories',
  'uploads/hero',
  'uploads/requests',
  'logs',
];

let created = 0;
for (const dir of dirs) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`✓ Created ${dir}/`);
    created++;
  }
}

if (created === 0) {
  console.log('All directories already exist — nothing to do.');
} else {
  console.log(`\nSetup complete. ${created} director${created === 1 ? 'y' : 'ies'} created.`);
}

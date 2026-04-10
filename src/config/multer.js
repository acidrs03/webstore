'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '..', '..', 'uploads');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10 MB default

// Ensure the base upload directory exists at module load time
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Returns a configured diskStorage engine that saves files into:
 *   UPLOAD_DIR/<subDir>/<uuid><ext>
 *
 * @param {string} subDir - subdirectory within UPLOAD_DIR (e.g. 'products')
 */
function buildStorage(subDir = 'misc') {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dest = path.join(UPLOAD_DIR, subDir);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

/**
 * Multer fileFilter — only allows common image MIME types.
 */
function imageFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), {
        status: 400,
      }),
      false
    );
  }
}

/**
 * Pre-built upload middleware factories.
 *
 * Usage:
 *   const { upload } = require('../config/multer');
 *   router.post('/products', upload('products').single('image'), handler);
 */
function upload(subDir = 'misc') {
  return multer({
    storage: buildStorage(subDir),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
}

// Convenience: product image upload (single file, field name 'image')
const productImageUpload = upload('products');

// Convenience: general single-image upload
const singleImageUpload = upload('misc');

module.exports = {
  upload,
  productImageUpload,
  singleImageUpload,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
};

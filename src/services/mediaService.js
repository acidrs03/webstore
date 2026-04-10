'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Media Service — Local Disk Storage
//
// This service abstracts file storage so it can be swapped out for a cloud
// provider without touching any route or controller code.
//
// To swap in Cloudinary or S3:
//   1. Create an adapter module (e.g. src/adapters/cloudinaryAdapter.js)
//      that exports { saveFile, deleteFile }.
//   2. Replace the implementations of saveFile() and deleteFile() below with
//      calls to the adapter (or re-export them directly).
// ─────────────────────────────────────────────────────────────────────────────

const UPLOADS_DIR = 'products'; // sub-directory within /uploads

/**
 * Build the public URL path for a file.
 *
 * @param {string} filename  - The stored filename
 * @param {string} [subDir]  - Sub-directory under /uploads (defaults to UPLOADS_DIR)
 * @returns {string}         - e.g. '/uploads/products/image.jpg'
 */
function getPublicPath(filename, subDir = UPLOADS_DIR) {
  return `/uploads/${subDir}/${filename}`;
}

/**
 * Persist a multer file object to disk (multer already wrote it).
 * Returns the public URL path.
 *
 * @param {Express.Multer.File} file - Multer file object
 * @returns {string} Public path, e.g. '/uploads/products/abc123.jpg'
 */
function saveFile(file) {
  if (!file) throw new Error('No file provided to saveFile');

  // Multer has already written the file to disk (dest configured in multer middleware).
  // We just need to return the public URL path derived from the stored filename.
  const filename = file.filename || path.basename(file.path);
  const subDir = file.destination
    ? path.basename(file.destination)
    : UPLOADS_DIR;

  return getPublicPath(filename, subDir);
}

/**
 * Persist multiple multer file objects.
 * Returns an array of public URL paths.
 *
 * @param {Express.Multer.File[]} files
 * @returns {string[]}
 */
function saveFiles(files) {
  if (!Array.isArray(files)) return [];
  return files.map(saveFile);
}

/**
 * Delete a file from disk given its public path.
 * Resolves silently if the file does not exist.
 *
 * @param {string} filePath - Public URL path, e.g. '/uploads/products/abc123.jpg'
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  if (!filePath) return;

  // Convert public URL path (e.g. /uploads/products/abc.jpg) to absolute path
  // Uploads are stored at <project-root>/uploads/
  const projectRoot = path.resolve(__dirname, '..', '..');
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const absolutePath = path.join(projectRoot, relativePath);

  return new Promise((resolve) => {
    fs.unlink(absolutePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // Log non-fatal errors but don't throw — a missing file should not
        // break the calling operation.
        console.error(`[mediaService] Failed to delete file: ${absolutePath}`, err.message);
      }
      resolve();
    });
  });
}

module.exports = {
  saveFile,
  saveFiles,
  deleteFile,
  getPublicPath,
};

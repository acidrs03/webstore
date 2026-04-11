'use strict';

const { upload } = require('../config/multer');

// Product images — up to 8 files, stored in uploads/products/
const productImages = upload('products').array('images', 8);

// Category image — single file, stored in uploads/categories/
const categoryImage = upload('categories').single('image');

// Custom request reference image — single file, stored in uploads/requests/
const requestImage = upload('requests').single('referenceImage');

// Hero image — single file, stored in uploads/hero/
const heroImage = upload('hero').single('heroImage');

// Maintenance logo — single file, stored in uploads/maintenance/
const maintenanceLogo = upload('maintenance').single('maintenanceLogo');

module.exports = { productImages, categoryImage, requestImage, heroImage, maintenanceLogo };

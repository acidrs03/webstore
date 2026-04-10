'use strict';

const Product = require('../models/Product');

/**
 * Ensure the session has a properly shaped cart object.
 * @param {object} session - Express session object
 */
function initCart(session) {
  if (!session.cart || typeof session.cart !== 'object') {
    session.cart = { items: [], subtotal: 0 };
  }
  if (!Array.isArray(session.cart.items)) {
    session.cart.items = [];
  }
  if (typeof session.cart.subtotal !== 'number') {
    session.cart.subtotal = 0;
  }
}

/**
 * Return the current cart, initializing it if necessary.
 * Returns a plain object: { items, subtotal, count }.
 */
function getCart(session) {
  initCart(session);
  const cart = session.cart;
  const count = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  return { ...cart, count };
}

/**
 * Add an item to the cart.
 * If an item with the same productId AND customizationText already exists, increment quantity.
 */
function addItem(session, { productId, title, slug, price, image, quantity = 1, customizationText = '' }) {
  initCart(session);

  const items = session.cart.items;
  const existing = items.find(
    (i) =>
      String(i.productId) === String(productId) &&
      (i.customizationText || '') === (customizationText || '')
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: String(productId),
      title,
      slug,
      price,       // stored in cents
      image: image || '',
      quantity,
      customizationText: customizationText || '',
    });
  }

  recalculate(session);
  return getCart(session);
}

/**
 * Update the quantity of an item at a given index.
 * Setting quantity to 0 removes the item.
 */
function updateItem(session, itemIndex, quantity) {
  initCart(session);

  const items = session.cart.items;
  const idx = parseInt(itemIndex, 10);

  if (idx < 0 || idx >= items.length) {
    throw new Error('Invalid item index');
  }

  if (quantity <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = quantity;
  }

  recalculate(session);
  return getCart(session);
}

/**
 * Remove the item at the given index from the cart.
 */
function removeItem(session, itemIndex) {
  initCart(session);

  const idx = parseInt(itemIndex, 10);
  if (idx < 0 || idx >= session.cart.items.length) {
    throw new Error('Invalid item index');
  }

  session.cart.items.splice(idx, 1);
  recalculate(session);
  return getCart(session);
}

/**
 * Empty the cart entirely.
 */
function clearCart(session) {
  session.cart = { items: [], subtotal: 0 };
  return getCart(session);
}

/**
 * Recalculate and persist the cart subtotal in cents.
 */
function recalculate(session) {
  initCart(session);
  session.cart.subtotal = session.cart.items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0);
  }, 0);
  return session.cart.subtotal;
}

/**
 * Validate cart prices against current database values.
 * Updates any stale prices in the cart and returns a summary.
 *
 * @returns {{ updated: boolean, removedItems: string[] }}
 */
async function validateCartPrices(session) {
  initCart(session);

  const items = session.cart.items;
  let updated = false;
  const removedItems = [];

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findById(item.productId).select('price isActive isArchived title').lean();

    if (!product || !product.isActive || product.isArchived) {
      removedItems.push(item.title || item.productId);
      items.splice(i, 1);
      updated = true;
      continue;
    }

    if (product.price !== item.price) {
      item.price = product.price;
      updated = true;
    }
  }

  if (updated) {
    recalculate(session);
  }

  return { updated, removedItems };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  recalculate,
  validateCartPrices,
};

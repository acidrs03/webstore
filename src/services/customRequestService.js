'use strict';

const CustomRequest = require('../models/CustomRequest');
const { paginate } = require('../utils/paginate');

/**
 * Get paginated custom requests, optionally filtered by status.
 *
 * @param {object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.status]  - Filter by status enum value
 * @returns {Promise<{ requests: object[], pagination: object }>}
 */
async function getRequests({ page = 1, limit = 20, status } = {}) {
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [requests, total] = await Promise.all([
    CustomRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    CustomRequest.countDocuments(query),
  ]);

  return {
    requests,
    pagination: paginate(total, pageNum, limitNum),
  };
}

/**
 * Find a single custom request by its MongoDB ID.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getRequestById(id) {
  const request = await CustomRequest.findById(id).lean();
  return request;
}

/**
 * Create a new custom request.
 *
 * @param {object} data - Fields matching the CustomRequest schema
 * @returns {Promise<object>}
 */
async function createRequest(data) {
  const request = await CustomRequest.create(data);
  return request;
}

/**
 * Update the status (and optionally adminNotes) of a custom request.
 *
 * @param {string} id
 * @param {string} status     - New status value
 * @param {string} [adminNotes] - Optional internal notes
 * @returns {Promise<object|null>}
 */
async function updateStatus(id, status, adminNotes) {
  const update = { status };
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const request = await CustomRequest.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return request;
}

/**
 * Return summary statistics for the requests dashboard widget.
 *
 * @returns {Promise<{ total: number, new: number, reviewing: number }>}
 */
async function getStats() {
  const [total, newCount, reviewingCount] = await Promise.all([
    CustomRequest.countDocuments({}),
    CustomRequest.countDocuments({ status: 'new' }),
    CustomRequest.countDocuments({ status: 'reviewing' }),
  ]);

  return {
    total,
    new: newCount,
    reviewing: reviewingCount,
  };
}

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateStatus,
  getStats,
};

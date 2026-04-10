'use strict';

function paginate(totalItems, currentPage, itemsPerPage, path) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const page = Math.max(1, Math.min(currentPage, totalPages));

  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    prevPage: page - 1,
    nextPage: page + 1,
    path,
  };
}

module.exports = { paginate };

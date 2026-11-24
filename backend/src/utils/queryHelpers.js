const { PAGINATION } = require('../constants');

// Reads ?page=&limit= from the query string and returns safe numbers
const getPagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = PAGINATION.DEFAULT_PAGE;
  if (Number.isNaN(limit) || limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
};

// Builds the pagination info that is sent back with every list response
const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

// Escapes special characters so user input can be used safely inside a RegExp
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { getPagination, buildPaginationMeta, escapeRegex };

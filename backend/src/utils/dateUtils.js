// Date helpers.
// All business dates (joining, leave, start, due) are stored as "date only" values
// at 00:00 UTC, e.g. "2026-11-24" -> 2026-11-24T00:00:00.000Z.
// This avoids timezone problems when comparing two dates.

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Returns true if value is a real calendar date in YYYY-MM-DD format
const isValidDateString = (value) => {
  if (typeof value !== 'string' || !DATE_ONLY_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// "2026-11-24" -> Date at 00:00 UTC
const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  return new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
};

// Today's date (in the server timezone, see TZ in .env) as a date-only value
const getToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// Date -> "2026-11-24" (used in API responses and CSV)
const formatDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '');

module.exports = {
  isValidDateString,
  toDateOnly,
  getToday,
  formatDate,
};

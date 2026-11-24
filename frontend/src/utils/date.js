// The backend sends dates like "2026-11-24T00:00:00.000Z".
// Business dates are stored at 00:00 UTC, so we always read them in UTC
// to avoid showing the previous/next day in some timezones.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-24T00:00:00.000Z" -> "24 Nov 2026"
export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

// Short version for tables: "24 Nov"
export const formatShortDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]}`;
};

// Real timestamps (createdAt, completedDate) shown in the user's local time
export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// "2026-11-24T00:00:00.000Z" -> "2026-11-24" (value for <input type="date">)
export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

// Today's date as "YYYY-MM-DD" in the user's local time
export const todayInputDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

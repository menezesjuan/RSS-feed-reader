/**
 * Normalizes various RSS/Atom date strings (RFC 822, RFC 2822, ISO 8601) into a valid JavaScript Date object.
 * @param {string|Date|null|undefined} dateInput 
 * @returns {Date}
 */
export function normalizeDate(dateInput) {
  if (!dateInput) {
    return new Date();
  }

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  }

  const str = String(dateInput).trim();
  if (!str) {
    return new Date();
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle common non-standard formats (e.g. DD/MM/YYYY or YYYY/MM/DD)
  const slashParts = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (slashParts) {
    const fallback = new Date(Date.UTC(+slashParts[1], +slashParts[2] - 1, +slashParts[3]));
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }
  }

  return new Date();
}

/**
 * Returns a concise relative time string (e.g. 'Just now', '10m ago', '2h ago', '3d ago').
 * @param {Date|string} date 
 * @param {Date} [baseDate=new Date()] 
 * @returns {string}
 */
export function formatRelativeTime(date, baseDate = new Date()) {
  const d = normalizeDate(date);
  const diffMs = baseDate.getTime() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) {
    return 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay}d ago`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}mo ago`;
  }

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}y ago`;
}

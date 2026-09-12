/**
 * Sanitizes URLs to prevent execution of pseudo-protocols like javascript: or data:
 * Only allows http:, https:, relative paths (/, ./) or #.
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|\.\/|#)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

/**
 * Sanitizes and escapes raw strings for safe insertion into HTML/innerHTML.
 * Escapes &, <, >, ", and ' to prevent Cross-Site Scripting (XSS).
 * 
 * @param {string|number|null|undefined} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) {
    return '';
  }
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

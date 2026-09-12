const NAMED_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&hellip;': '…',
  '&trade;': '™',
  '&copy;': '©',
  '&reg;': '®'
};

/**
 * Decodes HTML entities (both named and numeric decimal/hexadecimal).
 * @param {string} str 
 * @returns {string}
 */
export function decodeHtmlEntities(str) {
  if (!str) return '';

  return str
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|mdash|ndash|lsquo|rsquo|ldquo|rdquo|hellip|trade|copy|reg);/g, (match) => {
      return NAMED_ENTITIES[match] || match;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(Number(dec));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return _;
      }
    });
}

/**
 * Strips all HTML tags and collapses whitespace.
 * @param {string} html 
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a clean text excerpt from HTML/text, trimmed at word boundary.
 * @param {string} htmlOrText 
 * @param {number} [maxLength=180] 
 * @returns {string}
 */
export function extractExcerpt(htmlOrText, maxLength = 180) {
  const plainText = decodeHtmlEntities(stripHtml(htmlOrText));
  if (!plainText || plainText.length <= maxLength) {
    return plainText;
  }

  const sub = plainText.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  const cleanCut = lastSpace > 0 ? sub.slice(0, lastSpace) : sub;
  return `${cleanCut.trim()}...`;
}

/**
 * Sanitizes HTML by stripping dangerous tags and inline event attributes.
 * @param {string} html 
 * @returns {string}
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}

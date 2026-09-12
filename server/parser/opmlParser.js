import { XMLParser } from 'fast-xml-parser';
import { decodeHtmlEntities } from './htmlUtils.js';

const opmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  parseTagValue: false
};

function ensureArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/**
 * Finds attribute value case-insensitively.
 */
function getAttr(node, names) {
  if (!node || typeof node !== 'object') return '';
  for (const name of names) {
    for (const key of Object.keys(node)) {
      if (key.toLowerCase() === `@_${name.toLowerCase()}`) {
        return node[key];
      }
    }
  }
  return '';
}

/**
 * Parses OPML XML string and extracts feeds and categories with full edge-case resilience.
 * @param {string} opmlString 
 * @returns {object}
 */
export function parseOpml(opmlString) {
  if (!opmlString || typeof opmlString !== 'string' || !opmlString.trim()) {
    throw new Error('OPML content is empty or invalid');
  }

  const parser = new XMLParser(opmlParserOptions);
  const parsed = parser.parse(opmlString);

  if (!parsed || !parsed.opml || !parsed.opml.body) {
    throw new Error('Invalid OPML structure: missing <opml><body> tags');
  }

  const docTitle = parsed.opml.head ? (parsed.opml.head.title || 'Imported Feeds') : 'Imported Feeds';
  const rawOutlines = ensureArray(parsed.opml.body.outline);

  const feeds = [];
  const categoriesSet = new Set();
  const seenUrls = new Set();
  let totalOutlinesFound = 0;
  let duplicatesSkipped = 0;
  let invalidFeeds = 0;

  function traverse(outlineNode, currentCategory = 'Uncategorized') {
    totalOutlinesFound++;
    const xmlUrl = getAttr(outlineNode, ['xmlUrl', 'xmlurl', 'url']);
    const htmlUrl = getAttr(outlineNode, ['htmlUrl', 'htmlurl']);
    const title = decodeHtmlEntities(getAttr(outlineNode, ['title', 'text'])) || 'Untitled Feed';
    const description = decodeHtmlEntities(getAttr(outlineNode, ['description', 'desc'])) || '';

    // If this outline node has an xmlUrl, it is a feed entry!
    if (xmlUrl) {
      const normalizedUrl = xmlUrl.trim();
      if (seenUrls.has(normalizedUrl)) {
        duplicatesSkipped++;
        return;
      }
      seenUrls.add(normalizedUrl);

      categoriesSet.add(currentCategory);
      feeds.push({
        title: title || normalizedUrl,
        feedUrl: normalizedUrl,
        siteUrl: htmlUrl.trim() || '',
        description,
        category: currentCategory
      });
      return;
    }

    // If no xmlUrl, this node might be a category containing child outlines!
    const children = ensureArray(outlineNode.outline);
    if (children.length > 0) {
      const nodeText = decodeHtmlEntities(getAttr(outlineNode, ['text', 'title'])) || 'Category';
      const nestedCategory = currentCategory === 'Uncategorized' 
        ? nodeText 
        : `${currentCategory} > ${nodeText}`;

      categoriesSet.add(nestedCategory);

      for (const child of children) {
        traverse(child, nestedCategory);
      }
    } else {
      // Leaf node without xmlUrl is invalid or placeholder
      invalidFeeds++;
    }
  }

  for (const rootOutline of rawOutlines) {
    traverse(rootOutline);
  }

  return {
    title: docTitle,
    feeds,
    categories: Array.from(categoriesSet).filter(c => c !== 'Uncategorized'),
    totalOutlinesFound,
    duplicatesSkipped,
    invalidFeeds
  };
}

/**
 * Generates an OPML 2.0 XML string from categories and feeds.
 * @param {Array<{name: string, feeds: Array<{title: string, feedUrl: string, siteUrl?: string, description?: string}>}>} categories 
 * @param {string} [title='Frontpage Subscriptions'] 
 * @returns {string}
 */
export function exportOpml(categories, title = 'Frontpage Subscriptions') {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    '  <head>',
    `    <title>${escapeXml(title)}</title>`,
    `    <dateCreated>${new Date().toISOString()}</dateCreated>`,
    '    <docs>https://opml.org/spec2.opml</docs>',
    '  </head>',
    '  <body>'
  ];

  for (const cat of categories) {
    lines.push(`    <outline text="${escapeXml(cat.name)}" title="${escapeXml(cat.name)}">`);
    for (const feed of cat.feeds || []) {
      const feedTitle = escapeXml(feed.title || 'Feed');
      const feedUrl = escapeXml(feed.feedUrl || '');
      const siteUrl = escapeXml(feed.siteUrl || '');
      const desc = feed.description ? ` description="${escapeXml(feed.description)}"` : '';
      lines.push(`      <outline type="rss" text="${feedTitle}" title="${feedTitle}" xmlUrl="${feedUrl}" htmlUrl="${siteUrl}"${desc} />`);
    }
    lines.push('    </outline>');
  }

  lines.push('  </body>');
  lines.push('</opml>');

  return lines.join('\n');
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

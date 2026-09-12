import { XMLParser } from 'fast-xml-parser';
import { normalizeDate, formatRelativeTime } from './dateNormalizer.js';
import { decodeHtmlEntities, stripHtml, extractExcerpt, sanitizeHtml } from './htmlUtils.js';

const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  parseTagValue: false, // Keep raw strings to preserve HTML and whitespace
  cdataPropName: '__cdata'
};

/**
 * Extracts string value from a node that might be a plain string, an object with #text, or CDATA.
 */
function getNodeText(node) {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node.__cdata !== undefined) return String(node.__cdata);
  if (node['#text'] !== undefined) return String(node['#text']);
  return '';
}

/**
 * Normalizes an array or single item to always be an array.
 */
function ensureArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/**
 * Parses raw RSS, Atom or RDF XML string into a canonical feed object.
 * @param {string} xmlString 
 * @param {object} [options] 
 * @param {string} [options.feedUrl='']
 * @param {string} [options.defaultCategory='General']
 * @returns {object}
 */
export function parseFeed(xmlString, options = {}) {
  const { feedUrl = '', defaultCategory = 'General' } = options;

  if (!xmlString || typeof xmlString !== 'string' || !xmlString.trim()) {
    throw new Error('Feed XML is empty or invalid');
  }

  let parsed;
  try {
    const parser = new XMLParser(xmlParserOptions);
    parsed = parser.parse(xmlString);
  } catch (err) {
    throw new Error(`Failed to parse XML: ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Feed XML is empty or invalid');
  }

  if (parsed.rss && parsed.rss.channel) {
    return parseRss2(parsed.rss.channel, feedUrl, defaultCategory);
  }

  if (parsed.feed) {
    return parseAtom(parsed.feed, feedUrl, defaultCategory);
  }

  if (parsed['rdf:RDF'] || parsed.RDF) {
    const rdfRoot = parsed['rdf:RDF'] || parsed.RDF;
    return parseRdf(rdfRoot, feedUrl, defaultCategory);
  }

  throw new Error('Unrecognized or unsupported feed format');
}

/**
 * Parse RSS 2.0 channel
 */
function parseRss2(channel, feedUrl, defaultCategory) {
  const title = decodeHtmlEntities(getNodeText(channel.title)) || 'Untitled Feed';
  const siteUrl = getNodeText(channel.link) || '';
  const description = decodeHtmlEntities(getNodeText(channel.description)) || '';
  const rawItems = ensureArray(channel.item);

  const seenIds = new Set();
  const items = [];

  for (const rawItem of rawItems) {
    const itemTitle = decodeHtmlEntities(getNodeText(rawItem.title)) || 'Untitled';
    const link = getNodeText(rawItem.link) || '';
    const guid = getNodeText(rawItem.guid) || link || itemTitle;

    // Deduplication check
    const dedupKey = guid || link;
    if (dedupKey && seenIds.has(dedupKey)) {
      continue;
    }
    if (dedupKey) seenIds.add(dedupKey);

    const rawDescription = getNodeText(rawItem.description);
    const rawContent = getNodeText(rawItem['content:encoded']) || rawDescription;
    const author = getNodeText(rawItem['dc:creator']) || getNodeText(rawItem.author) || 'Unknown';
    const rawCategory = getNodeText(rawItem.category) || defaultCategory;

    const pubDateStr = getNodeText(rawItem.pubDate);
    const dateObj = normalizeDate(pubDateStr);

    items.push({
      id: guid,
      title: itemTitle,
      link,
      excerpt: extractExcerpt(rawDescription || rawContent),
      content: sanitizeHtml(rawContent || rawDescription),
      author: decodeHtmlEntities(author),
      category: decodeHtmlEntities(rawCategory) || defaultCategory,
      pubDate: pubDateStr || dateObj.toUTCString(),
      isoDate: dateObj.toISOString(),
      relativeTime: formatRelativeTime(dateObj)
    });
  }

  return {
    format: 'rss2',
    title,
    siteUrl,
    feedUrl,
    description,
    items
  };
}

/**
 * Parse Atom 1.0 feed
 */
function parseAtom(feed, feedUrl, defaultCategory) {
  const title = decodeHtmlEntities(getNodeText(feed.title)) || 'Untitled Feed';
  const description = decodeHtmlEntities(getNodeText(feed.subtitle)) || '';

  // Atom link can be an object, array, or string
  let siteUrl = '';
  const links = ensureArray(feed.link);
  for (const l of links) {
    if (typeof l === 'object' && l['@_href']) {
      if (l['@_rel'] === 'alternate' || !l['@_rel']) {
        siteUrl = l['@_href'];
        break;
      }
    } else if (typeof l === 'string') {
      siteUrl = l;
      break;
    }
  }

  const rawEntries = ensureArray(feed.entry);
  const seenIds = new Set();
  const items = [];

  for (const entry of rawEntries) {
    const itemTitle = decodeHtmlEntities(getNodeText(entry.title)) || 'Untitled';
    
    // Extract entry link
    let link = '';
    const entryLinks = ensureArray(entry.link);
    for (const el of entryLinks) {
      if (typeof el === 'object' && el['@_href']) {
        if (el['@_rel'] === 'alternate' || !el['@_rel']) {
          link = el['@_href'];
          break;
        }
      } else if (typeof el === 'string') {
        link = el;
        break;
      }
    }

    const id = getNodeText(entry.id) || link || itemTitle;
    if (id && seenIds.has(id)) {
      continue;
    }
    if (id) seenIds.add(id);

    // Summary vs Content
    const summary = getNodeText(entry.summary);
    const content = getNodeText(entry.content) || summary;

    // Author
    let author = 'Unknown';
    if (entry.author) {
      if (typeof entry.author === 'object') {
        author = getNodeText(entry.author.name) || 'Unknown';
      } else if (typeof entry.author === 'string') {
        author = entry.author;
      }
    }

    // Date (published or updated)
    const pubDateStr = getNodeText(entry.published) || getNodeText(entry.updated);
    const dateObj = normalizeDate(pubDateStr);

    // Category
    let category = defaultCategory;
    if (entry.category) {
      const cat = Array.isArray(entry.category) ? entry.category[0] : entry.category;
      if (typeof cat === 'object' && cat['@_term']) {
        category = cat['@_term'];
      } else if (typeof cat === 'string') {
        category = cat;
      }
    }

    items.push({
      id,
      title: itemTitle,
      link,
      excerpt: extractExcerpt(summary || content),
      content: sanitizeHtml(content || summary),
      author: decodeHtmlEntities(author),
      category: decodeHtmlEntities(category) || defaultCategory,
      pubDate: pubDateStr || dateObj.toISOString(),
      isoDate: dateObj.toISOString(),
      relativeTime: formatRelativeTime(dateObj)
    });
  }

  return {
    format: 'atom',
    title,
    siteUrl,
    feedUrl,
    description,
    items
  };
}

/**
 * Parse RSS 1.0 (RDF)
 */
function parseRdf(rdfRoot, feedUrl, defaultCategory) {
  const channel = rdfRoot.channel || {};
  const title = decodeHtmlEntities(getNodeText(channel.title)) || 'Untitled Feed';
  const siteUrl = getNodeText(channel.link) || '';
  const description = decodeHtmlEntities(getNodeText(channel.description)) || '';
  const rawItems = ensureArray(rdfRoot.item);

  const seenIds = new Set();
  const items = [];

  for (const rawItem of rawItems) {
    const itemTitle = decodeHtmlEntities(getNodeText(rawItem.title)) || 'Untitled';
    const link = getNodeText(rawItem.link) || '';
    const guid = rawItem['@_rdf:about'] || link || itemTitle;

    if (guid && seenIds.has(guid)) {
      continue;
    }
    if (guid) seenIds.add(guid);

    const rawDescription = getNodeText(rawItem.description);
    const author = getNodeText(rawItem['dc:creator']) || 'Unknown';
    const pubDateStr = getNodeText(rawItem['dc:date']);
    const dateObj = normalizeDate(pubDateStr);

    items.push({
      id: guid,
      title: itemTitle,
      link,
      excerpt: extractExcerpt(rawDescription),
      content: sanitizeHtml(rawDescription),
      author: decodeHtmlEntities(author),
      category: defaultCategory,
      pubDate: pubDateStr || dateObj.toISOString(),
      isoDate: dateObj.toISOString(),
      relativeTime: formatRelativeTime(dateObj)
    });
  }

  return {
    format: 'rdf',
    title,
    siteUrl,
    feedUrl,
    description,
    items
  };
}

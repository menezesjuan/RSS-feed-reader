import { parseFeed } from '../parser/feedParser.js';
import { CacheService } from './cacheService.js';
import { isSafePublicUrl } from './ssrfProtection.js';

export const DEFAULT_MAX_FEED_SIZE = 5 * 1024 * 1024; // 5 MB

export class FeedFetcher {
  constructor(options = {}) {
    this.cache = options.cache || new CacheService();
    this.timeoutMs = options.timeoutMs || 10000; // 10s timeout per technical-requirements.md
    this.userAgent = options.userAgent || 'Frontpage/1.0 (+https://github.com/menezesjuan/RSS-feed-reader)';
    this.maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_FEED_SIZE;
  }

  /**
   * Fetches an external RSS/Atom feed URL, parses it, and caches the result.
   * @param {string} url 
   * @param {object} [options]
   * @param {string} [options.category='General']
   * @param {boolean} [options.forceRefresh=false]
   * @param {number} [options.maxSizeBytes]
   * @returns {Promise<object>}
   */
  async fetch(url, options = {}) {
    const { category = 'General', forceRefresh = false } = options;
    const maxSizeBytes = options.maxSizeBytes || this.maxSizeBytes;

    // Strict SSRF check before opening any socket connection
    if (!isSafePublicUrl(url)) {
      throw new Error(`Security Exception: Access to '${url}' is restricted (SSRF protection).`);
    }

    const cacheKey = `feed:${url}`;

    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await globalThis.fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if redirect ended up on an internal or private address
      if (response.url && !isSafePublicUrl(response.url)) {
        throw new Error(`Security Exception: Redirect destination '${response.url}' is restricted (SSRF protection).`);
      }

      // Check Content-Length header if present
      const contentLength = parseInt(response.headers?.get?.('content-length') || '0', 10);
      if (contentLength > maxSizeBytes) {
        throw new Error(`Feed exceeds maximum allowable size of ${maxSizeBytes / 1024 / 1024}MB`);
      }

      const xmlText = await response.text();

      // Check raw received string length
      if (xmlText.length > maxSizeBytes) {
        throw new Error(`Feed exceeds maximum allowable size of ${maxSizeBytes / 1024 / 1024}MB`);
      }

      const parsedFeed = parseFeed(xmlText, {
        feedUrl: url,
        defaultCategory: category
      });

      // Cache the parsed result
      this.cache.set(cacheKey, parsedFeed);

      return parsedFeed;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Timeout fetching feed (${this.timeoutMs}ms exceeded): ${url}`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

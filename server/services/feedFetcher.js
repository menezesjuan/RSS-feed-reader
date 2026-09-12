import { parseFeed } from '../parser/feedParser.js';
import { CacheService } from './cacheService.js';

export class FeedFetcher {
  constructor(options = {}) {
    this.cache = options.cache || new CacheService();
    this.timeoutMs = options.timeoutMs || 10000; // 10s timeout per technical-requirements.md
    this.userAgent = options.userAgent || 'Frontpage/1.0 (+https://github.com/menezesjuan/RSS-feed-reader)';
  }

  /**
   * Fetches an external RSS/Atom feed URL, parses it, and caches the result.
   * @param {string} url 
   * @param {object} [options]
   * @param {string} [options.category='General']
   * @param {boolean} [options.forceRefresh=false]
   * @returns {Promise<object>}
   */
  async fetch(url, options = {}) {
    const { category = 'General', forceRefresh = false } = options;
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

      const xmlText = await response.text();
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

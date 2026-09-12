import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FeedFetcher } from './services/feedFetcher.js';
import { CacheService } from './services/cacheService.js';
import { parseOpml, exportOpml } from './parser/opmlParser.js';
import { isSafePublicUrl } from './services/ssrfProtection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Creates and configures the Express application.
 * @param {object} [options]
 * @returns {express.Application}
 */
export function createApp(options = {}) {
  const app = express();
  const cache = options.cache || new CacheService();
  const fetcher = options.fetcher || new FeedFetcher({ cache });

  // Standard HTTP Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parser with 2MB payload cap to prevent memory exhaustion DoS
  app.use(express.json({ limit: '2mb' }));

  // Static files will be served from 'client' and 'data' folders
  app.use(express.static(path.join(rootDir, 'client')));
  app.use('/data', express.static(path.join(rootDir, 'data')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Sample curated feeds for Guest mode & testing
  app.get('/api/feeds/sample', (req, res) => {
    try {
      const sampleFeedsPath = path.join(rootDir, 'data', 'sample-feeds.json');
      const raw = fs.readFileSync(sampleFeedsPath, 'utf-8');
      const data = JSON.parse(raw);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load sample feeds', details: err.message });
    }
  });

  // Fetch and parse an external feed (CORS proxy)
  app.get('/api/feeds/fetch', async (req, res) => {
    const { url, category = 'General', forceRefresh = 'false' } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Missing feed url parameter' });
    }

    if (!isSafePublicUrl(url)) {
      return res.status(400).json({ success: false, error: 'Feed URL is invalid or restricted (SSRF protection)' });
    }

    try {
      const feed = await fetcher.fetch(url, {
        category,
        forceRefresh: forceRefresh === 'true'
      });
      res.json({ success: true, feed });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Validate a feed URL
  app.post('/api/feeds/validate', async (req, res) => {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ valid: false, error: 'URL must not be empty' });
    }

    if (!isSafePublicUrl(url.trim())) {
      return res.status(400).json({ valid: false, error: 'URL is invalid or restricted (SSRF protection)' });
    }

    try {
      const parsed = await fetcher.fetch(url.trim(), { forceRefresh: true });
      res.json({
        valid: true,
        title: parsed.title,
        siteUrl: parsed.siteUrl,
        description: parsed.description,
        format: parsed.format,
        itemCount: parsed.items.length
      });
    } catch (err) {
      res.status(422).json({
        valid: false,
        error: err.message
      });
    }
  });

  // OPML Import
  app.post('/api/opml/import', (req, res) => {
    const { opml } = req.body || {};
    if (!opml || typeof opml !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid opml content' });
    }

    try {
      const result = parseOpml(opml);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(422).json({ success: false, error: err.message });
    }
  });

  // OPML Export
  app.get('/api/opml/export', (req, res) => {
    try {
      const sampleFeedsPath = path.join(rootDir, 'data', 'sample-feeds.json');
      const raw = fs.readFileSync(sampleFeedsPath, 'utf-8');
      const data = JSON.parse(raw);
      const xml = exportOpml(data.categories || [], 'Frontpage Subscriptions');

      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="frontpage-feeds.opml"');
      res.send(xml);
    } catch (err) {
      res.status(500).json({ error: 'Failed to export OPML', details: err.message });
    }
  });

  return app;
}

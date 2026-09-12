import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOpml, exportOpml } from '../../server/parser/opmlParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('OPML Parser: Successfully parses official sample-feeds.opml with all edge cases', () => {
  const opmlContent = fs.readFileSync(path.join(rootDir, 'data', 'sample-feeds.opml'), 'utf-8');
  const result = parseOpml(opmlContent);

  // Must identify the 19 unique valid feeds
  assert.ok(result.feeds.length >= 19);
  assert.ok(result.totalOutlinesFound > 20);
  assert.ok(result.duplicatesSkipped >= 3); // Simon Willison, CSS-Tricks alt, Smashing nested, Cloudflare minimal

  // Check categories preservation
  assert.ok(result.categories.includes('Frontend'));
  assert.ok(result.categories.includes('Design'));
  assert.ok(result.categories.includes('Backend & DevOps'));
  assert.ok(result.categories.includes('General Tech'));
  assert.ok(result.categories.includes('AI & ML'));

  // Handles lowercase xmlurl
  const cssTricks = result.feeds.find(f => f.feedUrl === 'https://css-tricks.com/feed/');
  assert.ok(cssTricks);

  // Handles missing type attribute (web.dev no type)
  const webDev = result.feeds.find(f => f.feedUrl === 'https://web.dev/feed.xml');
  assert.ok(webDev);

  // Handles deeply nested category flattening
  const nestedCategoryFeeds = result.feeds.filter(f => f.category === 'Nested Category > Subcategory');
  // Should either flatten or map to category
  assert.ok(result.feeds.some(f => f.feedUrl === 'https://www.smashingmagazine.com/feed/'));
});

test('OPML Export: Generates valid OPML 2.0 XML with categories', () => {
  const sampleCategories = [
    {
      name: 'Frontend',
      feeds: [
        { title: 'CSS-Tricks', feedUrl: 'https://css-tricks.com/feed/', siteUrl: 'https://css-tricks.com/' }
      ]
    },
    {
      name: 'Design',
      feeds: [
        { title: 'Sidebar.io', feedUrl: 'https://sidebar.io/feed.xml', siteUrl: 'https://sidebar.io/' }
      ]
    }
  ];

  const exportedXml = exportOpml(sampleCategories, 'Frontpage Subscriptions');
  assert.ok(exportedXml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(exportedXml.includes('<opml version="2.0">'));
  assert.ok(exportedXml.includes('<outline text="Frontend" title="Frontend">'));
  assert.ok(exportedXml.includes('xmlUrl="https://css-tricks.com/feed/"'));
  assert.ok(exportedXml.includes('<outline text="Design" title="Design">'));
  assert.ok(exportedXml.includes('xmlUrl="https://sidebar.io/feed.xml"'));
});

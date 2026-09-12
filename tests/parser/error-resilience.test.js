import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from '../../server/parser/feedParser.js';

test('Feed Parser Resilience: Throws friendly error on empty or invalid XML', () => {
  assert.throws(() => {
    parseFeed('');
  }, /Feed XML is empty or invalid/);

  assert.throws(() => {
    parseFeed('<html><body>Not an RSS feed</body></html>');
  }, /Unrecognized or unsupported feed format/);
});

test('Feed Parser Resilience: Handles missing optional item fields gracefully', () => {
  const minimalRss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Minimal Feed</title>
    <link>https://minimal.example.com</link>
    <item>
      <title>Only Title Provided</title>
      <link>https://minimal.example.com/post-1</link>
    </item>
  </channel>
</rss>`;

  const result = parseFeed(minimalRss);
  assert.equal(result.items.length, 1);
  const item = result.items[0];
  assert.equal(item.title, 'Only Title Provided');
  assert.equal(item.excerpt, '');
  assert.equal(item.author, 'Unknown');
  assert.ok(item.isoDate); // Defaults gracefully
  assert.equal(item.category, 'General');
});

test('Feed Parser Resilience: Deduplicates items with identical links or IDs', () => {
  const duplicateItemsRss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Duplicates Feed</title>
    <link>https://example.com</link>
    <item>
      <title>First Version</title>
      <link>https://example.com/item-1</link>
    </item>
    <item>
      <title>Second Version (Updated)</title>
      <link>https://example.com/item-1</link>
    </item>
  </channel>
</rss>`;

  const result = parseFeed(duplicateItemsRss);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].title, 'First Version');
});

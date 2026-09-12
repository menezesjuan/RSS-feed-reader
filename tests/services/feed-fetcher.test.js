import test from 'node:test';
import assert from 'node:assert/strict';
import { FeedFetcher } from '../../server/services/feedFetcher.js';
import { CacheService } from '../../server/services/cacheService.js';

const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mock Blog</title>
    <link>https://mock.com</link>
    <description>Mock Description</description>
    <item>
      <title>Article 1</title>
      <link>https://mock.com/1</link>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
      <description>Excerpt text</description>
    </item>
  </channel>
</rss>`;

test('FeedFetcher: fetches, parses and caches feed successfully', async (t) => {
  const cache = new CacheService();
  const fetcher = new FeedFetcher({ cache });

  // Mock globalThis.fetch
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let callCount = 0;
  globalThis.fetch = async (url) => {
    callCount++;
    return {
      ok: true,
      status: 200,
      headers: new Headers({
        'etag': '"abc-123"',
        'last-modified': 'Mon, 15 Jan 2024 12:00:00 GMT'
      }),
      text: async () => mockRssXml
    };
  };

  const result1 = await fetcher.fetch('https://mock.com/feed.xml', { category: 'Tech' });
  assert.equal(result1.title, 'Mock Blog');
  assert.equal(result1.items.length, 1);
  assert.equal(callCount, 1);

  // Second fetch should hit cache and NOT invoke network fetch
  const result2 = await fetcher.fetch('https://mock.com/feed.xml', { category: 'Tech' });
  assert.equal(result2.title, 'Mock Blog');
  assert.equal(callCount, 1); // No new network call
});

test('FeedFetcher: handles HTTP errors gracefully', async (t) => {
  const cache = new CacheService();
  const fetcher = new FeedFetcher({ cache });

  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    statusText: 'Not Found'
  });

  await assert.rejects(async () => {
    await fetcher.fetch('https://broken.com/feed.xml');
  }, /HTTP 404: Not Found/);
});

test('FeedFetcher: blocks private and loopback URLs (SSRF protection)', async () => {
  const fetcher = new FeedFetcher();

  await assert.rejects(async () => {
    await fetcher.fetch('http://localhost:3000/feed');
  }, /SSRF protection/);

  await assert.rejects(async () => {
    await fetcher.fetch('http://169.254.169.254/metadata');
  }, /SSRF protection/);

  await assert.rejects(async () => {
    await fetcher.fetch('file:///etc/passwd');
  }, /SSRF protection/);
});

test('FeedFetcher: rejects feeds exceeding maximum size limit', async (t) => {
  const fetcher = new FeedFetcher();
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-length': '10485760' }), // 10MB
    text: async () => 'huge'
  });

  await assert.rejects(async () => {
    await fetcher.fetch('https://example.com/huge-feed.xml', { maxSizeBytes: 1024 * 1024 });
  }, /Feed exceeds maximum allowable size/);
});


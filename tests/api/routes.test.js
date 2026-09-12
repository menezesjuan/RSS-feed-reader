import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../server/app.js';

test('API Routes: GET /api/health returns status ok', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.status, 'ok');
  assert.ok(json.timestamp);
});

test('API Routes: GET /api/feeds/sample returns curated sample categories', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/feeds/sample`);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.ok(Array.isArray(json.categories));
  assert.ok(json.categories.length >= 5);
  
  // Verify Frontend category
  const frontend = json.categories.find(c => c.name === 'Frontend');
  assert.ok(frontend);
  assert.ok(frontend.feeds.length > 0);
});

test('API Routes: POST /api/feeds/validate validates empty or invalid URLs', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/feeds/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '' })
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.valid, false);
});

test('API Routes: POST /api/opml/import parses OPML and returns feed list', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const sampleOpml = `<?xml version="1.0"?>
<opml version="2.0">
  <head><title>Test OPML</title></head>
  <body>
    <outline text="Dev">
      <outline type="rss" text="Feed 1" xmlUrl="https://example.com/feed1.xml" />
    </outline>
  </body>
</opml>`;

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/opml/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opml: sampleOpml })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.feeds.length, 1);
  assert.equal(json.feeds[0].feedUrl, 'https://example.com/feed1.xml');
});

test('API Routes: GET /api/opml/export serves downloadable OPML file', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/opml/export`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('xml'));
  assert.ok(res.headers.get('content-disposition').includes('attachment; filename="frontpage-feeds.opml"'));
  
  const text = await res.text();
  assert.ok(text.includes('<opml version="2.0">'));
});

test('API Routes: Sets standard HTTP security headers', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});

test('API Routes: POST /api/feeds/validate blocks SSRF target URLs', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/api/feeds/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' })
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.valid, false);
  assert.ok(json.error.includes('restricted') || json.error.includes('Invalid'));
});


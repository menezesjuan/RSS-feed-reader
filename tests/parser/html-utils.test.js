import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeHtmlEntities, stripHtml, extractExcerpt, sanitizeHtml } from '../../server/parser/htmlUtils.js';

test('HTML Utils: decodeHtmlEntities handles standard and numeric entities', () => {
  const input = 'Design &amp; Code: Tips &#8217;n&#8217; Tricks &mdash; &quot;Frontpage&quot; &lt;v1&gt;';
  const expected = 'Design & Code: Tips ’n’ Tricks — "Frontpage" <v1>';
  assert.equal(decodeHtmlEntities(input), expected);

  // Hexadecimal entity
  assert.equal(decodeHtmlEntities('&#x2F;test&#x2F;'), '/test/');
  
  // Null/undefined input
  assert.equal(decodeHtmlEntities(null), '');
});

test('HTML Utils: stripHtml removes tags and extra whitespace', () => {
  const html = '<p>Hello <strong>World</strong>! <a href="https://example.com">Click here</a></p>';
  assert.equal(stripHtml(html), 'Hello World! Click here');

  const withLineBreaks = '<div>Line 1<br/>Line 2\n\n   <p>Line 3</p></div>';
  assert.equal(stripHtml(withLineBreaks), 'Line 1 Line 2 Line 3');
});

test('HTML Utils: extractExcerpt truncates cleanly at word boundary with ellipsis', () => {
  const text = 'Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy.';
  
  const shortExcerpt = extractExcerpt(text, 60);
  assert.ok(shortExcerpt.length <= 65);
  assert.ok(shortExcerpt.endsWith('...'));
  assert.ok(shortExcerpt.startsWith('Color blindness'));

  // If text is shorter than limit, no truncation needed
  assert.equal(extractExcerpt('Short text', 50), 'Short text');
});

test('HTML Utils: sanitizeHtml strips harmful tags like script, iframe, onload', () => {
  const dirty = '<div>Article content<script>alert("xss")</script><iframe src="evil.com"></iframe><img src="pic.jpg" onerror="alert(1)"/></div>';
  const clean = sanitizeHtml(dirty);
  
  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.includes('alert("xss")'));
  assert.ok(!clean.includes('<iframe'));
  assert.ok(!clean.includes('onerror'));
  assert.ok(clean.includes('Article content'));
  assert.ok(clean.includes('<img src="pic.jpg"'));
});

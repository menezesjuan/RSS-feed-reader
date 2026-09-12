import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from '../../server/parser/feedParser.js';

const sampleAtomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>web.dev</title>
  <subtitle>Building a better web, together.</subtitle>
  <link href="https://web.dev" rel="alternate"/>
  <link href="https://web.dev/feed.xml" rel="self"/>
  <id>https://web.dev/</id>
  <updated>2024-01-20T14:00:00Z</updated>
  <entry>
    <title>The Surprising Truth About CSS Container Queries</title>
    <link href="https://web.dev/css-container-queries/" rel="alternate"/>
    <id>tag:web.dev,2024:css-container-queries</id>
    <published>2024-01-20T10:00:00Z</published>
    <updated>2024-01-20T10:00:00Z</updated>
    <author>
      <name>Una Kravets</name>
    </author>
    <summary>Container queries have been available for a while now, but most developers are still using them like media queries.</summary>
    <content type="html"><![CDATA[<p>Full article on container queries.</p>]]></content>
  </entry>
</feed>`;

test('Atom 1.0 Parser: Parses Atom feed metadata and entry list', () => {
  const result = parseFeed(sampleAtomXml, { defaultCategory: 'Frontend' });

  assert.equal(result.format, 'atom');
  assert.equal(result.title, 'web.dev');
  assert.equal(result.siteUrl, 'https://web.dev');
  assert.equal(result.description, 'Building a better web, together.');
  assert.equal(result.items.length, 1);

  const entry = result.items[0];
  assert.equal(entry.title, 'The Surprising Truth About CSS Container Queries');
  assert.equal(entry.link, 'https://web.dev/css-container-queries/');
  assert.equal(entry.author, 'Una Kravets');
  assert.ok(entry.excerpt.startsWith('Container queries have been available'));
  assert.ok(entry.content.includes('Full article on container queries.'));
  assert.equal(entry.category, 'Frontend');
  assert.equal(entry.isoDate, '2024-01-20T10:00:00.000Z');
  assert.ok(entry.relativeTime);
});

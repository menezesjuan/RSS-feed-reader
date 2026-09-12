import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from '../../server/parser/feedParser.js';

const sampleRss2Xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Smashing Magazine</title>
    <link>https://www.smashingmagazine.com/</link>
    <description>For web designers and developers.</description>
    <language>en</language>
    <lastBuildDate>Mon, 15 Jan 2024 12:00:00 GMT</lastBuildDate>
    <item>
      <title>Practical Guide &amp; Tips For Designing For Colorblind Users</title>
      <link>https://www.smashingmagazine.com/2024/01/colorblind-users-guide/</link>
      <guid isPermaLink="true">https://www.smashingmagazine.com/2024/01/colorblind-users-guide/</guid>
      <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
      <dc:creator><![CDATA[Vitaly Friedman]]></dc:creator>
      <description><![CDATA[<p>Color blindness affects roughly 8% of men and 0.5% of women worldwide.</p>]]></description>
      <content:encoded><![CDATA[<p>Full article content with headings and code.</p>]]></content:encoded>
      <category>Design</category>
    </item>
    <item>
      <title>Quick Tip Without Content Encoded</title>
      <link>https://www.smashingmagazine.com/2024/01/quick-tip/</link>
      <guid>smash-tip-123</guid>
      <pubDate>Mon, 15 Jan 2024 08:00:00 GMT</pubDate>
      <description>Simple plain text description</description>
    </item>
  </channel>
</rss>`;

test('RSS 2.0 Parser: Parses channel metadata and items correctly', () => {
  const result = parseFeed(sampleRss2Xml, { defaultCategory: 'Design' });

  assert.equal(result.format, 'rss2');
  assert.equal(result.title, 'Smashing Magazine');
  assert.equal(result.siteUrl, 'https://www.smashingmagazine.com/');
  assert.equal(result.description, 'For web designers and developers.');
  assert.equal(result.items.length, 2);

  const firstItem = result.items[0];
  // Verify HTML entity decode in title
  assert.equal(firstItem.title, 'Practical Guide & Tips For Designing For Colorblind Users');
  assert.equal(firstItem.link, 'https://www.smashingmagazine.com/2024/01/colorblind-users-guide/');
  assert.equal(firstItem.author, 'Vitaly Friedman');
  assert.equal(firstItem.excerpt, 'Color blindness affects roughly 8% of men and 0.5% of women worldwide.');
  assert.ok(firstItem.content.includes('Full article content with headings'));
  assert.equal(firstItem.category, 'Design');
  assert.equal(firstItem.isoDate, '2024-01-15T10:00:00.000Z');
  assert.ok(firstItem.relativeTime);

  const secondItem = result.items[1];
  assert.equal(secondItem.title, 'Quick Tip Without Content Encoded');
  assert.equal(secondItem.excerpt, 'Simple plain text description');
  assert.equal(secondItem.content, 'Simple plain text description');
});

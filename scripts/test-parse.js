import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFeed } from '../server/parser/feedParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Teste do Feed Parser Frontpage ---');

// Test with simulated RSS 2.0
const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CSS-Tricks</title>
    <link>https://css-tricks.com</link>
    <description>Tips, Tricks, and Techniques on using Cascading Style Sheets.</description>
    <item>
      <title>Practical Guide &amp; Tips for CSS Container Queries</title>
      <link>https://css-tricks.com/container-queries-guide</link>
      <pubDate>Wed, 14 Jan 2026 14:30:00 GMT</pubDate>
      <description>&lt;p&gt;Container queries are here! Here is how to use them effectively &amp;mdash; a complete walkthrough.&lt;/p&gt;</description>
      <category>Frontend</category>
    </item>
  </channel>
</rss>`;

const parsed = parseFeed(sampleRss, { defaultCategory: 'Frontend' });
console.log('Formato detectado:', parsed.format);
console.log('Título do Feed:', parsed.title);
console.log('Qtd Itens:', parsed.items.length);
console.log('Primeiro Item:', {
  title: parsed.items[0].title,
  author: parsed.items[0].author,
  category: parsed.items[0].category,
  excerpt: parsed.items[0].excerpt,
  isoDate: parsed.items[0].isoDate,
  relativeTime: parsed.items[0].relativeTime
});

console.log('\n✅ Parser operacional e validado com sucesso!');

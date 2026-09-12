import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../../client/js/utils/escapeHtml.js';

test('escapeHtml: Escapes &, <, >, ", and \' characters correctly', () => {
  const unsafe = `<script>alert("XSS & 'injection'")</script>`;
  const safe = escapeHtml(unsafe);

  assert.equal(safe, '&lt;script&gt;alert(&quot;XSS &amp; &#39;injection&#39;&quot;)&lt;/script&gt;');
  assert.ok(!safe.includes('<'));
  assert.ok(!safe.includes('>'));
  assert.ok(!safe.includes('"'));
  assert.ok(!safe.includes("'"));
});

test('escapeHtml: Handles null, undefined and numbers gracefully', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(123), '123');
  assert.equal(escapeHtml('Clean text'), 'Clean text');
});

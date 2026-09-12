import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafePublicUrl } from '../../server/services/ssrfProtection.js';

test('SSRF Protection: Rejects invalid or unsupported protocols', () => {
  assert.equal(isSafePublicUrl('file:///etc/passwd'), false);
  assert.equal(isSafePublicUrl('gopher://127.0.0.1:70/'), false);
  assert.equal(isSafePublicUrl('ftp://ftp.example.com/feed.xml'), false);
  assert.equal(isSafePublicUrl('javascript:alert(1)'), false);
  assert.equal(isSafePublicUrl(''), false);
  assert.equal(isSafePublicUrl(null), false);
  assert.equal(isSafePublicUrl(undefined), false);
  assert.equal(isSafePublicUrl('not a valid url'), false);
});

test('SSRF Protection: Rejects localhost and private/internal domain names', () => {
  assert.equal(isSafePublicUrl('http://localhost:3000/feed'), false);
  assert.equal(isSafePublicUrl('https://localhost/api'), false);
  assert.equal(isSafePublicUrl('http://service.localhost/'), false);
  assert.equal(isSafePublicUrl('http://myhost.local/feed'), false);
  assert.equal(isSafePublicUrl('http://internal.service.internal/'), false);
});

test('SSRF Protection: Rejects loopback, private and cloud metadata IPv4 addresses', () => {
  // Loopback (127.0.0.0/8)
  assert.equal(isSafePublicUrl('http://127.0.0.1/feed.xml'), false);
  assert.equal(isSafePublicUrl('http://127.1.2.3:8080/'), false);

  // Link-local / Cloud metadata (169.254.169.254)
  assert.equal(isSafePublicUrl('http://169.254.169.254/latest/meta-data/'), false);
  assert.equal(isSafePublicUrl('http://169.254.1.1/'), false);

  // Private RFC 1918 networks
  assert.equal(isSafePublicUrl('http://10.0.0.1/admin'), false);
  assert.equal(isSafePublicUrl('http://172.16.0.1/feed'), false);
  assert.equal(isSafePublicUrl('http://172.31.255.255/'), false);
  assert.equal(isSafePublicUrl('http://192.168.1.1/router'), false);
  assert.equal(isSafePublicUrl('http://0.0.0.0/'), false);
});

test('SSRF Protection: Rejects IPv6 loopback and private addresses', () => {
  assert.equal(isSafePublicUrl('http://[::1]/feed.xml'), false);
  assert.equal(isSafePublicUrl('http://[fe80::1]/'), false);
  assert.equal(isSafePublicUrl('http://[fc00::1]/'), false);
});

test('SSRF Protection: Allows safe public HTTP/HTTPS URLs', () => {
  assert.equal(isSafePublicUrl('https://css-tricks.com/feed/'), true);
  assert.equal(isSafePublicUrl('http://feeds.feedburner.com/oreilly/radar/atom'), true);
  assert.equal(isSafePublicUrl('https://news.ycombinator.com/rss'), true);
  assert.equal(isSafePublicUrl('https://8.8.8.8/feed.xml'), true); // Public IP
});

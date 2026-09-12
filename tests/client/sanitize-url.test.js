import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeUrl } from '../../client/js/utils/sanitizeUrl.js';

test('sanitizeUrl: Neutralizes javascript: and dangerous pseudo-protocols', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeUrl('JAVASCRIPT:alert("xss")'), '#');
  assert.equal(sanitizeUrl('  javascript:void(0)  '), '#');
  assert.equal(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), '#');
  assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
  assert.equal(sanitizeUrl('file:///etc/passwd'), '#');
});

test('sanitizeUrl: Neutralizes null, undefined, objects and empty values', () => {
  assert.equal(sanitizeUrl(''), '#');
  assert.equal(sanitizeUrl(null), '#');
  assert.equal(sanitizeUrl(undefined), '#');
  assert.equal(sanitizeUrl(123), '#');
});

test('sanitizeUrl: Preserves safe HTTP, HTTPS and relative links', () => {
  assert.equal(sanitizeUrl('https://example.com/article'), 'https://example.com/article');
  assert.equal(sanitizeUrl('http://techblog.org/post?id=10'), 'http://techblog.org/post?id=10');
  assert.equal(sanitizeUrl('./index.html'), './index.html');
  assert.equal(sanitizeUrl('/landing.html'), '/landing.html');
  assert.equal(sanitizeUrl('#top'), '#top');
});

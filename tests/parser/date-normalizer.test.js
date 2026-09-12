import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDate, formatRelativeTime } from '../../server/parser/dateNormalizer.js';

test('Date Normalizer: RFC 822 and RFC 2822 dates', () => {
  const rfcDate = 'Mon, 15 Jan 2024 10:30:00 GMT';
  const normalized = normalizeDate(rfcDate);
  assert.ok(normalized instanceof Date);
  assert.equal(normalized.toISOString(), '2024-01-15T10:30:00.000Z');

  const altRfc = '15 Jan 2024 12:30:00 +0200';
  const normAlt = normalizeDate(altRfc);
  assert.equal(normAlt.toISOString(), '2024-01-15T10:30:00.000Z');
});

test('Date Normalizer: ISO 8601 dates (Atom format)', () => {
  const isoDate = '2024-02-12T15:00:00Z';
  const normalized = normalizeDate(isoDate);
  assert.equal(normalized.toISOString(), '2024-02-12T15:00:00.000Z');

  const isoWithOffset = '2024-02-12T18:00:00+03:00';
  assert.equal(normalizeDate(isoWithOffset).toISOString(), '2024-02-12T15:00:00.000Z');
});

test('Date Normalizer: Missing or invalid date falls back gracefully', () => {
  const nullDate = normalizeDate(null);
  assert.ok(nullDate instanceof Date);

  const invalidDate = normalizeDate('Not a date string');
  assert.ok(invalidDate instanceof Date);
});

test('Date Normalizer: Relative time formatting', () => {
  const now = new Date();
  
  // Just now
  assert.equal(formatRelativeTime(now, now), 'Just now');

  // 10 minutes ago
  const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
  assert.equal(formatRelativeTime(tenMinsAgo, now), '10m ago');

  // 2 hours ago
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  assert.equal(formatRelativeTime(twoHoursAgo, now), '2h ago');

  // 1 day ago
  const oneDayAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  assert.equal(formatRelativeTime(oneDayAgo, now), '1d ago');

  // 5 days ago
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  assert.equal(formatRelativeTime(fiveDaysAgo, now), '5d ago');
});

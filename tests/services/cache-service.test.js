import test from 'node:test';
import assert from 'node:assert/strict';
import { CacheService } from '../../server/services/cacheService.js';

test('CacheService: stores and retrieves values within TTL', () => {
  const cache = new CacheService();
  cache.set('feed-1', { title: 'CSS Tricks' }, 1000);

  assert.equal(cache.has('feed-1'), true);
  const data = cache.get('feed-1');
  assert.deepEqual(data, { title: 'CSS Tricks' });
});

test('CacheService: expires items after TTL', async () => {
  const cache = new CacheService();
  cache.set('feed-short', { title: 'Temporary' }, 50);

  assert.equal(cache.has('feed-short'), true);
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.equal(cache.has('feed-short'), false);
  assert.equal(cache.get('feed-short'), null);
});

test('CacheService: clear and delete functionality', () => {
  const cache = new CacheService();
  cache.set('a', 1);
  cache.set('b', 2);

  cache.delete('a');
  assert.equal(cache.has('a'), false);
  assert.equal(cache.has('b'), true);

  cache.clear();
  assert.equal(cache.has('b'), false);
});

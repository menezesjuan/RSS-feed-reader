import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../../client/js/store.js';

test('Keyboard Navigation: Item selection and cycle next/prev', () => {
  const store = new Store();
  store.setItems([
    { id: '1', title: 'First' },
    { id: '2', title: 'Second' },
    { id: '3', title: 'Third' }
  ]);

  // Open first item
  store.setActiveArticle('1');
  assert.equal(store.state.activeArticleId, '1');
  assert.equal(store.isRead('1'), true);

  // Navigate to second
  store.setActiveArticle('2');
  assert.equal(store.state.activeArticleId, '2');
  assert.equal(store.isRead('2'), true);

  // Close reader
  store.setActiveArticle(null);
  assert.equal(store.state.activeArticleId, null);
});

test('Keyboard Navigation: Toggle read status with key shortcut helper', () => {
  const store = new Store();
  store.setItems([{ id: 'test-1', title: 'Title' }]);

  assert.equal(store.isRead('test-1'), false);
  store.markAsRead('test-1');
  assert.equal(store.isRead('test-1'), true);
  store.markAsUnread('test-1');
  assert.equal(store.isRead('test-1'), false);
});

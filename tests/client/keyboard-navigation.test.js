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

test('Keyboard Navigation: Arrow navigation helper calculates correct indices', () => {
  const store = new Store();
  const items = [
    { id: '1', title: 'First' },
    { id: '2', title: 'Second' },
    { id: '3', title: 'Third' }
  ];
  store.setItems(items);

  // Helper for arrow navigation
  function getNextIndex(currentIndex, direction, max) {
    if (direction === 'ArrowDown') {
      return Math.min(currentIndex + 1, max - 1);
    }
    if (direction === 'ArrowUp') {
      return Math.max(currentIndex - 1, 0);
    }
    return currentIndex;
  }

  assert.equal(getNextIndex(0, 'ArrowDown', items.length), 1);
  assert.equal(getNextIndex(1, 'ArrowDown', items.length), 2);
  assert.equal(getNextIndex(2, 'ArrowDown', items.length), 2); // clamped

  assert.equal(getNextIndex(2, 'ArrowUp', items.length), 1);
  assert.equal(getNextIndex(1, 'ArrowUp', items.length), 0);
  assert.equal(getNextIndex(0, 'ArrowUp', items.length), 0); // clamped
});

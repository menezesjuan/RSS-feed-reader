import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../../client/js/store.js';

test('Store: Initial state and view selection', () => {
  const store = new Store();
  assert.equal(store.state.selectedView, 'all');
  assert.equal(store.state.activeTab, 'feed');
  assert.equal(store.state.layout, 'standard');

  store.selectView('category:Frontend');
  assert.equal(store.state.selectedView, 'category:Frontend');
});

test('Store: Items management and filtering by view', () => {
  const store = new Store();
  const sampleItems = [
    { id: 'item-1', title: 'CSS Article', category: 'Frontend', feedTitle: 'CSS-Tricks', isoDate: '2026-01-10T10:00:00Z' },
    { id: 'item-2', title: 'Figma Tips', category: 'Design', feedTitle: 'Figma Blog', isoDate: '2026-01-11T12:00:00Z' },
    { id: 'item-3', title: 'React Hooks', category: 'Frontend', feedTitle: 'web.dev', isoDate: '2026-01-12T14:00:00Z' }
  ];

  store.setItems(sampleItems);

  // All items
  assert.equal(store.getFilteredItems().length, 3);

  // Filter by Frontend category
  store.selectView('category:Frontend');
  const frontendItems = store.getFilteredItems();
  assert.equal(frontendItems.length, 2);
  assert.equal(frontendItems[0].category, 'Frontend');

  // Filter by feed title
  store.selectView('feed:CSS-Tricks');
  const feedItems = store.getFilteredItems();
  assert.equal(feedItems.length, 1);
  assert.equal(feedItems[0].feedTitle, 'CSS-Tricks');
});

test('Store: Read/Unread tracking and unread counts', () => {
  const store = new Store();
  store.setItems([
    { id: 'item-1', category: 'Frontend' },
    { id: 'item-2', category: 'Frontend' },
    { id: 'item-3', category: 'Design' }
  ]);

  // Initially all 3 are unread
  assert.equal(store.getUnreadCount('all'), 3);
  assert.equal(store.getUnreadCount('category:Frontend'), 2);
  assert.equal(store.getUnreadCount('category:Design'), 1);

  // Mark item-1 as read
  store.markAsRead('item-1');
  assert.equal(store.isRead('item-1'), true);
  assert.equal(store.getUnreadCount('all'), 2);
  assert.equal(store.getUnreadCount('category:Frontend'), 1);

  // Mark all in Frontend as read
  store.markAllAsRead('category:Frontend');
  assert.equal(store.getUnreadCount('category:Frontend'), 0);
  assert.equal(store.getUnreadCount('all'), 1); // Only Design item remains
});

test('Store: Bookmarks tracking', () => {
  const store = new Store();
  store.setItems([
    { id: 'item-1', title: 'Article 1' },
    { id: 'item-2', title: 'Article 2' }
  ]);

  assert.equal(store.isBookmarked('item-1'), false);
  store.toggleBookmark('item-1');
  assert.equal(store.isBookmarked('item-1'), true);

  store.selectView('saved');
  const saved = store.getFilteredItems();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, 'item-1');

  // Toggle off
  store.toggleBookmark('item-1');
  assert.equal(store.isBookmarked('item-1'), false);
  assert.equal(store.getFilteredItems().length, 0);
});

test('Store: Search filtering and sorting', () => {
  const store = new Store();
  store.setItems([
    { id: 'item-1', title: 'Colorblind Guide', excerpt: 'Accessibility in design', isoDate: '2026-01-01T00:00:00Z' },
    { id: 'item-2', title: 'Edge Caching', excerpt: 'Cloudflare latency reduction', isoDate: '2026-01-02T00:00:00Z' }
  ]);

  // Search by keyword in title
  store.setSearchQuery('colorblind');
  let results = store.getFilteredItems();
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'item-1');

  // Search by keyword in excerpt
  store.setSearchQuery('cloudflare');
  results = store.getFilteredItems();
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'item-2');

  // Clear search and test sorting
  store.setSearchQuery('');
  store.setSortBy('newest');
  results = store.getFilteredItems();
  assert.equal(results[0].id, 'item-2'); // More recent

  store.setSortBy('oldest');
  results = store.getFilteredItems();
  assert.equal(results[0].id, 'item-1');
});

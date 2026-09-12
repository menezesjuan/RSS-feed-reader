import { Store } from './store.js';
import { createHeader } from './components/Header.js';
import { createSidebar } from './components/Sidebar.js';
import { createFeedList } from './components/FeedList.js';
import { createDigestView } from './components/DigestView.js';
import { createDiscoverView } from './components/DiscoverView.js';
import { createArticleReader } from './components/ArticleReader.js';
import { createAddFeedModal } from './components/AddFeedModal.js';
import { createKeyboardShortcutsModal } from './components/KeyboardShortcutsModal.js';
import { createAuthModal } from './components/AuthModal.js';
import { generateCuratedDashboardItems } from './seedData.js';

async function initApp() {
  const root = document.getElementById('app');
  if (!root) return;

  const store = new Store();

  // Mount components
  const header = createHeader(store);
  const sidebar = createSidebar(store);
  const feedList = createFeedList(store);
  const digestView = createDigestView(store);
  const discoverView = createDiscoverView(store);
  const articleReader = createArticleReader(store);
  const addFeedModal = createAddFeedModal(store);
  const keyboardShortcutsModal = createKeyboardShortcutsModal();
  const authModal = createAuthModal(store);

  const mainLayout = document.createElement('div');
  mainLayout.className = 'flex flex-1 overflow-hidden relative';
  mainLayout.appendChild(sidebar);
  mainLayout.appendChild(feedList);
  mainLayout.appendChild(digestView);
  mainLayout.appendChild(discoverView);

  root.appendChild(header);
  root.appendChild(mainLayout);
  root.appendChild(articleReader);
  root.appendChild(addFeedModal);
  root.appendChild(keyboardShortcutsModal);
  root.appendChild(authModal);

  // Hook up Add Feed button in header to modal
  header.querySelector('#add-feed-btn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('frontpage:open-add-feed'));
  });

  // Mobile drawer toggle
  header.querySelector('#mobile-menu-btn')?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('absolute');
    sidebar.classList.toggle('shadow-xl');
  });

  // Initial Data Fetch with graceful fallback (Node API -> local sample-feeds.json mock)
  try {
    const res = await fetch('./api/feeds/sample').catch(() => null);
    let data = null;
    if (res?.ok) {
      data = await res.json().catch(() => null);
    } else {
      const fallbackRes = await fetch('../data/sample-feeds.json').catch(() => null)
        || await fetch('./data/sample-feeds.json').catch(() => null);
      if (fallbackRes?.ok) {
        data = await fallbackRes.json().catch(() => null);
      }
    }
    if (data?.categories) {
      store.setCategories(data.categories);
    }
  } catch (err) {
    console.warn('Using local fallback categories:', err);
  }

  // Populate guest items
  const initialItems = generateCuratedDashboardItems();
  store.setItems(initialItems);

  // Keyboard compound shortcuts (g h -> home/all, g s -> saved) and Arrow navigation
  let lastKey = '';
  let keyTimeout = null;

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (e.key === 'g') {
      lastKey = 'g';
      clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => { lastKey = ''; }, 1000);
      return;
    }

    if (lastKey === 'g') {
      if (e.key === 'h') {
        store.selectView('all');
      } else if (e.key === 's') {
        store.selectView('saved');
      }
      lastKey = '';
    } else if (e.key === 'm') {
      // Toggle read on selected
      const activeFocused = document.activeElement?.closest('.feed-item');
      const targetId = activeFocused?.dataset.id;
      if (targetId) {
        if (store.isRead(targetId)) store.markAsUnread(targetId);
        else store.markAsRead(targetId);
      } else {
        const items = store.getFilteredItems();
        if (items.length > 0) {
          const first = items[0];
          if (store.isRead(first.id)) store.markAsUnread(first.id);
          else store.markAsRead(first.id);
        }
      }
    } else if (!store.state.activeArticleId) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const feedItems = Array.from(document.querySelectorAll('.feed-item'));
        if (feedItems.length > 0) {
          e.preventDefault();
          const currentIndex = feedItems.findIndex(el => el === document.activeElement || el.contains(document.activeElement));
          let nextIndex;
          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex >= 0 && currentIndex < feedItems.length - 1) ? currentIndex + 1 : (currentIndex === -1 ? 0 : currentIndex);
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          }
          feedItems[nextIndex]?.focus();
          feedItems[nextIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else if (e.key === 'o') {
        const activeItem = document.activeElement?.closest('.feed-item');
        if (activeItem?.dataset?.id) {
          e.preventDefault();
          store.setActiveArticle(activeItem.dataset.id);
        }
      }
    }
  });

  console.log('✨ Frontpage client inicializado com sucesso.');
}

window.addEventListener('DOMContentLoaded', initApp);

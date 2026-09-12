import { Store } from './store.js';
import { createHeader } from './components/Header.js';
import { createSidebar } from './components/Sidebar.js';
import { createFeedList } from './components/FeedList.js';
import { createArticleReader } from './components/ArticleReader.js';
import { createAddFeedModal } from './components/AddFeedModal.js';
import { generateCuratedDashboardItems } from './seedData.js';

async function initApp() {
  const root = document.getElementById('app');
  if (!root) return;

  const store = new Store();

  // Mount components
  const header = createHeader(store);
  const sidebar = createSidebar(store);
  const feedList = createFeedList(store);
  const articleReader = createArticleReader(store);
  const addFeedModal = createAddFeedModal(store);

  const mainLayout = document.createElement('div');
  mainLayout.className = 'flex flex-1 overflow-hidden relative';
  mainLayout.appendChild(sidebar);
  mainLayout.appendChild(feedList);

  root.appendChild(header);
  root.appendChild(mainLayout);
  root.appendChild(articleReader);
  root.appendChild(addFeedModal);

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

  // Initial Data Fetch
  try {
    const res = await fetch('/api/feeds/sample');
    if (res.ok) {
      const data = await res.json();
      store.setCategories(data.categories || []);
    }
  } catch (err) {
    console.warn('Using local fallback categories:', err);
  }

  // Populate guest items
  const initialItems = generateCuratedDashboardItems();
  store.setItems(initialItems);

  // Keyboard compound shortcuts (g h -> home/all, g s -> saved)
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
      const items = store.getFilteredItems();
      if (items.length > 0) {
        const first = items[0];
        if (store.isRead(first.id)) store.markAsUnread(first.id);
        else store.markAsRead(first.id);
      }
    }
  });

  console.log('✨ Frontpage client inicializado com sucesso.');
}

window.addEventListener('DOMContentLoaded', initApp);

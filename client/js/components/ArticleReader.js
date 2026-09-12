import { CATEGORY_COLORS } from './Sidebar.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function createArticleReader(store) {
  const overlay = document.createElement('div');
  overlay.id = 'article-reader-overlay';
  overlay.className = 'fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end hidden transition-opacity';

  function render() {
    const activeId = store.state.activeArticleId;
    if (!activeId) {
      overlay.classList.add('hidden');
      return;
    }

    const items = store.getFilteredItems();
    const currentIndex = items.findIndex(i => i.id === activeId);
    const item = items[currentIndex] || store.state.items.find(i => i.id === activeId);

    if (!item) {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < items.length - 1;
    const isBookmarked = store.isBookmarked(item.id);
    const catColor = CATEGORY_COLORS[item.category] || '#2563eb';

    const safeTitle = escapeHtml(item.title);
    const safeCategory = escapeHtml(item.category);
    const safeFeedTitle = escapeHtml(item.feedTitle);
    const safeRelativeTime = escapeHtml(item.relativeTime);
    const safeAuthor = escapeHtml(item.author || 'Editorial');
    const safeLink = escapeHtml(item.link || '#');

    overlay.innerHTML = `
      <div class="w-full max-w-2xl bg-[var(--color-surface)] h-full shadow-2xl flex flex-col border-l border-[var(--color-border)] animate-in slide-in-from-right duration-200">
        <!-- Top Reader Bar -->
        <div class="h-14 px-6 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 bg-[var(--color-surface)] select-none">
          <div class="flex items-center gap-2">
            <button id="reader-prev" class="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:pointer-events-none" ${hasPrev ? '' : 'disabled'} title="Previous article (↑)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button id="reader-next" class="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:pointer-events-none" ${hasNext ? '' : 'disabled'} title="Next article (↓)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button id="reader-bookmark" class="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]" title="Toggle Bookmark (s)">
              <svg class="w-4 h-4 ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
            </button>

            <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] rounded-md transition-colors" title="Open in original site">
              <span>Open original</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>

            <button id="reader-close" class="p-1.5 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]" title="Close (Esc)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Article Content -->
        <div class="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
          <div class="space-y-3 pb-6 border-b border-[var(--color-border-subtle)]">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-md" style="background-color: ${catColor}15; color: ${catColor}">
                ${safeCategory}
              </span>
              <span class="text-xs text-[var(--color-text-tertiary)]">·</span>
              <span class="text-xs font-medium text-[var(--color-text-secondary)]">${safeFeedTitle}</span>
              <span class="text-xs text-[var(--color-text-tertiary)]">· ${safeRelativeTime}</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] leading-snug">
              ${safeTitle}
            </h1>

            <div class="text-xs text-[var(--color-text-tertiary)]">
              By <span class="text-[var(--color-text-secondary)] font-medium">${safeAuthor}</span>
            </div>
          </div>

          <!-- Reader Typography (Georgia / Charter serif font for calm reading) -->
          <div class="prose prose-slate max-w-none text-base font-serif leading-loose text-[var(--color-text-secondary)] space-y-4 [&>p]:mb-4 [&>h2]:font-sans [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-[var(--color-text-primary)] [&>h3]:font-sans [&>h3]:text-lg [&>h3]:font-semibold [&>code]:font-mono [&>code]:text-xs [&>code]:bg-[var(--color-bg-tertiary)] [&>code]:p-1 [&>code]:rounded [&>img]:rounded-lg [&>img]:max-w-full [&>a]:text-[var(--color-accent)] [&>a]:underline">
            ${item.content || item.excerpt || '<p>No full content provided in this feed.</p>'}
          </div>
        </div>
      </div>
    `;

    // Bind events
    overlay.querySelector('#reader-close')?.addEventListener('click', () => {
      store.setActiveArticle(null);
    });

    overlay.querySelector('#reader-prev')?.addEventListener('click', () => {
      if (hasPrev) store.setActiveArticle(items[currentIndex - 1].id);
    });

    overlay.querySelector('#reader-next')?.addEventListener('click', () => {
      if (hasNext) store.setActiveArticle(items[currentIndex + 1].id);
    });

    overlay.querySelector('#reader-bookmark')?.addEventListener('click', () => {
      store.toggleBookmark(item.id);
    });

    // Close when clicking overlay backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        store.setActiveArticle(null);
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!store.state.activeArticleId) return;

    if (e.key === 'Escape') {
      store.setActiveArticle(null);
    } else if (e.key === 'ArrowDown') {
      const items = store.getFilteredItems();
      const idx = items.findIndex(i => i.id === store.state.activeArticleId);
      if (idx >= 0 && idx < items.length - 1) {
        e.preventDefault();
        store.setActiveArticle(items[idx + 1].id);
      }
    } else if (e.key === 'ArrowUp') {
      const items = store.getFilteredItems();
      const idx = items.findIndex(i => i.id === store.state.activeArticleId);
      if (idx > 0) {
        e.preventDefault();
        store.setActiveArticle(items[idx - 1].id);
      }
    } else if (e.key === 's') {
      store.toggleBookmark(store.state.activeArticleId);
    }
  });

  store.subscribe(() => render());
  render();

  return overlay;
}

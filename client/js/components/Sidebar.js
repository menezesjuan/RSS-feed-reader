import { escapeHtml } from '../utils/escapeHtml.js';

/**
 * Category color mappings matching the design preview
 */
export const CATEGORY_COLORS = {
  'Frontend': '#2563eb',
  'Design': '#db2777',
  'Backend & DevOps': '#ea580c',
  'General Tech': '#4f46e5',
  'AI & ML': '#9333ea',
  'General': '#64748b'
};

export const FEED_AVATAR_COLORS = {
  'CSS-Tricks': { bg: '#dc2626', char: 'C' },
  'Smashing Magazine': { bg: '#dc2626', char: 'S' },
  'Smashing Mag': { bg: '#dc2626', char: 'S' },
  'Josh W. Comeau': { bg: '#9333ea', char: 'J' },
  'Kent C. Dodds': { bg: '#2563eb', char: 'K' },
  'web.dev': { bg: '#0284c7', char: 'W' },
  'MDN Blog': { bg: '#1e293b', char: 'M' },
  'Sidebar.io': { bg: '#7c3aed', char: 'S' },
  'Nielsen Norman Group': { bg: '#16a34a', char: 'N' },
  'NN Group': { bg: '#16a34a', char: 'N' },
  'Figma Blog': { bg: '#000000', char: 'F' },
  'UX Collective': { bg: '#2563eb', char: 'U' },
  'A List Apart': { bg: '#475569', char: 'A' },
  'Cloudflare Blog': { bg: '#ea580c', char: 'C' },
  'Vercel Blog': { bg: '#000000', char: 'V' },
  'The GitHub Blog': { bg: '#1e293b', char: 'G' },
  'Netlify Blog': { bg: '#0ea5e9', char: 'N' },
  'The Pragmatic Engineer': { bg: '#ca8a04', char: 'P' },
  'Hacker News Best': { bg: '#ff6600', char: 'Y' },
  'Simon Willison\'s Weblog': { bg: '#1e293b', char: 'S' },
  'Hugging Face Blog': { bg: '#eab308', char: 'H' }
};

/**
 * Sidebar Component
 */
export function createSidebar(store) {
  const aside = document.createElement('aside');
  aside.id = 'sidebar';
  aside.className = 'w-65 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col justify-between h-[calc(100vh-3.75rem)] sticky top-15 overflow-y-auto select-none transition-transform duration-200 z-20';

  function render() {
    const unreadAll = store.getUnreadCount('all');
    const unreadSaved = store.state.bookmarkedItemIds.size;
    const selected = store.state.selectedView;
    const categories = store.state.categories || [];

    aside.innerHTML = `
      <div class="p-3 space-y-6">
        <!-- Top Navigation -->
        <div class="space-y-1">
          <button data-view="all" class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === 'all'
              ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
          }">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" rx="2" stroke-width="2"/>
                <path stroke-width="2" d="M3 9h18M9 21V9"/>
              </svg>
              <span>All Items</span>
            </div>
            <span class="text-xs font-semibold ${selected === 'all' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}">${unreadAll}</span>
          </button>

          <button data-view="saved" class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === 'saved'
              ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
          }">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/>
              </svg>
              <span>Saved</span>
            </div>
            <span class="text-xs font-semibold text-[var(--color-text-tertiary)]">${unreadSaved}</span>
          </button>
        </div>

        <!-- Categories Section -->
        <div>
          <div class="px-3 pb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Categories
          </div>

          <div class="space-y-1">
            ${categories.map(cat => {
              const catView = `category:${cat.name}`;
              const isCatActive = selected === catView;
              const catUnread = store.getUnreadCount(catView);
              const dotColor = CATEGORY_COLORS[cat.name] || '#64748b';

              return `
                <div class="category-group">
                  <button data-view="${catView}" class="nav-item w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isCatActive
                      ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                  }">
                    <div class="flex items-center gap-2.5">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dotColor}"></span>
                      <span class="truncate">${escapeHtml(cat.name)}</span>
                    </div>
                    <span data-counter="${catView}" class="text-xs font-medium text-[var(--color-text-tertiary)]">${catUnread}</span>
                  </button>

                  <!-- Feeds in category -->
                  <div class="pl-5 pr-1 py-0.5 space-y-0.5">
                    ${(cat.feeds || []).map(feed => {
                      const feedView = `feed:${feed.title}`;
                      const isFeedActive = selected === feedView;
                      const feedUnread = store.getUnreadCount(feedView);
                      const avatarInfo = FEED_AVATAR_COLORS[feed.title] || { bg: dotColor, char: feed.title.charAt(0) };

                      return `
                        <button data-view="${feedView}" class="nav-item w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
                          isFeedActive
                            ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                        }">
                          <div class="flex items-center gap-2 truncate">
                            <span class="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0" style="background-color: ${avatarInfo.bg}">
                              ${avatarInfo.char}
                            </span>
                            <span class="truncate">${escapeHtml(feed.title)}</span>
                          </div>
                          <span data-counter="${feedView}" class="text-[11px] text-[var(--color-text-tertiary)] shrink-0 ml-1.5">${feedUnread}</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Health status footer with OPML export -->
      <div class="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between text-xs">
        <div class="flex items-center gap-1.5 font-medium text-[var(--color-success)]">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="truncate">All feeds healthy</span>
        </div>
        <a href="/api/opml/export" download="frontpage-feeds.opml" class="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] font-medium text-[11px] px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-tertiary)] shrink-0 transition-colors" title="Export OPML">
          Export
        </a>
      </div>
    `;

    // Bind click events to navigation buttons
    aside.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        store.selectView(btn.dataset.view);
      });
    });
  }

  // Update counts surgically
  function updateCountersDOM() {
    const allCounter = aside.querySelector('[data-view="all"] span:last-child');
    if (allCounter) allCounter.textContent = store.getUnreadCount('all');

    const savedCounter = aside.querySelector('[data-view="saved"] span:last-child');
    if (savedCounter) savedCounter.textContent = store.state.bookmarkedItemIds.size;

    aside.querySelectorAll('[data-counter]').forEach(span => {
      const view = span.dataset.counter;
      span.textContent = store.getUnreadCount(view);
    });
  }

  store.subscribe((state, mutation) => {
    if (mutation && (mutation.type === 'ITEM_STATE_CHANGED' || mutation.type === 'ALL_READ_CHANGED')) {
      updateCountersDOM();
      return;
    }
    render();
  });

  render();

  return aside;
}

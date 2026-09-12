import { CATEGORY_COLORS, FEED_AVATAR_COLORS } from './Sidebar.js';

export function createFeedList(store) {
  const container = document.createElement('main');
  container.id = 'feed-container';
  container.className = 'flex-1 h-[calc(100vh-3.75rem)] overflow-y-auto bg-[var(--color-bg-primary)]';

  function render() {
    if (store.state.activeTab !== 'feed') {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');

    const selected = store.state.selectedView;
    const items = store.getFilteredItems();
    const layout = store.state.layout;
    const unreadCount = store.getUnreadCount(selected);

    // Determine current view title
    let viewTitle = 'All Items';
    if (selected === 'saved') viewTitle = 'Saved';
    else if (selected.startsWith('category:')) viewTitle = selected.replace('category:', '');
    else if (selected.startsWith('feed:')) viewTitle = selected.replace('feed:', '');

    container.innerHTML = `
      <div class="max-w-[var(--container-feed)] mx-auto px-4 sm:px-8 py-6 space-y-5">
        <!-- Feed Top Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border-subtle)]">
          <div class="flex items-baseline gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">${viewTitle}</h1>
            <span class="text-xs font-medium text-[var(--color-text-tertiary)]">${unreadCount} unread</span>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 text-xs">
            <!-- Layout switcher -->
            <div class="flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md p-0.5">
              <button data-layout="compact" class="layout-btn p-1.5 rounded ${layout === 'compact' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}" title="Compact List">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <button data-layout="cards" class="layout-btn p-1.5 rounded ${layout === 'cards' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}" title="Grid Cards">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1" stroke-width="2"/><rect width="7" height="7" x="14" y="3" rx="1" stroke-width="2"/><rect width="7" height="7" x="3" y="14" rx="1" stroke-width="2"/><rect width="7" height="7" x="14" y="14" rx="1" stroke-width="2"/></svg>
              </button>
              <button data-layout="standard" class="layout-btn p-1.5 rounded ${layout === 'standard' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}" title="Standard View">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
              </button>
            </div>

            <!-- Sort toggle -->
            <button id="sort-btn" class="flex items-center gap-1 px-2.5 py-1.5 border border-[var(--color-border)] rounded-md font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9M3 12h5m0 0l3 3m-3-3l3-3"/></svg>
              <span>${store.state.sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>

            <!-- Refresh button -->
            <button id="refresh-btn" class="flex items-center gap-1 px-2.5 py-1.5 border border-[var(--color-border)] rounded-md font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors" title="Refresh Feeds">
              <svg class="w-3 h-3 refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span class="hidden sm:inline">Refresh</span>
            </button>

            <!-- Mark all read -->
            <button id="mark-all-read-btn" class="px-2.5 py-1.5 border border-[var(--color-border)] rounded-md font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Mark all read
            </button>
          </div>
        </div>

        <!-- Banner: New items notification -->
        <div class="bg-[var(--color-accent-subtle)] border border-[var(--color-border-subtle)] rounded-lg py-2.5 px-4 text-xs font-medium text-[var(--color-accent)] text-center cursor-pointer hover:underline flex items-center justify-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
          <span>5 new items since your last visit</span>
        </div>

        <!-- Empty state if no items -->
        ${items.length === 0 ? `
          <div class="py-16 text-center space-y-2">
            <p class="text-base font-semibold text-[var(--color-text-primary)]">No articles found</p>
            <p class="text-xs text-[var(--color-text-secondary)]">Try clearing your search or checking a different category.</p>
          </div>
        ` : ''}

        <!-- Grouping: Today -->
        ${items.length > 0 ? `
          <div class="space-y-4">
            <div class="text-[11px] font-bold tracking-wider text-[var(--color-text-tertiary)] uppercase">
              Today
            </div>

            <div class="${layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-1 divide-y divide-[var(--color-border-subtle)]'}">
              ${items.map(item => {
                const isRead = store.isRead(item.id);
                const isBookmarked = store.isBookmarked(item.id);
                const dotColor = CATEGORY_COLORS[item.category] || '#2563eb';
                const avatarInfo = FEED_AVATAR_COLORS[item.feedTitle] || { bg: dotColor, char: (item.feedTitle || 'F').charAt(0) };

                if (layout === 'compact') {
                  return `
                    <div data-id="${item.id}" class="feed-item group py-2 px-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center justify-between cursor-pointer ${isRead ? 'opacity-70' : ''}">
                      <div class="flex items-center gap-3 truncate">
                        <span class="w-2 h-2 rounded-full shrink-0 ${isRead ? 'bg-transparent' : 'bg-[var(--color-unread)]'}"></span>
                        <span class="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0" style="background-color: ${avatarInfo.bg}">
                          ${avatarInfo.char}
                        </span>
                        <span class="text-xs text-[var(--color-text-secondary)] font-medium shrink-0">${item.feedTitle}</span>
                        <span class="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)]">${item.title}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0 ml-4">
                        <span class="text-xs text-[var(--color-text-tertiary)]">${item.relativeTime}</span>
                        <button data-action="toggle-bookmark" data-id="${item.id}" class="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]" title="Bookmark">
                          <svg class="w-3.5 h-3.5 ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
                        </button>
                      </div>
                    </div>
                  `;
                }

                if (layout === 'cards') {
                  return `
                    <div data-id="${item.id}" class="feed-item group p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] hover:shadow-sm hover:border-[var(--color-border-subtle)] transition-all cursor-pointer flex flex-col justify-between ${isRead ? 'opacity-75' : ''}">
                      <div class="space-y-2">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full shrink-0 ${isRead ? 'bg-transparent' : 'bg-[var(--color-unread)]'}"></span>
                            <span class="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0" style="background-color: ${avatarInfo.bg}">
                              ${avatarInfo.char}
                            </span>
                            <span class="text-xs text-[var(--color-text-secondary)] font-medium">${item.feedTitle}</span>
                            <span class="text-xs text-[var(--color-text-tertiary)]">· ${item.relativeTime}</span>
                          </div>
                          <button data-action="toggle-bookmark" data-id="${item.id}" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]">
                            <svg class="w-3.5 h-3.5 ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
                          </button>
                        </div>
                        <h2 class="text-base font-bold text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-accent)]">${item.title}</h2>
                        <p class="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">${item.excerpt}</p>
                      </div>
                      <div class="pt-3 flex items-center justify-between">
                        <span class="px-2 py-0.5 text-[11px] font-medium rounded-md" style="background-color: ${dotColor}15; color: ${dotColor}">
                          ${item.category}
                        </span>
                      </div>
                    </div>
                  `;
                }

                // Standard Layout (Matching the reference screenshot exactly)
                return `
                  <article data-id="${item.id}" class="feed-item group pt-4 pb-5 flex items-start gap-3.5 cursor-pointer ${isRead ? 'opacity-70' : ''}">
                    <!-- Unread dot -->
                    <div class="pt-1.5 shrink-0">
                      <span class="w-2 h-2 rounded-full block ${isRead ? 'bg-transparent' : 'bg-[var(--color-unread)]'}"></span>
                    </div>

                    <!-- Item Content -->
                    <div class="flex-1 space-y-1.5">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0" style="background-color: ${avatarInfo.bg}">
                            ${avatarInfo.char}
                          </span>
                          <span class="text-xs font-semibold text-[var(--color-text-secondary)]">${item.feedTitle}</span>
                          <span class="text-xs text-[var(--color-text-tertiary)]">· ${item.relativeTime}</span>
                        </div>
                        <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button data-action="toggle-read" data-id="${item.id}" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" title="${isRead ? 'Mark unread' : 'Mark read'}">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                          </button>
                          <button data-action="toggle-bookmark" data-id="${item.id}" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]" title="Bookmark">
                            <svg class="w-3.5 h-3.5 ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
                          </button>
                        </div>
                      </div>

                      <h2 class="text-base sm:text-lg font-bold text-[var(--color-text-primary)] leading-snug tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                        ${item.title}
                      </h2>

                      <p class="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                        ${item.excerpt}
                      </p>

                      <div class="pt-1 flex items-center gap-2">
                        <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md" style="background-color: ${dotColor}18; color: ${dotColor}">
                          ${item.category}
                        </span>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Event handlers
    container.querySelectorAll('.layout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.setLayout(btn.dataset.layout);
      });
    });

    const sortBtn = container.querySelector('#sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        store.setSortBy(store.state.sortBy === 'newest' ? 'oldest' : 'newest');
      });
    }

    const markAllReadBtn = container.querySelector('#mark-all-read-btn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        store.markAllAsRead();
      });
    }

    const refreshBtn = container.querySelector('#refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const icon = refreshBtn.querySelector('.refresh-icon');
        icon.classList.add('animate-spin');
        window.dispatchEvent(new CustomEvent('frontpage:refresh'));
        setTimeout(() => icon.classList.remove('animate-spin'), 600);
      });
    }

    // Article click & action clicks
    container.querySelectorAll('.feed-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const bookmarkBtn = e.target.closest('[data-action="toggle-bookmark"]');
        if (bookmarkBtn) {
          e.stopPropagation();
          store.toggleBookmark(bookmarkBtn.dataset.id);
          return;
        }

        const readBtn = e.target.closest('[data-action="toggle-read"]');
        if (readBtn) {
          e.stopPropagation();
          const id = readBtn.dataset.id;
          if (store.isRead(id)) store.markAsUnread(id);
          else store.markAsRead(id);
          return;
        }

        // Open reader view
        const itemId = el.dataset.id;
        store.setActiveArticle(itemId);
      });
    });
  }

  store.subscribe(() => render());
  render();

  return container;
}

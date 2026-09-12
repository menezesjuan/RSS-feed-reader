import { CATEGORY_COLORS, FEED_AVATAR_COLORS } from './Sidebar.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function createDiscoverView(store) {
  const container = document.createElement('section');
  container.id = 'discover-container';
  container.className = 'flex-1 h-[calc(100vh-3.75rem)] overflow-y-auto bg-[var(--color-bg-primary)] hidden';

  let selectedCategoryFilter = 'All';

  function render() {
    if (store.state.activeTab !== 'discover') {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');

    const categories = store.state.categories || [];
    const filterOptions = ['All', ...categories.map(c => c.name)];

    // Filter feeds
    let displayedCategories = categories;
    if (selectedCategoryFilter !== 'All') {
      displayedCategories = categories.filter(c => c.name === selectedCategoryFilter);
    }

    container.innerHTML = `
      <div class="max-w-[var(--container-feed)] mx-auto px-4 sm:px-8 py-8 space-y-8">
        <!-- Discover Header -->
        <div class="space-y-1">
          <div class="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">Directory</div>
          <h1 class="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Discover Top Feeds</h1>
          <p class="text-sm text-[var(--color-text-secondary)]">Explore actively maintained blogs, publications, and changelogs across technology.</p>
        </div>

        <!-- Filter tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border-subtle)] text-xs font-medium">
          ${filterOptions.map(opt => `
            <button data-cat="${escapeHtml(opt)}" class="discover-filter-btn px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              selectedCategoryFilter === opt
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-bold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
            }">
              ${escapeHtml(opt)}
            </button>
          `).join('')}
        </div>

        <!-- Feeds Grid -->
        <div class="space-y-8">
          ${displayedCategories.map(cat => `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${CATEGORY_COLORS[cat.name] || '#2563eb'}"></span>
                <h3 class="text-base font-bold text-[var(--color-text-primary)]">${escapeHtml(cat.name)}</h3>
                <span class="text-xs text-[var(--color-text-tertiary)]">(${cat.feeds ? cat.feeds.length : 0} sources)</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${(cat.feeds || []).map(feed => {
                  const avatar = FEED_AVATAR_COLORS[feed.title] || { bg: '#2563eb', char: (feed.title || 'F').charAt(0) };
                  const safeTitle = escapeHtml(feed.title);
                  const safeDesc = escapeHtml(feed.description || 'Quality publications and technical essays.');
                  const safeFormat = escapeHtml(feed.format || 'RSS');
                  const safeSiteUrl = escapeHtml(feed.siteUrl || '#');

                  return `
                    <div class="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-start justify-between gap-3 hover:border-[var(--color-border-subtle)] hover:shadow-xs transition-all">
                      <div class="flex items-start gap-3">
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style="background-color: ${avatar.bg}">
                          ${avatar.char}
                        </span>
                        <div class="space-y-1">
                          <h4 class="text-sm font-bold text-[var(--color-text-primary)]">${safeTitle}</h4>
                          <p class="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                            ${safeDesc}
                          </p>
                          <div class="flex items-center gap-2 pt-1">
                            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                              ${safeFormat}
                            </span>
                            <a href="${safeSiteUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-[var(--color-accent)] hover:underline truncate max-w-40">
                              Visit site
                            </a>
                          </div>
                        </div>
                      </div>

                      <button class="px-2.5 py-1 text-xs font-semibold rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-accent)] shrink-0 transition-colors" title="Already subscribed">
                        Subscribed
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind filter buttons
    container.querySelectorAll('.discover-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategoryFilter = btn.dataset.cat;
        render();
      });
    });
  }

  store.subscribe(() => render());
  render();

  return container;
}

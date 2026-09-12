import { CATEGORY_COLORS } from './Sidebar.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export function createDigestView(store) {
  const container = document.createElement('section');
  container.id = 'digest-container';
  container.className = 'flex-1 h-[calc(100vh-3.75rem)] overflow-y-auto bg-[var(--color-bg-primary)] hidden';

  function render() {
    if (store.state.activeTab !== 'digest') {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');

    const items = store.state.items || [];
    const topStory = items[0];
    const highlightedStories = items.slice(1, 5);

    container.innerHTML = `
      <div class="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <!-- Digest Header -->
        <div class="pb-6 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div class="space-y-1">
            <div class="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">Daily Briefing</div>
            <h1 class="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Today's Digest</h1>
            <p class="text-sm text-[var(--color-text-secondary)]">A calm summary of the most important stories across your subscriptions.</p>
          </div>
          <button id="digest-mark-read-btn" class="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors self-start sm:self-auto">
            Mark digest as read
          </button>
        </div>

        ${!topStory ? `
          <div class="py-12 text-center text-sm text-[var(--color-text-tertiary)]">
            No items available for today's digest.
          </div>
        ` : `
          <!-- Lead Story Card -->
          <article data-id="${escapeHtml(topStory.id)}" class="digest-item p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs hover:border-[var(--color-accent)] transition-all cursor-pointer space-y-3 group">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md" style="background-color: ${CATEGORY_COLORS[topStory.category] || '#2563eb'}18; color: ${CATEGORY_COLORS[topStory.category] || '#2563eb'}">
                ${escapeHtml(topStory.category)}
              </span>
              <span class="text-xs text-[var(--color-text-tertiary)]">·</span>
              <span class="text-xs font-medium text-[var(--color-text-secondary)]">${escapeHtml(topStory.feedTitle)}</span>
              <span class="text-xs text-[var(--color-text-tertiary)]">· ~4 min read</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
              ${escapeHtml(topStory.title)}
            </h2>

            <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              ${escapeHtml(topStory.excerpt)}
            </p>

            <div class="pt-2 flex items-center text-xs font-semibold text-[var(--color-accent)] gap-1">
              <span>Read briefing</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </article>

          <!-- Key Highlights -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Curated Highlights</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${highlightedStories.map(story => `
                <article data-id="${escapeHtml(story.id)}" class="digest-item p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-xs hover:border-[var(--color-border-subtle)] transition-all cursor-pointer flex flex-col justify-between space-y-2 group">
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-semibold" style="color: ${CATEGORY_COLORS[story.category] || '#2563eb'}">
                        ${escapeHtml(story.category)}
                      </span>
                      <span class="text-[11px] text-[var(--color-text-tertiary)]">· ${escapeHtml(story.feedTitle)}</span>
                    </div>
                    <h4 class="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug">
                      ${escapeHtml(story.title)}
                    </h4>
                    <p class="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      ${escapeHtml(story.excerpt)}
                    </p>
                  </div>
                  <div class="text-[11px] text-[var(--color-text-tertiary)] pt-2">
                    ${escapeHtml(story.relativeTime)}
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        `}
      </div>
    `;

    // Bind click events
    container.querySelectorAll('.digest-item').forEach(el => {
      el.addEventListener('click', () => {
        store.setActiveArticle(el.dataset.id);
      });
    });

    container.querySelector('#digest-mark-read-btn')?.addEventListener('click', () => {
      if (topStory) store.markAsRead(topStory.id);
      highlightedStories.forEach(s => store.markAsRead(s.id));
      const btn = container.querySelector('#digest-mark-read-btn');
      if (btn) btn.textContent = '✓ Marked as read';
    });
  }

  store.subscribe(() => render());
  render();

  return container;
}

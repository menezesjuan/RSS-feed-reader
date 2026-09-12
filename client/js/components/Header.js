/**
 * Header Component
 */
export function createHeader(store) {
  const header = document.createElement('header');
  header.className = 'h-15 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none';

  header.innerHTML = `
    <div class="flex items-center gap-6">
      <!-- Mobile menu button -->
      <button id="mobile-menu-btn" class="md:hidden p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded hover:bg-[var(--color-bg-tertiary)]" aria-label="Toggle navigation">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <!-- Logo & Brand -->
      <a href="#" class="flex items-center gap-2.5 font-bold text-lg text-[var(--color-text-primary)] tracking-tight hover:opacity-90">
        <div class="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 11a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2zM4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 17a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2z"/>
          </svg>
        </div>
        <span>Frontpage</span>
      </a>

      <!-- Navigation Tabs -->
      <nav class="hidden sm:flex items-center gap-1 ml-2 text-sm font-medium">
        <button data-tab="feed" class="tab-btn px-3 py-1.5 rounded-md transition-colors bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">Feed</button>
        <button data-tab="digest" class="tab-btn px-3 py-1.5 rounded-md transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">Digest</button>
        <button data-tab="discover" class="tab-btn px-3 py-1.5 rounded-md transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">Discover</button>
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <!-- Search bar -->
      <div class="relative w-48 sm:w-64">
        <input 
          id="search-input" 
          type="text" 
          placeholder="Search articles..." 
          class="w-full h-8 pl-8 pr-7 text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] transition-all"
        />
        <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" stroke-width="2"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"/>
        </svg>
        <kbd class="hidden sm:inline-block absolute right-2 top-2 text-[10px] px-1 py-0.5 border border-[var(--color-border)] rounded text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] leading-none">/</kbd>
      </div>

      <!-- Add Feed button -->
      <button id="add-feed-btn" class="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-all" title="Add Feed">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      </button>

      <!-- User avatar -->
      <div class="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-300" title="Guest Session (MS)">
        MS
      </div>
    </div>
  `;

  // Search handling
  const searchInput = header.querySelector('#search-input');
  searchInput.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Global shortcut '/' to focus search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Tab switching
  header.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      store.setActiveTab(tab);
      header.querySelectorAll('.tab-btn').forEach(b => {
        if (b.dataset.tab === tab) {
          b.className = 'tab-btn px-3 py-1.5 rounded-md transition-colors bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]';
        } else {
          b.className = 'tab-btn px-3 py-1.5 rounded-md transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]';
        }
      });
    });
  });

  // User avatar opens auth modal
  const avatar = header.querySelector('.rounded-full');
  if (avatar) {
    avatar.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('frontpage:open-auth'));
    });
  }

  return header;
}

export function createKeyboardShortcutsModal() {
  const modal = document.createElement('div');
  modal.id = 'keyboard-shortcuts-modal';
  modal.className = 'fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center hidden p-4 select-none';

  modal.innerHTML = `
    <div class="w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-2xl border border-[var(--color-border)] p-6 space-y-4 animate-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          <h2 class="text-base font-bold text-[var(--color-text-primary)]">Keyboard Shortcuts</h2>
        </div>
        <button id="shortcuts-close-btn" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <div class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Reading & Navigation</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Next / Previous article</span>
              <div class="flex gap-1"><kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">j</kbd><kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">k</kbd></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Open selected article</span>
              <div class="flex gap-1"><kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">o</kbd><kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">Enter</kbd></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Close reader / dialog</span>
              <kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">Esc</kbd>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-[var(--color-border-subtle)]">
          <div class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Actions</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Toggle bookmark</span>
              <kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">s</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Toggle read / unread</span>
              <kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">m</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Focus search articles</span>
              <kbd class="px-2 py-0.5 border border-[var(--color-border)] rounded font-mono bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">/</kbd>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-[var(--color-border-subtle)]">
          <div class="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Compound Jump</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Go to All Items</span>
              <span class="font-mono text-[var(--color-text-primary)]"><kbd class="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">g</kbd> then <kbd class="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">h</kbd></span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-text-secondary)]">Go to Saved bookmarks</span>
              <span class="font-mono text-[var(--color-text-primary)]"><kbd class="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">g</kbd> then <kbd class="px-1.5 py-0.5 border border-[var(--color-border)] rounded bg-[var(--color-bg-secondary)]">s</kbd></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => modal.classList.add('hidden');
  const open = () => modal.classList.remove('hidden');

  modal.querySelector('#shortcuts-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Global listener for '?'
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === '?') {
      open();
    }
  });

  return modal;
}

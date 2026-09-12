export function createAddFeedModal(store) {
  const modal = document.createElement('div');
  modal.id = 'add-feed-modal';
  modal.className = 'fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center hidden p-4';

  modal.innerHTML = `
    <div class="w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-6 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
        <div class="flex items-center gap-3">
          <button id="tab-add-url" class="text-sm font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)] pb-1">URL</button>
          <button id="tab-import-opml" class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pb-1">Import OPML</button>
        </div>
        <button id="modal-close-btn" class="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- URL Form -->
      <form id="add-feed-form" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Feed URL (RSS or Atom)</label>
          <input 
            id="feed-url-input" 
            type="url" 
            placeholder="https://example.com/feed.xml" 
            required 
            class="w-full h-9 px-3 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Category</label>
          <select id="feed-category-select" class="w-full h-9 px-3 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]">
            <option value="Frontend">Frontend</option>
            <option value="Design">Design</option>
            <option value="Backend & DevOps">Backend & DevOps</option>
            <option value="General Tech">General Tech</option>
            <option value="AI & ML">AI & ML</option>
          </select>
        </div>

        <div id="validation-feedback" class="text-xs hidden p-2.5 rounded-md"></div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" id="modal-cancel-btn" class="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-md">Cancel</button>
          <button type="submit" id="modal-submit-btn" class="px-4 py-2 text-xs font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-md shadow-xs flex items-center gap-1.5">
            <span>Add Feed</span>
          </button>
        </div>
      </form>

      <!-- OPML Form -->
      <div id="opml-import-panel" class="space-y-4 hidden">
        <div>
          <label class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Upload .opml or .xml file</label>
          <input 
            id="opml-file-input" 
            type="file" 
            accept=".opml,.xml"
            class="w-full text-xs text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-bg-tertiary)] file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-border)]"
          />
        </div>
        <div id="opml-feedback" class="text-xs hidden p-2.5 rounded-md"></div>
      </div>
    </div>
  `;

  const close = () => modal.classList.add('hidden');
  const open = () => {
    modal.classList.remove('hidden');
    modal.querySelector('#feed-url-input').value = '';
    modal.querySelector('#validation-feedback').className = 'text-xs hidden p-2.5 rounded-md';
    modal.querySelector('#feed-url-input').focus();
  };

  modal.querySelector('#modal-close-btn').addEventListener('click', close);
  modal.querySelector('#modal-cancel-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const form = modal.querySelector('#add-feed-form');
  const feedback = modal.querySelector('#validation-feedback');
  const submitBtn = modal.querySelector('#modal-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = modal.querySelector('#feed-url-input').value.trim();
    const category = modal.querySelector('#feed-category-select').value;

    feedback.className = 'text-xs block p-2.5 rounded-md bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]';
    feedback.textContent = 'Validating and fetching feed...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`/api/feeds/fetch?url=${encodeURIComponent(url)}&category=${encodeURIComponent(category)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse feed');
      }

      const parsed = data.feed;

      // Add to store
      const newItems = parsed.items.map(item => ({
        ...item,
        feedTitle: parsed.title,
        category
      }));

      store.setItems([...newItems, ...store.state.items]);

      // Add feed to category in store
      const updatedCats = store.state.categories.map(cat => {
        if (cat.name === category) {
          return {
            ...cat,
            feeds: [...(cat.feeds || []), { title: parsed.title, feedUrl: url, siteUrl: parsed.siteUrl }]
          };
        }
        return cat;
      });
      store.setCategories(updatedCats);

      feedback.className = 'text-xs block p-2.5 rounded-md bg-green-50 text-[var(--color-success)]';
      feedback.textContent = `Success! Added "${parsed.title}" with ${parsed.items.length} articles.`;

      setTimeout(() => {
        close();
        submitBtn.disabled = false;
      }, 1000);
    } catch (err) {
      feedback.className = 'text-xs block p-2.5 rounded-md bg-red-50 text-[var(--color-error)]';
      feedback.textContent = `Error: ${err.message}`;
      submitBtn.disabled = false;
    }
  });

  // Tab toggles between URL and OPML
  const tabUrl = modal.querySelector('#tab-add-url');
  const tabOpml = modal.querySelector('#tab-import-opml');
  const urlForm = modal.querySelector('#add-feed-form');
  const opmlPanel = modal.querySelector('#opml-import-panel');

  tabUrl.addEventListener('click', () => {
    tabUrl.className = 'text-sm font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)] pb-1';
    tabOpml.className = 'text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pb-1';
    urlForm.classList.remove('hidden');
    opmlPanel.classList.add('hidden');
  });

  tabOpml.addEventListener('click', () => {
    tabOpml.className = 'text-sm font-bold text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)] pb-1';
    tabUrl.className = 'text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pb-1';
    urlForm.classList.add('hidden');
    opmlPanel.classList.remove('hidden');
  });

  // File reader for OPML
  const fileInput = modal.querySelector('#opml-file-input');
  const opmlFeedback = modal.querySelector('#opml-feedback');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    opmlFeedback.className = 'text-xs block p-2.5 rounded-md bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]';
    opmlFeedback.textContent = `Parsing ${file.name}...`;

    try {
      const text = await file.text();
      const res = await fetch('/api/opml/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opml: text })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse OPML');
      }

      opmlFeedback.className = 'text-xs block p-2.5 rounded-md bg-green-50 text-[var(--color-success)]';
      opmlFeedback.innerHTML = `
        <strong>Imported successfully!</strong><br/>
        • ${data.feeds.length} feeds found<br/>
        • ${data.duplicatesSkipped} duplicates skipped<br/>
        • Categories: ${data.categories.join(', ') || 'None'}
      `;

      // Update store categories and trigger refresh
      setTimeout(() => {
        close();
      }, 2000);
    } catch (err) {
      opmlFeedback.className = 'text-xs block p-2.5 rounded-md bg-red-50 text-[var(--color-error)]';
      opmlFeedback.textContent = `Import failed: ${err.message}`;
    }
  });

  document.addEventListener('frontpage:open-add-feed', open);

  return modal;
}

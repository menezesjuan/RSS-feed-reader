/**
 * Reactive application store for Frontpage client.
 */
export class Store {
  constructor(initialData = {}) {
    this.state = {
      selectedView: 'all', // 'all' | 'saved' | 'category:<name>' | 'feed:<title>'
      activeTab: 'feed', // 'feed' | 'digest' | 'discover'
      layout: 'standard', // 'standard' | 'compact' | 'cards'
      searchQuery: '',
      sortBy: 'newest', // 'newest' | 'oldest'
      categories: initialData.categories || [],
      feeds: initialData.feeds || [],
      items: initialData.items || [],
      readItemIds: new Set(initialData.readItemIds || []),
      bookmarkedItemIds: new Set(initialData.bookmarkedItemIds || []),
      activeArticleId: null,
      lastVisitCount: 5,
      ...initialData
    };

    this.listeners = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const read = localStorage.getItem('frontpage_read_ids');
      if (read) this.state.readItemIds = new Set(JSON.parse(read));

      const bookmarks = localStorage.getItem('frontpage_bookmarks');
      if (bookmarks) this.state.bookmarkedItemIds = new Set(JSON.parse(bookmarks));

      const layout = localStorage.getItem('frontpage_layout');
      if (layout) this.state.layout = layout;
    } catch {
      // Storage unavailable or blocked
    }
  }

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('frontpage_read_ids', JSON.stringify([...this.state.readItemIds]));
      localStorage.setItem('frontpage_bookmarks', JSON.stringify([...this.state.bookmarkedItemIds]));
      localStorage.setItem('frontpage_layout', this.state.layout);
    } catch {
      // Storage unavailable
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveToStorage();
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    }
  }

  setCategories(categories) {
    this.state.categories = categories;
    this.notify();
  }

  setItems(items) {
    this.state.items = items;
    this.notify();
  }

  selectView(view) {
    this.state.selectedView = view;
    this.notify();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    this.notify();
  }

  setLayout(layout) {
    this.state.layout = layout;
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = (query || '').trim().toLowerCase();
    this.notify();
  }

  setSortBy(sortBy) {
    this.state.sortBy = sortBy;
    this.notify();
  }

  setActiveArticle(id) {
    this.state.activeArticleId = id;
    if (id) {
      this.markAsRead(id);
    }
    this.notify();
  }

  isRead(itemId) {
    return this.state.readItemIds.has(itemId);
  }

  markAsRead(itemId) {
    if (!this.state.readItemIds.has(itemId)) {
      this.state.readItemIds.add(itemId);
      this.notify();
    }
  }

  markAsUnread(itemId) {
    if (this.state.readItemIds.has(itemId)) {
      this.state.readItemIds.delete(itemId);
      this.notify();
    }
  }

  markAllAsRead(filter = this.state.selectedView) {
    const itemsToMark = this.getItemsForView(filter);
    for (const item of itemsToMark) {
      this.state.readItemIds.add(item.id);
    }
    this.notify();
  }

  isBookmarked(itemId) {
    return this.state.bookmarkedItemIds.has(itemId);
  }

  toggleBookmark(itemId) {
    if (this.state.bookmarkedItemIds.has(itemId)) {
      this.state.bookmarkedItemIds.delete(itemId);
    } else {
      this.state.bookmarkedItemIds.add(itemId);
    }
    this.notify();
  }

  getItemsForView(view = this.state.selectedView) {
    if (view === 'all') {
      return this.state.items;
    }
    if (view === 'saved') {
      return this.state.items.filter(item => this.state.bookmarkedItemIds.has(item.id));
    }
    if (view.startsWith('category:')) {
      const categoryName = view.replace('category:', '');
      return this.state.items.filter(item => item.category === categoryName);
    }
    if (view.startsWith('feed:')) {
      const feedTitle = view.replace('feed:', '');
      return this.state.items.filter(item => item.feedTitle === feedTitle);
    }
    return this.state.items;
  }

  getFilteredItems() {
    let items = this.getItemsForView(this.state.selectedView);

    if (this.state.searchQuery) {
      const q = this.state.searchQuery;
      items = items.filter(item => {
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q);
        const matchAuthor = (item.author || '').toLowerCase().includes(q);
        return matchTitle || matchExcerpt || matchAuthor;
      });
    }

    // Sort
    return [...items].sort((a, b) => {
      const dateA = new Date(a.isoDate || 0).getTime();
      const dateB = new Date(b.isoDate || 0).getTime();
      return this.state.sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  }

  getUnreadCount(view = 'all') {
    const items = this.getItemsForView(view);
    return items.filter(item => !this.isRead(item.id)).length;
  }
}

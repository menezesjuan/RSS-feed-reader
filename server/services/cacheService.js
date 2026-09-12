/**
 * Simple in-memory cache with TTL support for feed requests.
 */
export class CacheService {
  constructor(defaultTtlMs = 10 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  /**
   * Set a value in cache with an optional specific TTL in milliseconds.
   * @param {string} key 
   * @param {*} value 
   * @param {number} [ttlMs] 
   */
  set(key, value, ttlMs = this.defaultTtlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get value from cache, returns null if missing or expired.
   * @param {string} key 
   * @returns {*}
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Checks whether a valid (unexpired) entry exists in cache.
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Deletes a key from cache.
   * @param {string} key 
   */
  delete(key) {
    return this.store.delete(key);
  }

  /**
   * Clears the entire cache.
   */
  clear() {
    this.store.clear();
  }
}

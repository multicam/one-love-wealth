/**
 * Memory Cache
 * In-memory session cache for fast data access
 * Cleared on page reload
 */

import type { CachedData, CacheStorage } from './types';

/**
 * In-memory cache implementation
 * Uses Map for O(1) access
 */
export class MemoryCache implements CacheStorage {
  private cache: Map<string, CachedData> = new Map();
  private accessOrder: string[] = []; // LRU tracking
  private maxEntries: number;

  // Statistics
  private hits = 0;
  private misses = 0;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get cached data
   * Returns null if expired or not found
   */
  get(key: string): CachedData | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiry
    if (Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Update access order (LRU)
    this.updateAccessOrder(key);
    this.hits++;

    return entry;
  }

  /**
   * Set cached data
   * Evicts oldest entry if max size reached
   */
  set(key: string, data: CachedData): void {
    // Update source
    data.metadata.source = 'memory';

    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, data);
    this.updateAccessOrder(key);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiry
    if (Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size (number of entries)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalSize = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.metadata.size,
      0
    );

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      totalSize,
    };
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    if (this.accessOrder.length === 0) return;

    const oldest = this.accessOrder[0];
    this.delete(oldest);
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove expired entries
   * Call periodically to clean up
   */
  cleanExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.metadata.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }

    return keysToDelete.length;
  }
}

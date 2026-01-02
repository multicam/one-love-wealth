/**
 * Storage Cache
 * localStorage cache with TTL and size limits
 * Persists across page reloads
 */

import { browser } from '$app/environment';
import type { CachedData, CacheStorage } from './types';

const STORAGE_PREFIX = 'btc_'; // Backtest Cache
const INDEX_KEY = 'btc_index'; // Tracks all cache keys

interface StorageIndex {
  keys: string[];
  totalSize: number;
  lastCleanup: number;
}

/**
 * localStorage cache implementation
 * Uses TTL and size-based eviction
 */
export class StorageCache implements CacheStorage {
  private maxBytes: number;
  private autoEvict: boolean;

  // Statistics
  private hits = 0;
  private misses = 0;

  constructor(maxBytes: number = 5 * 1024 * 1024, autoEvict: boolean = true) {
    this.maxBytes = maxBytes;
    this.autoEvict = autoEvict;
  }

  /**
   * Get cached data
   * Returns null if expired, not found, or browser environment unavailable
   */
  get(key: string): CachedData | null {
    if (!browser) return null;

    try {
      const storageKey = this.getStorageKey(key);
      const json = localStorage.getItem(storageKey);

      if (!json) {
        this.misses++;
        return null;
      }

      const entry: CachedData = JSON.parse(json);

      // Check expiry
      if (Date.now() > entry.metadata.expiresAt) {
        this.delete(key);
        this.misses++;
        return null;
      }

      // Update source
      entry.metadata.source = 'storage';
      this.hits++;

      return entry;
    } catch (error) {
      console.error('StorageCache.get error:', error);
      this.misses++;
      return null;
    }
  }

  /**
   * Set cached data
   * Evicts oldest entries if max size would be exceeded
   */
  set(key: string, data: CachedData): void {
    if (!browser) return;

    try {
      // Update source
      data.metadata.source = 'storage';

      const json = JSON.stringify(data);
      const size = new Blob([json]).size;

      // Update size in metadata
      data.metadata.size = size;

      // Check if we need to evict
      if (this.autoEvict) {
        const currentSize = this.getTotalSize();
        if (currentSize + size > this.maxBytes) {
          this.evictUntilFits(size);
        }
      }

      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, json);

      // Update index
      this.updateIndex(key, size);
    } catch (error) {
      // QuotaExceededError or other localStorage errors
      console.error('StorageCache.set error:', error);

      if (this.autoEvict) {
        // Try to make space
        this.evictOldest();
        // Retry once
        try {
          const storageKey = this.getStorageKey(key);
          localStorage.setItem(storageKey, JSON.stringify(data));
          this.updateIndex(key, data.metadata.size);
        } catch (retryError) {
          console.error('StorageCache.set retry failed:', retryError);
        }
      }
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    if (!browser) return false;

    const storageKey = this.getStorageKey(key);
    const json = localStorage.getItem(storageKey);

    if (!json) return false;

    try {
      const entry: CachedData = JSON.parse(json);

      // Check expiry
      if (Date.now() > entry.metadata.expiresAt) {
        this.delete(key);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    if (!browser) return;

    const storageKey = this.getStorageKey(key);
    localStorage.removeItem(storageKey);

    // Update index
    const index = this.getIndex();
    index.keys = index.keys.filter((k) => k !== key);
    this.saveIndex(index);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    if (!browser) return;

    const index = this.getIndex();

    // Remove all cache entries
    for (const key of index.keys) {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    }

    // Clear index
    localStorage.removeItem(INDEX_KEY);

    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    if (!browser) return [];

    const index = this.getIndex();
    return index.keys;
  }

  /**
   * Get cache size (number of entries)
   */
  size(): number {
    if (!browser) return 0;

    const index = this.getIndex();
    return index.keys.length;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalSize = this.getTotalSize();
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      entries: this.size(),
      hits: this.hits,
      misses: this.misses,
      hitRate,
      totalSize,
    };
  }

  /**
   * Get total cache size in bytes
   */
  getTotalSize(): number {
    if (!browser) return 0;

    const index = this.getIndex();
    return index.totalSize;
  }

  /**
   * Remove expired entries
   */
  cleanExpired(): number {
    if (!browser) return 0;

    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const key of this.keys()) {
      const entry = this.get(key);
      if (!entry) {
        // Already expired and deleted
        keysToDelete.push(key);
      }
    }

    // Update cleanup timestamp
    const index = this.getIndex();
    index.lastCleanup = now;
    this.saveIndex(index);

    return keysToDelete.length;
  }

  /**
   * Evict oldest entries until size fits
   */
  private evictUntilFits(neededSize: number): void {
    const currentSize = this.getTotalSize();
    const targetSize = this.maxBytes - neededSize;

    if (currentSize <= targetSize) return;

    // Get all entries with timestamps
    const entries: Array<{ key: string; cachedAt: number; size: number }> = [];

    for (const key of this.keys()) {
      const entry = this.get(key);
      if (entry) {
        entries.push({
          key,
          cachedAt: entry.metadata.cachedAt,
          size: entry.metadata.size,
        });
      }
    }

    // Sort by oldest first
    entries.sort((a, b) => a.cachedAt - b.cachedAt);

    // Evict oldest until we fit
    let evictedSize = 0;
    for (const entry of entries) {
      if (currentSize - evictedSize <= targetSize) break;

      this.delete(entry.key);
      evictedSize += entry.size;
    }
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    const entries: Array<{ key: string; cachedAt: number }> = [];

    for (const key of this.keys()) {
      const entry = this.get(key);
      if (entry) {
        entries.push({
          key,
          cachedAt: entry.metadata.cachedAt,
        });
      }
    }

    if (entries.length === 0) return;

    // Sort by oldest first
    entries.sort((a, b) => a.cachedAt - b.cachedAt);

    // Delete oldest
    this.delete(entries[0].key);
  }

  /**
   * Get storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  /**
   * Get cache index
   */
  private getIndex(): StorageIndex {
    if (!browser) {
      return { keys: [], totalSize: 0, lastCleanup: 0 };
    }

    const json = localStorage.getItem(INDEX_KEY);
    if (!json) {
      return { keys: [], totalSize: 0, lastCleanup: 0 };
    }

    try {
      return JSON.parse(json);
    } catch {
      return { keys: [], totalSize: 0, lastCleanup: 0 };
    }
  }

  /**
   * Save cache index
   */
  private saveIndex(index: StorageIndex): void {
    if (!browser) return;

    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to save cache index:', error);
    }
  }

  /**
   * Update cache index
   */
  private updateIndex(key: string, size: number): void {
    const index = this.getIndex();

    // Remove old entry if exists
    const existingIndex = index.keys.indexOf(key);
    if (existingIndex >= 0) {
      index.keys.splice(existingIndex, 1);
      // Note: We don't track individual sizes in index, recalculate total
    }

    // Add new entry
    index.keys.push(key);

    // Recalculate total size
    index.totalSize = this.calculateTotalSize(index.keys);

    this.saveIndex(index);
  }

  /**
   * Calculate total size from all entries
   */
  private calculateTotalSize(keys: string[]): number {
    let total = 0;

    for (const key of keys) {
      const storageKey = this.getStorageKey(key);
      const json = localStorage.getItem(storageKey);
      if (json) {
        total += new Blob([json]).size;
      }
    }

    return total;
  }
}

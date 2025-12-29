import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';

interface CacheEntry {
  series: DataSeries;
  expiresAt?: number;
}

/**
 * In-memory cache adapter - suitable for short-lived processes or testing
 */
export class MemoryAdapter implements CacheAdapter {
  private cache = new Map<string, CacheEntry>();

  async get(key: string): Promise<DataSeries | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      // Don't delete - keep for getStale()
      return null;
    }

    return entry.series;
  }

  async getStale(key: string): Promise<DataSeries | null> {
    const entry = this.cache.get(key);
    return entry?.series ?? null;
  }

  async set(key: string, series: DataSeries, ttl?: number): Promise<void> {
    this.cache.set(key, {
      series,
      expiresAt: ttl ? Date.now() + ttl : undefined,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) return false;
    return true;
  }
}

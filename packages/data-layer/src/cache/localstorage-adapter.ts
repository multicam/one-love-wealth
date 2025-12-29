import type { CacheAdapter } from './adapter';
import type { DataSeries } from '../types/series';

interface StoredEntry {
  series: DataSeries;
  expiresAt?: number;
}

/**
 * LocalStorage cache adapter - suitable for browser environments with small data
 * Note: localStorage has a ~5MB limit per origin
 */
export class LocalStorageAdapter implements CacheAdapter {
  private prefix: string;

  constructor(prefix = 'data-layer:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private getEntry(key: string): StoredEntry | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as StoredEntry;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<DataSeries | null> {
    const entry = this.getEntry(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      // Don't delete - keep for getStale()
      return null;
    }

    return entry.series;
  }

  async getStale(key: string): Promise<DataSeries | null> {
    const entry = this.getEntry(key);
    return entry?.series ?? null;
  }

  async set(key: string, series: DataSeries, ttl?: number): Promise<void> {
    const entry: StoredEntry = {
      series,
      expiresAt: ttl ? Date.now() + ttl : undefined,
    };

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (e) {
      // localStorage might be full or disabled
      console.warn('LocalStorageAdapter: Failed to write cache entry', e);
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  async has(key: string): Promise<boolean> {
    const entry = this.getEntry(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) return false;
    return true;
  }
}

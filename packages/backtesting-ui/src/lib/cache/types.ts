/**
 * Cache Types
 * Types for data caching system
 */

import type { BacktestData } from '@one-love-wealth/backtesting';
import type { GapAnalysis } from '../utils/gap-analysis';

/**
 * Cached data entry
 */
export interface CachedData {
  /** Backtest data */
  data: BacktestData;
  /** Data statistics */
  stats: {
    totalBars: number;
    droppedBars: number;
    filledGaps: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  /** Gap analysis */
  gapAnalysis: GapAnalysis;
  /** Cache metadata */
  metadata: CacheMetadata;
}

/**
 * Cache metadata
 */
export interface CacheMetadata {
  /** Cache key */
  key: string;
  /** When cached */
  cachedAt: number;
  /** When it expires */
  expiresAt: number;
  /** Time to live (ms) */
  ttl: number;
  /** Data size (bytes) */
  size: number;
  /** Cache source */
  source: 'memory' | 'storage';
}

/**
 * Cache key components
 */
export interface CacheKey {
  /** Symbols (sorted) */
  symbols: string[];
  /** Start date (ISO string) */
  startDate: string;
  /** End date (ISO string) */
  endDate: string;
  /** Interval */
  interval: '1d' | '1wk' | '1mo';
  /** Gap fill strategy */
  gapFillStrategy: 'forward-fill' | 'backward-fill' | 'drop' | 'interpolate';
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Enable in-memory cache (always recommended) */
  enableMemoryCache: boolean;
  /** Enable localStorage cache */
  enableStorageCache: boolean;
  /** TTL for daily data (ms) */
  dailyTTL: number;
  /** TTL for weekly data (ms) */
  weeklyTTL: number;
  /** TTL for monthly data (ms) */
  monthlyTTL: number;
  /** Max memory cache size (entries) */
  maxMemoryEntries: number;
  /** Max storage cache size (bytes) */
  maxStorageBytes: number;
  /** Auto-evict on storage limit */
  autoEvict: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Memory cache stats */
  memory: {
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
    totalSize: number;
  };
  /** Storage cache stats */
  storage: {
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
    totalSize: number;
  };
  /** Combined stats */
  combined: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

/**
 * Cache storage interface
 */
export interface CacheStorage {
  /** Get cached data */
  get(key: string): CachedData | null;
  /** Set cached data */
  set(key: string, data: CachedData): void;
  /** Check if key exists */
  has(key: string): boolean;
  /** Delete cached data */
  delete(key: string): void;
  /** Clear all cached data */
  clear(): void;
  /** Get all keys */
  keys(): string[];
  /** Get cache size */
  size(): number;
}

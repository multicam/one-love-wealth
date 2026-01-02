/**
 * Cache Manager
 * Unified cache manager combining memory and storage caches
 */

import type { BacktestData } from '@one-love-wealth/backtesting';
import type { GapAnalysis } from '../utils/gap-analysis';
import type {
  CachedData,
  CacheKey,
  CacheConfig,
  CacheStats,
  CacheMetadata,
} from './types';
import { MemoryCache } from './memory-cache';
import { StorageCache } from './storage-cache';

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  enableMemoryCache: true,
  enableStorageCache: false, // Opt-in
  dailyTTL: 24 * 60 * 60 * 1000, // 24 hours
  weeklyTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  monthlyTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxMemoryEntries: 50,
  maxStorageBytes: 5 * 1024 * 1024, // 5MB
  autoEvict: true,
};

/**
 * Cache Manager
 * Manages both memory and storage caches
 * Memory cache checked first, then storage cache
 */
export class CacheManager {
  private memoryCache: MemoryCache;
  private storageCache: StorageCache;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.memoryCache = new MemoryCache(this.config.maxMemoryEntries);
    this.storageCache = new StorageCache(
      this.config.maxStorageBytes,
      this.config.autoEvict
    );

    // Schedule periodic cleanup
    this.scheduleCleanup();
  }

  /**
   * Get cached data
   * Checks memory first, then storage
   * Promotes storage hits to memory
   */
  async get(key: CacheKey): Promise<CachedData | null> {
    const keyStr = this.serializeKey(key);

    // Try memory cache first
    if (this.config.enableMemoryCache) {
      const memoryData = this.memoryCache.get(keyStr);
      if (memoryData) {
        return memoryData;
      }
    }

    // Try storage cache
    if (this.config.enableStorageCache) {
      const storageData = this.storageCache.get(keyStr);
      if (storageData) {
        // Promote to memory cache
        if (this.config.enableMemoryCache) {
          this.memoryCache.set(keyStr, storageData);
        }
        return storageData;
      }
    }

    return null;
  }

  /**
   * Set cached data
   * Stores in both memory and storage (if enabled)
   */
  set(
    key: CacheKey,
    data: BacktestData,
    stats: CachedData['stats'],
    gapAnalysis: GapAnalysis
  ): void {
    const keyStr = this.serializeKey(key);
    const ttl = this.getTTL(key.interval);
    const now = Date.now();

    // Calculate size (rough estimate)
    const size = this.estimateSize(data);

    const metadata: CacheMetadata = {
      key: keyStr,
      cachedAt: now,
      expiresAt: now + ttl,
      ttl,
      size,
      source: 'memory',
    };

    const cachedData: CachedData = {
      data,
      stats,
      gapAnalysis,
      metadata,
    };

    // Store in memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.set(keyStr, cachedData);
    }

    // Store in storage cache
    if (this.config.enableStorageCache) {
      this.storageCache.set(keyStr, cachedData);
    }
  }

  /**
   * Check if data is cached
   */
  has(key: CacheKey): boolean {
    const keyStr = this.serializeKey(key);

    if (this.config.enableMemoryCache && this.memoryCache.has(keyStr)) {
      return true;
    }

    if (this.config.enableStorageCache && this.storageCache.has(keyStr)) {
      return true;
    }

    return false;
  }

  /**
   * Delete cached data
   */
  delete(key: CacheKey): void {
    const keyStr = this.serializeKey(key);

    if (this.config.enableMemoryCache) {
      this.memoryCache.delete(keyStr);
    }

    if (this.config.enableStorageCache) {
      this.storageCache.delete(keyStr);
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    if (this.config.enableMemoryCache) {
      this.memoryCache.clear();
    }

    if (this.config.enableStorageCache) {
      this.storageCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const memoryStats = this.memoryCache.getStats();
    const storageStats = this.storageCache.getStats();

    return {
      memory: memoryStats,
      storage: storageStats,
      combined: {
        hits: memoryStats.hits + storageStats.hits,
        misses: memoryStats.misses + storageStats.misses,
        hitRate:
          memoryStats.hits + storageStats.hits > 0
            ? (memoryStats.hits + storageStats.hits) /
              (memoryStats.hits +
                storageStats.hits +
                memoryStats.misses +
                storageStats.misses)
            : 0,
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // If storage cache disabled, clear it
    if (!this.config.enableStorageCache) {
      this.storageCache.clear();
    }
  }

  /**
   * Clean expired entries from both caches
   */
  cleanExpired(): { memory: number; storage: number } {
    const memoryCleanedCount = this.config.enableMemoryCache
      ? this.memoryCache.cleanExpired()
      : 0;

    const storageCleanedCount = this.config.enableStorageCache
      ? this.storageCache.cleanExpired()
      : 0;

    return {
      memory: memoryCleanedCount,
      storage: storageCleanedCount,
    };
  }

  /**
   * Serialize cache key to string
   */
  private serializeKey(key: CacheKey): string {
    // Sort symbols for consistent keys
    const sortedSymbols = [...key.symbols].sort().join(',');

    return `${sortedSymbols}|${key.startDate}|${key.endDate}|${key.interval}|${key.gapFillStrategy}`;
  }

  /**
   * Get TTL based on interval
   */
  private getTTL(interval: '1d' | '1wk' | '1mo'): number {
    switch (interval) {
      case '1d':
        return this.config.dailyTTL;
      case '1wk':
        return this.config.weeklyTTL;
      case '1mo':
        return this.config.monthlyTTL;
      default:
        return this.config.dailyTTL;
    }
  }

  /**
   * Estimate data size in bytes
   */
  private estimateSize(data: BacktestData): number {
    // Rough estimate: each bar is ~50 bytes JSON
    const barsSize = data.bars.length * 50;

    // Add overhead for metadata
    const overhead = 500;

    return barsSize + overhead;
  }

  /**
   * Schedule periodic cleanup
   * Runs every hour to remove expired entries
   */
  private scheduleCleanup(): void {
    // Clean up expired entries every hour
    setInterval(
      () => {
        this.cleanExpired();
      },
      60 * 60 * 1000
    ); // 1 hour
  }
}

/**
 * Global cache manager instance
 */
let cacheManagerInstance: CacheManager | null = null;

/**
 * Get global cache manager
 * Creates instance on first call
 */
export function getCacheManager(config?: Partial<CacheConfig>): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager(config);
  } else if (config) {
    cacheManagerInstance.updateConfig(config);
  }

  return cacheManagerInstance;
}

/**
 * Reset cache manager (for testing)
 */
export function resetCacheManager(): void {
  if (cacheManagerInstance) {
    cacheManagerInstance.clear();
  }
  cacheManagerInstance = null;
}

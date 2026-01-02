/**
 * Cache Module
 * Exports all caching utilities
 */

// Types
export type {
  CachedData,
  CacheMetadata,
  CacheKey,
  CacheConfig,
  CacheStats,
  CacheStorage,
} from './types';

// Implementations
export { MemoryCache } from './memory-cache';
export { StorageCache } from './storage-cache';

// Manager (main API)
export { CacheManager, getCacheManager, resetCacheManager } from './manager';

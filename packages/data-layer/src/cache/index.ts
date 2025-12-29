export type { CacheAdapter, CacheConfig } from './adapter';
export { frequencyToTTL } from './adapter';

export type { CacheKeyComponents } from './key-builder';
export { buildCacheKey } from './key-builder';

export { MemoryAdapter } from './memory-adapter';

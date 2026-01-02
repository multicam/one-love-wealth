## Cache System

Hybrid caching system with in-memory session cache and optional persistent localStorage cache.

## Architecture

### Two-Tier Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│  Application                                            │
│  - Data Service checks cache before fetching            │
│  - Cache Manager orchestrates both caches              │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   Cache Manager       │
        │  - Checks memory first │
        │  - Falls back to storage│
        │  - Promotes hits to memory│
        └───────────┬───────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐    ┌─────────▼──────────┐
│  Memory Cache  │    │  Storage Cache     │
│  (In-Memory)   │    │  (localStorage)    │
├────────────────┤    ├────────────────────┤
│ ✅ Always active│    │ 🔧 Opt-in         │
│ ✅ Fast (O(1))  │    │ ✅ Persistent     │
│ ✅ LRU eviction │    │ ✅ TTL-based      │
│ ❌ Lost on reload│   │ ✅ Size-aware     │
│ Max: 50 entries│    │ Max: 5MB          │
└────────────────┘    └────────────────────┘
```

### Data Flow

**First Load (Cache Miss):**
```
User requests SPY 5yr data
      ↓
Cache Manager.get(cacheKey)
      ↓
Memory Cache: MISS
      ↓
Storage Cache: MISS
      ↓
Fetch from Yahoo Finance (2-5 seconds)
      ↓
Cache Manager.set(cacheKey, data)
      ↓
Store in Memory Cache
Store in Storage Cache (if enabled)
      ↓
Return data to user
```

**Subsequent Load (Cache Hit):**
```
User requests SPY 5yr data again
      ↓
Cache Manager.get(cacheKey)
      ↓
Memory Cache: HIT (instant)
      ↓
Return cached data (<1ms)
```

**After Page Reload (Storage Cache Hit):**
```
User reloads page, requests SPY 5yr data
      ↓
Cache Manager.get(cacheKey)
      ↓
Memory Cache: MISS (cleared on reload)
      ↓
Storage Cache: HIT (persisted)
      ↓
Promote to Memory Cache
      ↓
Return cached data (~5ms)
```

## Configuration

### Default Settings

```typescript
{
  // Memory cache (always recommended)
  enableMemoryCache: true,
  maxMemoryEntries: 50,

  // Storage cache (opt-in for persistence)
  enableStorageCache: false,
  maxStorageBytes: 5 * 1024 * 1024, // 5MB

  // TTL by data interval
  dailyTTL: 24 * 60 * 60 * 1000,    // 24 hours
  weeklyTTL: 7 * 24 * 60 * 60 * 1000,  // 7 days
  monthlyTTL: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Auto-evict when storage full
  autoEvict: true,
}
```

### Updating Configuration

```typescript
import { getCacheManager } from '$lib/cache';

// Enable persistent cache
const cacheManager = getCacheManager({
  enableStorageCache: true,
});

// Or update later
cacheManager.updateConfig({
  enableStorageCache: true,
  maxStorageBytes: 10 * 1024 * 1024, // 10MB
});
```

## Usage

### Automatic (via Data Service)

The cache is integrated into the data service - you don't need to interact with it directly:

```typescript
import { loadStrategyData } from '$lib/services/data';

// First call: fetches from API (2-5 seconds)
const result1 = await loadStrategyData(strategy, params, { years: 5 });

// Second call: returns from memory cache (<1ms)
const result2 = await loadStrategyData(strategy, params, { years: 5 });
```

### Manual Cache Control

```typescript
import { clearDataCache, getCacheStats } from '$lib/services/data';

// Clear cache (force fresh fetch)
clearDataCache();

// Get cache statistics
const stats = getCacheStats();
console.log(`Hit rate: ${(stats.combined.hitRate * 100).toFixed(1)}%`);
console.log(`Memory: ${stats.memory.entries} entries, ${stats.memory.totalSize} bytes`);
console.log(`Storage: ${stats.storage.entries} entries, ${stats.storage.totalSize} bytes`);
```

### Direct Cache Manager Usage

```typescript
import { getCacheManager } from '$lib/cache';
import type { CacheKey } from '$lib/cache';

const cacheManager = getCacheManager();

// Build cache key
const key: CacheKey = {
  symbols: ['SPY', 'QQQ'],
  startDate: '2019-01-01T00:00:00.000Z',
  endDate: '2024-01-01T00:00:00.000Z',
  interval: '1d',
  gapFillStrategy: 'forward-fill',
};

// Check if cached
if (cacheManager.has(key)) {
  const data = await cacheManager.get(key);
  // Use cached data
}

// Store data
cacheManager.set(key, backtestData, stats, gapAnalysis);

// Delete specific cache entry
cacheManager.delete(key);

// Clear all caches
cacheManager.clear();
```

## Cache Keys

Cache keys are built from:
- **Symbols** (sorted alphabetically for consistency)
- **Start date** (ISO string)
- **End date** (ISO string)
- **Interval** ('1d', '1wk', '1mo')
- **Gap fill strategy** ('forward-fill', 'backward-fill', 'drop')

Example serialized key:
```
SPY,QQQ|2019-01-01T00:00:00.000Z|2024-01-01T00:00:00.000Z|1d|forward-fill
```

This ensures:
- Different symbol orders (SPY,QQQ vs QQQ,SPY) map to same cache entry
- Same date range but different interval = different cache entry
- Same symbols but different gap fill strategy = different cache entry

## TTL (Time To Live)

Data expires based on interval:

| Interval | TTL | Reason |
|----------|-----|--------|
| Daily (`1d`) | 24 hours | New bar added daily |
| Weekly (`1wk`) | 7 days | New bar added weekly |
| Monthly (`1mo`) | 30 days | New bar added monthly |

After expiry, data is automatically fetched fresh and re-cached.

## Eviction Strategies

### Memory Cache (LRU)

- **Least Recently Used** eviction
- Max 50 entries by default
- When full, oldest entry is removed
- Access updates recency (promotes frequently used data)

### Storage Cache (Size-Based)

- **Oldest First** eviction by cached timestamp
- Max 5MB by default
- When approaching limit, oldest entries removed
- Tracks total size across all entries

### Manual Cleanup

```typescript
const cacheManager = getCacheManager();

// Remove expired entries (runs automatically every hour)
const cleaned = cacheManager.cleanExpired();
console.log(`Cleaned ${cleaned.memory} memory + ${cleaned.storage} storage entries`);
```

## Cache Statistics

### Viewing Stats

```typescript
import { getCacheStats } from '$lib/services/data';

const stats = getCacheStats();

console.log('Memory Cache:');
console.log(`  Entries: ${stats.memory.entries}`);
console.log(`  Hits: ${stats.memory.hits}`);
console.log(`  Misses: ${stats.memory.misses}`);
console.log(`  Hit Rate: ${(stats.memory.hitRate * 100).toFixed(1)}%`);
console.log(`  Size: ${(stats.memory.totalSize / 1024).toFixed(2)} KB`);

console.log('Storage Cache:');
console.log(`  Entries: ${stats.storage.entries}`);
console.log(`  Hits: ${stats.storage.hits}`);
console.log(`  Misses: ${stats.storage.misses}`);
console.log(`  Hit Rate: ${(stats.storage.hitRate * 100).toFixed(1)}%`);
console.log(`  Size: ${(stats.storage.totalSize / 1024).toFixed(2)} KB`);

console.log('Combined:');
console.log(`  Hit Rate: ${(stats.combined.hitRate * 100).toFixed(1)}%`);
```

### UI Component Example

```svelte
<script lang="ts">
  import { getCacheStats } from '$lib/services/data';
  import { Button } from '@one-love-wealth/shared-ui';

  let stats = $state(getCacheStats());

  function refresh() {
    stats = getCacheStats();
  }
</script>

<div class="p-4 bg-surface-light rounded">
  <h3 class="font-semibold mb-2">Cache Statistics</h3>

  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p class="text-text-secondary">Memory Hit Rate</p>
      <p class="text-lg font-semibold">
        {(stats.memory.hitRate * 100).toFixed(1)}%
      </p>
    </div>

    <div>
      <p class="text-text-secondary">Storage Hit Rate</p>
      <p class="text-lg font-semibold">
        {(stats.storage.hitRate * 100).toFixed(1)}%
      </p>
    </div>
  </div>

  <Button onclick={refresh} size="sm" class="mt-3">
    {#snippet children()}Refresh{/snippet}
  </Button>
</div>
```

## Performance Impact

### Without Caching

```
First load: 2-5 seconds (API fetch)
Second load: 2-5 seconds (API fetch again)
After reload: 2-5 seconds (API fetch again)
```

### With Memory Cache Only

```
First load: 2-5 seconds (API fetch)
Second load: <1ms (memory cache hit)
After reload: 2-5 seconds (cache cleared, API fetch)
```

### With Memory + Storage Cache

```
First load: 2-5 seconds (API fetch)
Second load: <1ms (memory cache hit)
After reload: ~5ms (storage cache hit, promoted to memory)
Subsequent: <1ms (memory cache hit)
```

### Storage Size Estimates

| Data | Bars | Size | Notes |
|------|------|------|-------|
| SPY 1yr daily | ~250 | ~13KB | Single symbol |
| SPY 5yr daily | ~1,250 | ~63KB | Single symbol |
| SPY 20yr daily | ~5,000 | ~250KB | Single symbol |
| SPY+QQQ 5yr | ~1,250 | ~100KB | Multi-symbol |
| VIX Hedge 5yr | ~1,250 | ~100KB | 2 symbols |

With 5MB limit:
- ~50 single-symbol 5yr datasets
- ~20 twenty-year datasets
- ~80 one-year datasets

## Troubleshooting

### Cache Not Working

```typescript
import { getCacheManager } from '$lib/cache';

const manager = getCacheManager();
const stats = manager.getStats();

// Check if cache is enabled
console.log('Memory enabled:', manager['config'].enableMemoryCache);
console.log('Storage enabled:', manager['config'].enableStorageCache);

// Check for hits
console.log('Total hits:', stats.combined.hits);
console.log('Total misses:', stats.combined.misses);
```

### localStorage Full

```typescript
// Check storage size
const stats = getCacheStats();
const usedMB = (stats.storage.totalSize / (1024 * 1024)).toFixed(2);
console.log(`Using ${usedMB} MB of storage`);

// Clear storage cache if needed
import { clearDataCache } from '$lib/services/data';
clearDataCache();

// Or increase limit
cacheManager.updateConfig({
  maxStorageBytes: 10 * 1024 * 1024, // 10MB
});
```

### Stale Data

Data is automatically invalidated after TTL expires. To force fresh data:

```typescript
import { clearDataCache } from '$lib/services/data';

// Clear all cached data
clearDataCache();

// Then reload
const result = await loadStrategyData(strategy, params, config);
```

## Best Practices

1. **Always enable memory cache** - It's fast and has no downsides
2. **Enable storage cache for power users** - Let users opt-in via settings
3. **Monitor cache hit rate** - Aim for >80% hit rate for good UX
4. **Set appropriate TTLs** - Balance freshness vs speed
5. **Clear cache on errors** - If API errors occur, clear cache and retry
6. **Show cache status in dev tools** - Help debugging with stats display

## Future Enhancements

- **IndexedDB support** for larger storage (50MB+)
- **Compression** (gzip) for storage entries
- **Partial data updates** (fetch only new bars)
- **Background refresh** (prefetch before expiry)
- **Cache warming** (preload popular symbols)
- **Smart TTL** (shorter TTL during market hours)
- **Service Worker caching** for offline support

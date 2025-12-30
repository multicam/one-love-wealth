# Data Layer Storage System

Comprehensive guide to the dual-storage architecture with IndexedDB (client) and SQLite (server) synchronization.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [SQLite Storage](#sqlite-storage)
4. [IndexedDB Storage](#indexeddb-storage)
5. [Sync Service](#sync-service)
6. [API Usage](#api-usage)
7. [Best Practices](#best-practices)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The data layer uses a **dual-storage architecture**:

- **Client-side**: IndexedDB for browser storage (50MB+ capacity)
- **Server-side**: SQLite for persistent server storage (unlimited capacity)
- **Synchronization**: Bidirectional sync with conflict resolution

### Benefits

| Feature | IndexedDB | SQLite | Sync |
|---------|-----------|--------|------|
| **Offline Access** | ✅ Full | ❌ N/A | ✅ Enables offline |
| **Capacity** | ~50MB | Unlimited | - |
| **Query Performance** | Fast | Very Fast | - |
| **Persistence** | Browser | Server | ✅ Persistent |
| **Conflict Resolution** | - | - | ✅ Configurable |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                      │
├─────────────────────────────────────────────────────────┤
│                   Provider Registry                       │
│              (FRED, Yahoo, CoinGecko, etc.)              │
├──────────────────┬────────────────────┬─────────────────┤
│                  │                    │                  │
│  IndexedDBAdapter│   SyncService     │  SQLiteAdapter  │
│  (Client Cache)  │  (Bidirectional)  │  (Server Store) │
│                  │                    │                  │
├──────────────────┴────────────────────┴─────────────────┤
│                  CacheAdapter Interface                   │
└─────────────────────────────────────────────────────────┘
```

### Flow

1. **Fetch**: Provider → Cache check → API call (if needed) → Cache set
2. **Sync**: Client ↔ Sync Service ↔ Server
3. **Refresh**: Force refetch → Update both storages

---

## SQLite Storage

Server-side persistent storage using Bun's native `bun:sqlite`.

### Features

- **ACID transactions** for data integrity
- **Efficient indexing** on source, timestamps, expiration
- **Batch operations** for bulk inserts/deletes
- **Query capabilities** with filtering, sorting, pagination
- **Statistics** tracking (total series, data points, by source)

### Schema

```sql
CREATE TABLE series (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  last_updated INTEGER NOT NULL,
  data TEXT NOT NULL,  -- JSON array of DataPoint
  meta TEXT,            -- JSON metadata
  expires_at INTEGER,   -- Unix timestamp in ms
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Indices
CREATE INDEX idx_series_source ON series(source);
CREATE INDEX idx_series_last_updated ON series(last_updated);
CREATE INDEX idx_series_updated_at ON series(updated_at);
CREATE INDEX idx_series_expires_at ON series(expires_at);
```

### Basic Usage

```typescript
import { SQLiteAdapter } from '@one-love-wealth/data-layer/storage';

// Initialize
const storage = new SQLiteAdapter('data-cache.sqlite');

// Set data
await storage.set('fred-m2', series, 24 * 60 * 60 * 1000); // 24h TTL

// Get data
const series = await storage.get('fred-m2');

// List all
const allSeries = await storage.list();

// Filter by source
const fredSeries = await storage.list({ source: 'FRED', limit: 10 });

// Get statistics
const stats = await storage.getStats();
console.log(`Total series: ${stats.totalSeries}`);
console.log(`Total data points: ${stats.totalDataPoints}`);

// Cleanup
await storage.cleanExpired();
storage.vacuum(); // Reclaim space
storage.close();
```

### Advanced Queries

```typescript
// Get outdated series (for refresh)
const outdated = await storage.getOutdated(7 * 24 * 60 * 60 * 1000); // 7 days
console.log(`Outdated series: ${outdated.join(', ')}`);

// Get recently updated
const recent = await storage.listUpdatedSince(Date.now() - 3600000); // Last hour

// Batch operations
await storage.setMany([
  { key: 'fred-m2', series: m2Series },
  { key: 'fred-gdp', series: gdpSeries },
  { key: 'fred-cpi', series: cpiSeries },
]);

await storage.deleteMany(['old-1', 'old-2', 'old-3']);

// Pagination
const page1 = await storage.list({ limit: 20, offset: 0 });
const page2 = await storage.list({ limit: 20, offset: 20 });

// Sorting
const newest = await storage.list({
  sortBy: 'lastUpdated',
  sortDir: 'desc',
  limit: 10,
});
```

---

## IndexedDB Storage

Client-side browser storage for offline access and performance.

### Features

- **Large capacity** (~50MB typical, can be higher)
- **Async API** with Promises
- **TTL support** with automatic expiration
- **Stale data fallback** for offline scenarios

### Basic Usage

```typescript
import { IndexedDBAdapter } from '@one-love-wealth/data-layer/cache';

// Initialize
const cache = new IndexedDBAdapter('data-layer-cache');

// Set data with TTL
await cache.set('fred-m2', series, 24 * 60 * 60 * 1000); // 24h

// Get fresh data
const fresh = await cache.get('fred-m2'); // null if expired

// Get stale data (fallback for offline)
const stale = await cache.getStale('fred-m2'); // Returns even if expired

// Check existence
const exists = await cache.has('fred-m2');

// Delete
await cache.delete('fred-m2');

// Clear all
await cache.clear();

// Cleanup
await cache.close();
```

---

## Sync Service

Bidirectional synchronization between client and server with conflict resolution.

### Sync Strategies

| Direction | Use Case |
|-----------|----------|
| `pull` | Download updates from server to client |
| `push` | Upload client data to server |
| `bidirectional` | Full sync in both directions (default) |

### Conflict Resolution

| Strategy | Behavior |
|----------|----------|
| `newest-wins` | Use series with latest `lastUpdated` timestamp (default) |
| `server-wins` | Always prefer server data |
| `client-wins` | Always prefer client data |

### Basic Sync

```typescript
import { SyncService } from '@one-love-wealth/data-layer/storage';
import { IndexedDBAdapter } from '@one-love-wealth/data-layer/cache';
import { SQLiteAdapter } from '@one-love-wealth/data-layer/storage';

// Initialize
const client = new IndexedDBAdapter();
const server = new SQLiteAdapter('data-cache.sqlite');
const syncService = new SyncService(client, server);

// Bidirectional sync (default)
const result = await syncService.sync();
console.log(`Pulled: ${result.pulled}, Pushed: ${result.pushed}`);
console.log(`Conflicts: ${result.conflicts}, Duration: ${result.duration}ms`);

// Pull only (download updates)
const pullResult = await syncService.sync({ direction: 'pull' });

// Push only (upload updates)
const pushResult = await syncService.sync({ direction: 'push' });

// With conflict resolution
const serverWinsResult = await syncService.sync({
  direction: 'bidirectional',
  conflictResolution: 'server-wins',
});
```

### Filtered Sync

```typescript
// Sync specific sources only
const fredOnlyResult = await syncService.sync({
  sources: ['FRED'],
  direction: 'pull',
});

// Sync only recent updates
const recentResult = await syncService.sync({
  since: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
  direction: 'bidirectional',
});

// Combine filters
const filtered = await syncService.sync({
  sources: ['FRED', 'YAHOO'],
  since: Date.now() - 3600000, // Last hour
  conflictResolution: 'newest-wins',
});
```

### Sync Status

Check what needs syncing before performing the sync:

```typescript
const status = await syncService.getSyncStatus();

console.log('Client-only series:', status.clientOnly);
console.log('Server-only series:', status.serverOnly);
console.log('Conflicts:', status.conflicts);

// Handle conflicts
for (const conflict of status.conflicts) {
  console.log(`Conflict: ${conflict.id}`);
  console.log(`  Client: ${new Date(conflict.clientUpdated)}`);
  console.log(`  Server: ${new Date(conflict.serverUpdated)}`);
}
```

### Force Refresh

Refresh specific series from their providers:

```typescript
const refreshResult = await syncService.refreshSeries(
  { seriesIds: ['fred-m2', 'fred-gdp'] },
  async (seriesId) => {
    // Your fetch logic here
    // This callback is called for each series ID
    const provider = getProviderFor(seriesId);
    const config = getConfigFor(seriesId);
    const result = await provider.fetch(config);
    return result.series;
  }
);

console.log(`Refreshed: ${refreshResult.refreshed}`);
console.log(`Failed: ${refreshResult.failed.join(', ')}`);
if (Object.keys(refreshResult.errors).length > 0) {
  console.log('Errors:', refreshResult.errors);
}
```

---

## API Usage

### Example: Full Integration

```typescript
import { DataProviderRegistry } from '@one-love-wealth/data-layer';
import { IndexedDBAdapter } from '@one-love-wealth/data-layer/cache';
import { SQLiteAdapter, SyncService } from '@one-love-wealth/data-layer/storage';
import { fred } from '@one-love-wealth/data-layer/builders';

// Initialize storage
const clientCache = new IndexedDBAdapter();
const serverStorage = new SQLiteAdapter('data-cache.sqlite');
const syncService = new SyncService(clientCache, serverStorage);

// Initialize registry with client cache
const registry = new DataProviderRegistry(clientCache);

// Fetch data (uses client cache)
const m2 = await registry.fetch(fred('M2SL').build());

// Sync to server
await syncService.sync({ direction: 'push' });

// Later: Pull updates from server
await syncService.sync({ direction: 'pull' });

// Force refresh specific series
await syncService.refreshSeries(
  { seriesIds: ['fred-M2SL'] },
  async (id) => {
    const config = fred('M2SL').forceRefresh().build();
    const result = await registry.fetch(config);
    return result.series;
  }
);
```

### Example: Periodic Sync

```typescript
// Sync every 5 minutes
setInterval(async () => {
  const result = await syncService.sync({
    direction: 'bidirectional',
    conflictResolution: 'newest-wins',
  });

  console.log(`[${new Date().toISOString()}] Sync complete:`, {
    pulled: result.pulled,
    pushed: result.pushed,
    conflicts: result.conflicts,
    duration: result.duration,
  });

  if (result.errors.length > 0) {
    console.error('Sync errors:', result.errors);
  }
}, 5 * 60 * 1000);
```

### Example: Offline-First Pattern

```typescript
async function fetchWithFallback(config: FREDConfig) {
  try {
    // Try to fetch fresh data
    const result = await registry.fetch(config);
    return result.series;
  } catch (error) {
    console.warn('Fetch failed, using stale data:', error);

    // Fall back to stale data
    const cacheKey = buildCacheKey({ provider: 'FRED', ...config });
    const stale = await clientCache.getStale(cacheKey);

    if (!stale) {
      throw new Error('No cached data available for offline use');
    }

    return stale;
  }
}
```

---

## Best Practices

### 1. Sync Strategy Selection

**Pull-only** (download):
- Initial app load
- After server updates
- Restoring from backup

**Push-only** (upload):
- Saving user-generated configs
- Client-side calculations
- Rarely needed for time series data

**Bidirectional**:
- Regular sync intervals
- Multi-device scenarios
- Full synchronization

### 2. Conflict Resolution

**Newest-wins** (default):
- Most scenarios
- Data freshness is priority
- Prevents stale data

**Server-wins**:
- Server is authoritative
- Client is read-only
- Restore scenarios

**Client-wins**:
- Client-side overrides
- User preferences
- Rarely used for time series

### 3. TTL Configuration

```typescript
// Real-time data (5 minutes)
await storage.set(key, series, 5 * 60 * 1000);

// Daily data (24 hours)
await storage.set(key, series, 24 * 60 * 60 * 1000);

// Monthly data (7 days)
await storage.set(key, series, 7 * 24 * 60 * 60 * 1000);

// No expiration
await storage.set(key, series); // No TTL
```

### 4. Cleanup Routines

```typescript
// Daily cleanup job
setInterval(async () => {
  const cleaned = await storage.cleanExpired();
  console.log(`Cleaned ${cleaned} expired entries`);

  // Weekly vacuum
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    // Sunday
    storage.vacuum();
    console.log('Database vacuumed');
  }
}, 24 * 60 * 60 * 1000); // Daily
```

### 5. Error Handling

```typescript
try {
  const result = await syncService.sync();

  if (result.errors.length > 0) {
    // Log errors but don't fail
    console.error('Sync completed with errors:', result.errors);

    // Optionally retry failed items
    // ...
  }
} catch (error) {
  console.error('Sync failed completely:', error);

  // Implement retry logic with exponential backoff
  // ...
}
```

---

## Performance Optimization

### 1. Batch Operations

```typescript
// BAD: Individual sets (slow)
for (const series of manySeriesList) {
  await storage.set(series.id, series);
}

// GOOD: Batch set (fast)
await storage.setMany(
  manySeriesList.map((series) => ({
    key: series.id,
    series,
    ttl: 24 * 60 * 60 * 1000,
  }))
);
```

### 2. Pagination for Large Queries

```typescript
// BAD: Load all at once
const allSeries = await storage.list(); // Could be huge

// GOOD: Paginate
async function* paginateSeries(pageSize = 100) {
  let offset = 0;
  while (true) {
    const page = await storage.list({ limit: pageSize, offset });
    if (page.length === 0) break;

    yield page;
    offset += pageSize;
  }
}

// Usage
for await (const page of paginateSeries()) {
  processBatch(page);
}
```

### 3. Filtered Queries

```typescript
// BAD: Filter after retrieval
const allSeries = await storage.list();
const fredSeries = allSeries.filter((s) => s.source === 'FRED');

// GOOD: Filter in query
const fredSeries = await storage.list({ source: 'FRED' });
```

### 4. Index Usage

Queries are optimized when filtering/sorting by indexed columns:
- `id` (PRIMARY KEY)
- `source`
- `last_updated`
- `updated_at`
- `expires_at`

---

## Troubleshooting

### Issue: Sync Conflicts

**Symptoms**: High conflict count in sync results

**Solutions**:
1. Check timestamps on both sides
2. Ensure clocks are synchronized
3. Use `newest-wins` strategy
4. Investigate data sources for staleness

```typescript
// Debug conflicts
const status = await syncService.getSyncStatus();
for (const conflict of status.conflicts) {
  const client = await clientCache.get(conflict.id);
  const server = await storage.get(conflict.id);

  console.log(`Conflict: ${conflict.id}`);
  console.log(`  Client lastUpdated: ${new Date(client.lastUpdated)}`);
  console.log(`  Server lastUpdated: ${new Date(server.lastUpdated)}`);
  console.log(`  Difference: ${server.lastUpdated - client.lastUpdated}ms`);
}
```

### Issue: Storage Quota Exceeded

**Symptoms**: "QuotaExceededError" on IndexedDB

**Solutions**:
1. Implement aggressive TTL
2. Clear old data regularly
3. Reduce data point count
4. Use server storage for large datasets

```typescript
// Cleanup strategy
async function manageQuota() {
  const stats = await storage.getStats();

  if (stats.totalDataPoints > 100000) {
    // Too much data, clean up old entries
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const old = await storage.getOutdated(oneMonthAgo);

    console.log(`Cleaning ${old.length} old series`);
    await storage.deleteMany(old);
  }
}
```

### Issue: Slow Queries

**Symptoms**: List operations take too long

**Solutions**:
1. Use pagination
2. Filter by indexed columns
3. Vacuum database regularly
4. Use appropriate limits

```typescript
// Profile query
console.time('query');
const results = await storage.list({ source: 'FRED', limit: 100 });
console.timeEnd('query'); // Should be < 10ms
```

### Issue: Missing Data After Sync

**Symptoms**: Data not appearing after sync

**Solutions**:
1. Check sync direction
2. Verify conflict resolution strategy
3. Check TTL expiration
4. Inspect sync result for errors

```typescript
// Debug missing data
const result = await syncService.sync({ direction: 'pull' });

console.log('Sync result:', {
  pulled: result.pulled,
  conflicts: result.conflicts,
  errors: result.errors,
});

// Check if series exists on server
const serverSeries = await storage.get('missing-id');
console.log('Server has series:', !!serverSeries);

// Check if series exists on client
const clientSeries = await clientCache.get('missing-id');
console.log('Client has series:', !!clientSeries);
```

---

## Next Steps

- **[Testing Guide](./TESTING.md)** - Test storage and sync
- **[Provider Reference](./PROVIDERS.md)** - Data provider documentation
- **[Cache System](../src/cache/README.md)** - Caching strategies
- **[API Reference](../README.md)** - Complete API documentation

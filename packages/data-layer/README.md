# @one-love-wealth/data-layer

Unified data provider infrastructure for financial and economic data.

## Features

- 🔌 Pluggable cache adapters (IndexedDB, localStorage, memory)
- 🏗️ Builder pattern for type-safe configuration
- 🎯 18+ data providers (FRED, CoinGecko, Yahoo, etc.)
- 📦 Works with TypeScript and JavaScript
- 🚀 Automatic mock fallback for development
- ⚡ Smart caching with TTL and frequency hints
- 🛡️ Built-in rate limiting per provider
- 🔄 Configurable error recovery strategies

## Installation

```bash
bun add @one-love-wealth/data-layer
```

## Quick Start

```typescript
import { MemoryAdapter, ProxyRequestAdapter } from '@one-love-wealth/data-layer';

// Create cache and request adapters
const cache = new MemoryAdapter();
const request = new ProxyRequestAdapter('/api/proxy');

// Use with providers (coming in Phase 2+)
```

## Core Types

### DataPoint

Canonical data point with required `time` (Unix ms) and optional value/OHLC fields:

```typescript
import type { DataPoint } from '@one-love-wealth/data-layer';
import { getValue, isOHLC, TimeUtils } from '@one-love-wealth/data-layer';

const point: DataPoint = {
  time: 1704067200000, // Required: Unix timestamp in ms
  value: 100,          // Simple value
  // OR OHLC data:
  // open: 100, high: 110, low: 95, close: 105, volume: 1000000
};

// Utilities
console.log(getValue(point));           // 100
console.log(isOHLC(point));             // false
console.log(TimeUtils.toISO(point));    // "2024-01-01T00:00:00.000Z"
```

### Cache Adapters

```typescript
import { MemoryAdapter } from '@one-love-wealth/data-layer';

const cache = new MemoryAdapter();

await cache.set('key', series, 60000);  // Set with 60s TTL
const data = await cache.get('key');     // Get (returns null if expired)
const stale = await cache.getStale('key'); // Get even if expired
```

### Error Recovery

```typescript
import { DEFAULT_ERROR_RECOVERY } from '@one-love-wealth/data-layer';
import type { ErrorRecoveryConfig } from '@one-love-wealth/data-layer';

const recovery: ErrorRecoveryConfig = {
  fallbackToMock: true,        // Return mock data on error
  fallbackToStaleCache: false, // Return expired cache on error
  throwOnError: false,         // Throw instead of fallback
  retryCount: 2,               // Retry 2 times before fallback
  retryDelayMs: 1000,          // Wait 1s between retries
  timeoutMs: 30000,            // 30s timeout
};
```

## Development

```bash
# Run tests
bun test

# Build
bun run build

# Type check
bun run typecheck
```

## Architecture

See [Implementation Plan](../../thoughts/shared/plans/2025-12-29-data-layer-extraction.md) for detailed design decisions.

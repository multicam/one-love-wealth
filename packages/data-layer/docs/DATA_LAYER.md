# Data Layer Infrastructure

## Overview

The Macro View data layer is a comprehensive system for fetching, caching, transforming, and visualizing macroeconomic and cryptocurrency data from multiple providers.

**Architecture:** Provider Registry Pattern with unified `DataSourceConfig` discriminated union

**Key Features:**
- 🔌 **11 Active Providers + 5 SDMX Planned** - FRED, CoinGecko, Yahoo Finance, World Bank, BLS, Treasury, Hyperliquid, Alpha Vantage, Quandl, IMF, OECD + (ECB, Eurostat, BIS, ILO, UNSD)
- 🔄 **22 Transform Operations** - Client-side data transformations (YoY, normalize, rolling averages, etc.)
- 💾 **Dual Storage Layer** - IndexedDB (client) + SQLite (server) with bidirectional sync
- 🧪 **Comprehensive Testing** - CLI tool for provider testing with quality validation
- 📊 **Enhanced Graph System** - 47 macro graphs with server-side YoY, time alignment, and multi-provider support
- 🎯 **Type-Safe** - Full TypeScript discriminated unions for all configurations

## Quick Start

### Fetching Data

```typescript
import { dataProviderRegistry } from '$lib/data-providers';

// FRED data with server-side YoY calculation
const result = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2-yoy',
  name: 'M2 YoY',
  seriesId: 'M2SL',
  units: 'pc1' // Server-side Year-over-Year percentage
});

console.log(result.series.data); // DataPoint[]
console.log(result.fromCache); // boolean
console.log(result.fetchDuration); // number (ms)
```

### Using Transforms

```typescript
import { applyTransforms } from '$lib/logic/transform-engine';

// Client-side YoY calculation for providers that don't support it
const transformed = applyTransforms(data, [
  { operation: { type: 'yoy', periods: 365 } }
]);

// Normalize multiple series to base 100 for comparison
const normalized = applyTransforms(data, [
  { operation: { type: 'normalize', base: 100 } }
]);
```

### Creating Enhanced Graphs

```typescript
import type { EnhancedGraphDefinition } from '$lib/types/graph-definition';

const graph: EnhancedGraphDefinition = {
  id: 'my-graph',
  title: 'Custom Analysis',
  description: 'Multi-provider graph with transforms',

  dataSources: [
    {
      type: 'fred',
      id: 'gdp',
      name: 'Real GDP',
      seriesId: 'GDPC1',
      units: 'pc1', // Server-side YoY
      display: { color: '#3b82f6', label: 'GDP YoY %' }
    },
    {
      type: 'coingecko',
      id: 'btc',
      name: 'Bitcoin',
      coinId: 'bitcoin',
      display: { color: '#f59e0b', label: 'BTC' }
    }
  ],

  transforms: [
    {
      seriesIndex: 1, // Apply to Bitcoin only
      operation: { type: 'normalize', base: 100 }
    }
  ],

  chartConfig: {
    type: 'line',
    dualAxis: true,
    yAxisLog: false
  },

  timeAlignment: {
    shifts: [{
      seriesIndex: 0,
      months: 3,
      direction: 'lead',
      description: 'GDP leads BTC by 3 months'
    }],
    recentPoints: 200 // Show last 200 data points
  }
};
```

## Testing Providers

The data layer includes a comprehensive testing CLI for validating provider functionality and data quality.

### CLI Tool Usage

```bash
# Test a single provider
bun run test:provider fred

# Test with verbose output and quality checks
bun run test:provider fred -v -q

# Test in live mode (actual API calls, not mock)
bun run test:provider fred -l

# Test all providers
bun run test:providers:all

# CI/CD mode: test all with quality validation
bun run test:providers:ci
```

### Quality Validation

The testing system includes three quality checks:

**1. Freshness** - Ensures data isn't stale
- Real-time providers (5min max age): CoinGecko, Hyperliquid
- Daily providers (2 days max age): FRED, Yahoo
- Monthly/Quarterly (60 days max age): BLS, World Bank

**2. Completeness** - Detects gaps in time series
- Checks for missing values, nulls, or NaN
- Supports both value-based and OHLC data
- Reports gap count and percentage

**3. Format Validation** - Verifies data structure
- Valid timestamps
- Proper numeric values
- Required fields present

### Test Output

```bash
$ bun run test:provider fred -v -q

Testing provider: FRED
Config: {
  seriesId: 'M2SL',
  limit: 100
}

✓ Fetch successful (234ms)
  Data points: 100
  From cache: false

Quality Report:
  Freshness: ✓ Data is fresh (1.2 days old, max: 2 days)
  Completeness: ✓ No gaps (0/100 points)
  Format: ✓ All data points valid

✓ FRED test passed
```

**See [TESTING.md](./TESTING.md) for complete testing documentation.**

---

## Storage & Sync

The data layer uses a dual storage architecture for optimal performance:

**Client-Side (IndexedDB):**
- Browser persistent storage
- Fast read access
- TTL-based expiration
- Offline support

**Server-Side (SQLite):**
- Persistent storage for historical data
- Advanced querying capabilities
- Batch operations
- Statistics and analytics

**Bidirectional Sync:**
- Three sync directions: pull, push, bidirectional
- Three conflict resolution strategies: newest-wins, server-wins, client-wins
- Filtered sync by source and timestamp
- Status tracking and error reporting

### Storage Quick Start

```typescript
import { SQLiteAdapter, SyncService } from '@/data-layer/storage';
import { MemoryAdapter } from '@/data-layer/cache';

// Initialize storage
const client = new MemoryAdapter(); // or IndexedDBAdapter
const server = new SQLiteAdapter('data-cache.sqlite');
const sync = new SyncService(client, server);

// Sync from server to client
const result = await sync.sync({
  direction: 'pull',
  sources: ['FRED', 'CoinGecko'],
  since: Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
});

console.log(`Pulled: ${result.pulled}, Conflicts: ${result.conflicts}`);
```

**See [STORAGE.md](./STORAGE.md) for complete storage and sync documentation.**

---

## Architecture

### Provider Registry Pattern

```
┌─────────────────────────────────────────────────────────┐
│           DataProviderRegistry (Singleton)               │
│                                                          │
│  fetch(config: DataSourceConfig): Promise<FetchResult>  │
│  fetchAll(configs[]): Promise<FetchResult[]>            │
│  getProvider(type): DataProvider | undefined            │
│  getAvailableProviders(): DataProviderType[]            │
└────────────────┬────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┬─────────────┬─────────────┐
      │                     │             │             │
┌─────▼─────┐      ┌───────▼──────┐  ┌──▼──┐     ┌────▼────┐
│ FRED      │      │  CoinGecko   │  │ ... │     │Hyperliq │
│ Provider  │      │  Provider    │  │     │     │Provider │
└───────────┘      └──────────────┘  └─────┘     └─────────┘
```

### Data Flow

```
User Code
   │
   ▼
dataProviderRegistry.fetch(config)
   │
   ├─→ Check IndexedDB Cache
   │   └─→ If cached & fresh: Return cached data
   │
   ├─→ provider.buildUrl(config)
   │   └─→ Construct API URL with parameters
   │
   ├─→ fetch(url)
   │   └─→ HTTP request to provider API
   │
   ├─→ provider.transformResponse(json, config)
   │   └─→ Convert API response to DataPoint[]
   │
   ├─→ Save to IndexedDB Cache
   │   └─→ With TTL based on config/provider
   │
   └─→ Return FetchResult
       ├─ series: EconomicSeries
       ├─ fromCache: false
       └─ fetchDuration: number
```

### Enhanced Graph Rendering

```
EnhancedGraphRow.svelte
   │
   ├─→ Fetch all dataSources via registry
   │   └─→ Promise.all(configs.map(registry.fetch))
   │
   ├─→ Apply client-side transforms
   │   └─→ applyTransforms(data, graph.transforms)
   │
   ├─→ Apply time alignment
   │   ├─→ Filter by dateRange
   │   ├─→ Apply shifts (lead/lag)
   │   └─→ Limit to recentPoints
   │
   ├─→ Build Chart.js datasets
   │   └─→ Map to {labels, datasets}
   │
   └─→ Route to chart component
       ├─→ LineChart (implemented)
       ├─→ ScatterChart (fallback)
       ├─→ BarChart (fallback)
       └─→ AreaChart (fallback)
```

## Documentation Index

### Data Layer (this package)
- **[Provider Reference](./PROVIDERS.md)** - Complete guide to all 11 active providers + 5 SDMX providers (planned)
- **[Testing Guide](./TESTING.md)** - CLI tool for provider testing with quality validation
- **[Storage Documentation](./STORAGE.md)** - Dual storage architecture (IndexedDB + SQLite) with sync
- **[Data Sources Comparison](./DATA_SOURCES_COMPARISON.md)** - Series-level overlap analysis across all 16 providers
- **[SDMX Ecosystem Research](./research/SDMX_ECOSYSTEM.md)** - Comprehensive research on SDMX standard and providers
- **[Type Definitions](../src/types/)** - TypeScript interfaces and types
- **[Provider Implementations](../src/providers/)** - Provider source code

### Macro View (consumer package)
- **[Transform Engine](../../macro-view/docs/TRANSFORMS.md)** - 22 transform operations
- **[Graph System](../../macro-view/docs/GRAPHS.md)** - Enhanced graph definitions
- **[API Tester Guide](../../macro-view/docs/API_TESTER.md)** - Visual testing interface
- **[Usage Examples](../../macro-view/docs/EXAMPLES.md)** - Common patterns and recipes

## Provider Summary

### Active Providers

| Provider | Icon | Data Type | Server-Side Transforms | API Key Required | Rate Limits |
|----------|------|-----------|------------------------|-----------------|-------------|
| **FRED** | 📊 | Economic Indicators | ✅ YoY, MoM, Log | ✅ Required | 120 req/min |
| **CoinGecko** | 🦎 | Cryptocurrency Prices | ❌ None | ❌ Optional | 10-50 req/min |
| **Yahoo Finance** | 💹 | Stock Market Data | ❌ None | ❌ Not needed | Server-side proxy |
| **World Bank** | 🏦 | Global Economic Data | ❌ None | ❌ Not needed | No official limit |
| **BLS** | 👷 | US Labor Statistics | ✅ Calculations | ⚠️ Optional | 25/day (500 with key) |
| **Treasury** | 💰 | US Fiscal Data | ❌ None | ❌ Not needed | No official limit |
| **Hyperliquid** | ⚡ | Crypto Perpetuals | ❌ None | ❌ Not needed | No official limit |
| **Alpha Vantage** | 📈 | Stock & Economic | ❌ None | ✅ Required | 25/day (free tier) |
| **Quandl** | 📊 | Alternative Data | ❌ None | ⚠️ Optional | 50/day (500 with key) |
| **IMF** | 🌍 | International Monetary | ❌ None | ❌ Not needed | No limit |
| **OECD** | 📊 | Development Stats | ❌ None | ❌ Not needed | No limit |

### SDMX Providers (Planned)

| Provider | Icon | Data Type | Fills Gap | Rate Limits |
|----------|------|-----------|-----------|-------------|
| **ECB** | 🏦 | Euro Area Financial | European exchange rates, ECB policy | No limit |
| **Eurostat** | 🇪🇺 | EU Statistics | Monthly EU inflation (12x improvement) | No limit |
| **BIS** | 🏛️ | Banking Statistics | International banking & credit data | Monitor usage |
| **ILO** | 👷 | International Labor | Quarterly/monthly labor (190+ countries) | No limit |
| **UNSD** | 🌍 | UN Statistics | SDG indicators, granular UN data | No limit |

## Transform Engine Summary

**Percentage Changes:** `yoy`, `mom`, `pct_change`, `diff`
**Normalization:** `normalize`, `normalize_date`, `zscore`, `rank`
**Math Operations:** `invert`, `log`, `log10`, `abs`, `cumsum`
**Window Functions:** `rolling_avg`, `rolling_std`
**Adjustments:** `scale`, `offset`, `clip`

See [TRANSFORMS.md](./TRANSFORMS.md) for complete documentation.

## Key Concepts

### Data Point Format

All providers normalize data to a standard format:

```typescript
interface DataPoint {
  time: number;    // Unix timestamp in milliseconds
  value?: number;  // Simple value (economic indicators)
  open?: number;   // OHLC data (candlestick charts)
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}
```

### Cache Strategy

```typescript
interface CacheStrategy {
  ttl?: number; // Time to live in milliseconds
  frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  forceRefresh?: boolean; // Bypass cache
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
}
```

### Time Alignment

Enhanced graphs support sophisticated time alignment:

```typescript
timeAlignment: {
  // Lead/lag specific series
  shifts: [{
    seriesIndex: 1,      // Which series to shift
    months: 6,           // By how many months
    direction: 'lead',   // 'lead' or 'lag'
    description: 'Rates lead ISM by 6 months'
  }],

  // Limit to recent data
  recentPoints: 200,     // Show last 200 points

  // Or specify date range
  dateRange: {
    start: '2020-01-01',
    end: '2024-12-31'
  }
}
```

## Performance Characteristics

### Cache Hit Rates
- **FRED:** ~80% (daily economic data)
- **CoinGecko:** ~60% (volatile crypto prices)
- **Yahoo:** ~70% (daily stock data)
- **World Bank:** ~95% (annual/quarterly data)
- **BLS:** ~85% (monthly data)
- **Treasury:** ~90% (daily fiscal data)
- **Hyperliquid:** ~50% (real-time derivatives)

### Bundle Sizes
- **Transform Engine:** ~8 KB (gzipped)
- **Provider Registry:** ~28 KB (gzipped)
- **Enhanced Graph System:** ~12 KB additional (vs legacy)
- **Total Data Layer:** ~48 KB (gzipped)

### API Response Times (Typical)
- **FRED:** 150-300ms
- **CoinGecko:** 200-500ms
- **Yahoo:** 100-250ms (server-side proxy)
- **World Bank:** 500-1500ms (pagination)
- **BLS:** 300-600ms
- **Treasury:** 400-1000ms (large datasets)
- **Hyperliquid:** 100-300ms

## Environment Variables

```bash
# Required
FRED_API_KEY=your_fred_key_here

# Optional (improves rate limits)
BLS_API_KEY=your_bls_key_here

# Not required (using free tiers)
# COINGECKO_API_KEY=
# YAHOO_API_KEY=
# WORLD_BANK_API_KEY=
# TREASURY_API_KEY=
# HYPERLIQUID_API_KEY=
```

## Testing

Use the **API Tester** at `/api-tester` to:
- Test any provider with live parameters
- View cache status and timing
- Inspect response data
- Clear cache
- Verify configurations

See [API_TESTER.md](./API_TESTER.md) for detailed guide.

## Support & Contributing

For issues, questions, or contributions, see the main project repository.

## Version History

- **v1.0** - Initial implementation (FRED, CoinGecko)
- **v2.0** - Provider registry pattern, enhanced graphs
- **v3.0** - Added 5 new providers (Yahoo, World Bank, BLS, Treasury, Hyperliquid)
- **v3.1** - Transform engine (22 operations)
- **v3.2** - Enhanced time alignment, API Tester expansion

## License

See main project LICENSE file.

# Data Layer Documentation

**Shared data infrastructure for fetching, caching, and transforming financial and economic data**

## Overview

The `@one-love-wealth/data-layer` package provides a unified interface for accessing 11 data providers with built-in caching, error handling, and type safety.

## Documentation

- **[DATA_LAYER.md](./DATA_LAYER.md)** - Architecture, data flow, and quick start guide
- **[PROVIDERS.md](./PROVIDERS.md)** - Complete reference for all 11 data providers

## Quick Start

```typescript
import {
  FREDProvider,
  CoinGeckoProvider,
  YahooProvider,
  MemoryAdapter,
  ProxyRequestAdapter,
} from '@one-love-wealth/data-layer';

// Create provider with cache and request adapters
const cache = new MemoryAdapter();
const request = new ProxyRequestAdapter('/api/proxy');
const fredProvider = new FREDProvider(cache, request);

// Fetch data
const data = await fredProvider.fetch({
  seriesId: 'M2SL',
  units: 'pc1', // Year-over-year percentage
});

console.log(data); // DataPoint[]
```

## Providers

| Provider | Data Type | API Key Required |
|----------|-----------|------------------|
| FRED | US Economic Data | ✅ Required |
| CoinGecko | Cryptocurrency | ⚠️ Optional |
| Yahoo Finance | Stock Market | ❌ Not needed |
| World Bank | Global Economics | ❌ Not needed |
| BLS | Labor Statistics | ⚠️ Optional |
| Treasury | US Fiscal Data | ❌ Not needed |
| Alpha Vantage | Stocks & Economics | ✅ Required |
| Quandl | Alternative Data | ✅ Required |
| IMF | International Data | ❌ Not needed |
| OECD | Development Stats | ❌ Not needed |
| Hyperliquid | Crypto Derivatives | ❌ Not needed |

## DataPoint Format

All providers normalize data to a standard format:

```typescript
interface DataPoint {
  time: number;    // Unix timestamp in milliseconds
  value?: number;  // Simple value
  open?: number;   // OHLC data
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}
```

## Cache Adapters

- **MemoryAdapter** - In-memory cache (server-side)
- **LocalStorageAdapter** - Browser localStorage
- **IndexedDBAdapter** - Browser IndexedDB (large datasets)

## Request Adapters

- **ProxyRequestAdapter** - Routes through server proxy (recommended)
- **DirectRequestAdapter** - Direct API calls (CORS issues)

## See Also

- [macro-view docs](../../macro-view/docs/) - Graph system, transforms, API tester
- [shared-ui docs](../../shared-ui/) - Shared UI components

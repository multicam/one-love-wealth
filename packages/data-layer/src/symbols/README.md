# Symbol Search Module

Hybrid symbol search combining a curated registry with external API searches.

## Features

- **Instant Results**: Curated list of 50+ popular symbols (stocks, ETFs, indices, crypto)
- **External Search**: Yahoo Finance and CoinGecko API integration
- **Smart Merging**: Deduplicates and sorts by relevance
- **Type-Safe**: Full TypeScript support
- **Flexible**: Use curated only or include external APIs

## Quick Start

```typescript
import { searchSymbols } from '@one-love-wealth/data-layer';

// Simple search (curated + external)
const results = await searchSymbols('AAPL');
// Returns: [{ symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', ... }]

// Curated only (instant)
const curated = await searchSymbols('SPY', { includeExternal: false });

// Multi-provider search
const crypto = await searchSymbols('bitcoin', {
  providers: ['yahoo', 'coingecko'],
  limit: 10
});
```

## API Reference

### `searchSymbols(query, options?)`

Unified hybrid search.

**Parameters:**
- `query: string` - Search query (case-insensitive)
- `options?: SymbolSearchOptions`
  - `includeExternal?: boolean` - Include external APIs (default: `true`)
  - `providers?: ('yahoo' | 'coingecko')[]` - Providers to search (default: `['yahoo']`)
  - `limit?: number` - Max results (default: `20`)

**Returns:** `Promise<SymbolInfo[]>`

### `searchCuratedSymbols(query, limit?)`

Search curated registry only (instant).

**Parameters:**
- `query: string` - Search query
- `limit?: number` - Max results (default: `20`)

**Returns:** `SymbolInfo[]`

### `getSymbolInfo(symbol)`

Get exact symbol metadata from curated list.

**Parameters:**
- `symbol: string` - Exact symbol code (case-insensitive)

**Returns:** `SymbolInfo | null`

### `getPopularSymbols(limit?, type?)`

Get most popular symbols.

**Parameters:**
- `limit?: number` - Max results (default: `10`)
- `type?: SymbolType` - Filter by type (optional)

**Returns:** `SymbolInfo[]`

### `validateSymbol(symbol)`

Check if symbol exists (curated or external).

**Parameters:**
- `symbol: string` - Symbol to validate

**Returns:** `Promise<boolean>`

## Types

```typescript
interface SymbolInfo {
  symbol: string;          // e.g., 'AAPL', 'BTC-USD'
  name: string;            // Full name
  type: SymbolType;        // 'stock' | 'etf' | 'index' | 'crypto' | 'forex'
  provider: SymbolProvider; // 'yahoo' | 'coingecko'
  exchange?: string;       // Exchange code
  popularity?: number;     // 1-10 (for sorting)
}
```

## Curated Symbols

The registry includes 50+ popular symbols:

- **ETFs**: SPY, QQQ, IWM, GLD, TLT, VTI, VOO, etc.
- **Indices**: ^GSPC, ^DJI, ^IXIC, ^RUT, ^VIX
- **Stocks**: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, etc.
- **Crypto**: BTC-USD, ETH-USD, SOL-USD, etc.
- **Forex**: EURUSD=X, GBPUSD=X, USDJPY=X

**Location**: `symbols.json` (easily editable)

## External APIs

### Yahoo Finance
- **Endpoint**: `query1.finance.yahoo.com/v1/finance/search`
- **Coverage**: Stocks, ETFs, indices, crypto, forex
- **Rate Limit**: ~100 req/min (no key required)

### CoinGecko
- **Endpoint**: `api.coingecko.com/api/v3/search`
- **Coverage**: Cryptocurrencies
- **Rate Limit**: 10-50 req/min (free tier, no key required)

## Search Strategy

1. **Instant**: Search curated list first
2. **Parallel**: If `includeExternal=true`, search external APIs in parallel
3. **Merge**: Deduplicate and sort by relevance:
   - Exact matches first
   - Symbol starts with query
   - Popularity
   - Alphabetical

## Examples

### Type-Specific Search

```typescript
import { getSymbolsByType, getPopularSymbols } from '@one-love-wealth/data-layer';

// Get all ETFs
const etfs = getSymbolsByType('etf');

// Get top 5 stocks
const topStocks = getPopularSymbols(5, 'stock');
```

### Validation

```typescript
import { validateSymbol } from '@one-love-wealth/data-layer';

const isValid = await validateSymbol('AAPL'); // true
const isInvalid = await validateSymbol('NOTREAL'); // false
```

### External Only

```typescript
import { searchYahooFinance, searchCoinGecko } from '@one-love-wealth/data-layer';

// Direct Yahoo search
const yahooResults = await searchYahooFinance('tesla');

// Direct CoinGecko search
const coinResults = await searchCoinGecko('bitcoin');
```

## Adding Symbols

Edit `symbols.json`:

```json
{
  "symbol": "YOUR-SYMBOL",
  "name": "Full Name",
  "type": "stock",
  "provider": "yahoo",
  "exchange": "NASDAQ",
  "popularity": 7
}
```

## Error Handling

All functions handle errors gracefully:

```typescript
// External APIs fail silently, returning empty arrays
const results = await searchSymbols('test'); // Never throws

// Returns curated results even if external APIs are down
```

## Performance

- **Curated search**: < 1ms
- **External search**: 100-500ms
- **Hybrid search**: Returns curated instantly, external async

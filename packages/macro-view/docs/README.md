# Macro View Data Layer Documentation

**Comprehensive 7-provider data infrastructure for macroeconomic and cryptocurrency analysis**

Version: 3.2 | Last Updated: 2025

## Quick Links

📖 **[Data Layer Overview](./DATA_LAYER.md)** - Start here for architecture and quick start  
📊 **[Provider Reference](./PROVIDERS.md)** - Complete guide to all 7 providers  
🔄 **[Transform Engine](./TRANSFORMS.md)** - 22 client-side transform operations  
📈 **[Graph System](./GRAPHS.md)** - Enhanced graph definitions and rendering  
💡 **[Usage Examples](./EXAMPLES.md)** - Common patterns and recipes  
🧪 **[API Tester Guide](./API_TESTER.md)** - Visual testing interface

## System Overview

The Macro View data layer provides unified access to 7 major financial and economic data providers through a type-safe, provider-agnostic interface.

### Providers

| Provider | Data Type | API Key | Rate Limit |
|----------|-----------|---------|------------|
| 📊 **FRED** | US Economic Data | ✅ Required | 120 req/min |
| 🦎 **CoinGecko** | Cryptocurrency | ⚠️ Optional | 10-50 req/min |
| 💹 **Yahoo Finance** | Stock Market | ❌ Not needed | Proxy |
| 🏦 **World Bank** | Global Economics | ❌ Not needed | None |
| 👷 **BLS** | Labor Statistics | ⚠️ Optional | 25-500/day |
| 💰 **Treasury** | US Fiscal Data | ❌ Not needed | None |
| ⚡ **Hyperliquid** | Crypto Derivatives | ❌ Not needed | None |

### Features

✅ **Unified API** - Single interface for all 7 providers  
✅ **Type Safety** - Full TypeScript discriminated unions  
✅ **Smart Caching** - IndexedDB with configurable TTL  
✅ **Transforms** - 22 client-side operations (YoY, normalize, etc.)  
✅ **Server-Side Ops** - FRED units, BLS calculations  
✅ **Enhanced Graphs** - 47 macro graphs with time alignment  
✅ **Visual Testing** - API Tester for all providers  

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
# .env
FRED_API_KEY=your_fred_api_key_here
BLS_API_KEY=your_bls_api_key_here  # Optional
```

### 3. Fetch Data

```typescript
import { dataProviderRegistry } from '$lib/data-providers';

// Single provider
const m2 = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2-yoy',
  name: 'M2 YoY',
  seriesId: 'M2SL',
  units: 'pc1'  // Server-side YoY
});

// Multiple providers in parallel
const results = await dataProviderRegistry.fetchAll([
  { type: 'fred', /* ... */ },
  { type: 'coingecko', /* ... */ },
  { type: 'worldbank', /* ... */ }
]);
```

### 4. Apply Transforms

```typescript
import { applyTransforms } from '$lib/logic/transform-engine';

const normalized = applyTransforms(data, [
  { operation: { type: 'normalize', base: 100 } }
]);
```

### 5. Create Graphs

```typescript
const graph: EnhancedGraphDefinition = {
  id: 'custom',
  title: 'My Analysis',
  description: 'Multi-provider analysis',

  dataSources: [
    { type: 'fred', seriesId: 'GDPC1', units: 'pc1', /* ... */ },
    { type: 'coingecko', coinId: 'bitcoin', /* ... */ }
  ],

  transforms: [
    { operation: { type: 'normalize', base: 100 } }
  ],

  chartConfig: { type: 'line', dualAxis: true },

  timeAlignment: {
    shifts: [{
      seriesIndex: 0,
      months: 3,
      direction: 'lead'
    }]
  }
};
```

## Documentation Structure

### Core Documentation

1. **[DATA_LAYER.md](./DATA_LAYER.md)**
   - Architecture overview
   - Data flow diagrams
   - Performance characteristics
   - Environment configuration

2. **[PROVIDERS.md](./PROVIDERS.md)**
   - Complete provider reference
   - Configuration parameters
   - Common series/indicators
   - Best practices
   - API key setup

3. **[TRANSFORMS.md](./TRANSFORMS.md)**
   - All 22 transform operations
   - Server-side vs client-side
   - Common patterns
   - Performance notes

4. **[GRAPHS.md](./GRAPHS.md)**
   - Enhanced vs legacy systems
   - Migration examples
   - Creating custom graphs
   - Chart type support

5. **[EXAMPLES.md](./EXAMPLES.md)**
   - Common patterns
   - Advanced use cases
   - Error handling
   - Performance tips

6. **[API_TESTER.md](./API_TESTER.md)**
   - Using the visual tester
   - Testing each provider
   - Cache management
   - Troubleshooting

## Architecture

```
User Code
   │
   ▼
dataProviderRegistry
   │
   ├─→ Cache Check (IndexedDB)
   │
   ├─→ Provider Selection (7 providers)
   │   ├─ FRED
   │   ├─ CoinGecko
   │   ├─ Yahoo
   │   ├─ World Bank
   │   ├─ BLS
   │   ├─ Treasury
   │   └─ Hyperliquid
   │
   ├─→ API Fetch (via proxy)
   │
   ├─→ Transform Response → DataPoint[]
   │
   └─→ Cache & Return
       │
       ▼
Client-Side Transforms (Optional)
       │
       ▼
Enhanced Graph Rendering
       │
       ▼
Chart.js Visualization
```

## Key Files

```
src/
├── lib/
│   ├── data-providers/
│   │   ├── registry.ts              # Provider registry
│   │   ├── base.ts                  # Base provider class
│   │   ├── fred.ts                  # FRED provider
│   │   ├── coingecko.ts            # CoinGecko provider
│   │   ├── yahoo.ts                 # Yahoo provider
│   │   ├── worldbank.ts             # World Bank provider
│   │   ├── bls.ts                   # BLS provider
│   │   ├── treasury.ts              # Treasury provider
│   │   └── hyperliquid.ts           # Hyperliquid provider
│   │
│   ├── logic/
│   │   ├── transform-engine.ts      # Transform engine
│   │   └── graphs-config-enhanced.ts # Enhanced graphs
│   │
│   ├── types/
│   │   ├── data-provider.ts         # Provider types
│   │   ├── transforms.ts            # Transform types
│   │   └── graph-definition.ts      # Graph types
│   │
│   └── components/
│       └── graphs/
│           └── EnhancedGraphRow.svelte  # Graph renderer
│
├── routes/
│   ├── api/proxy/                   # Provider proxies
│   │   ├── fred/+server.ts
│   │   ├── coingecko/+server.ts
│   │   ├── yahoo/+server.ts
│   │   ├── worldbank/+server.ts
│   │   ├── bls/+server.ts
│   │   ├── treasury/+server.ts
│   │   └── hyperliquid/+server.ts
│   │
│   ├── graphs/+page.svelte          # Graphs page
│   └── api-tester/+page.svelte      # API Tester
│
└── docs/                            # This documentation
```

## Development

### Testing

Visit `/api-tester` to test all providers with live parameters.

### Adding New Providers

1. Create provider class extending `DataProvider`
2. Create proxy route in `src/routes/api/proxy/`
3. Add to provider registry
4. Add type definitions
5. Update API Tester

### Creating Graphs

Add to `graphs-config-enhanced.ts` or create dynamically.

## Version History

- **v1.0** - Initial (FRED, CoinGecko)
- **v2.0** - Provider registry, enhanced graphs
- **v3.0** - Added 5 providers (Yahoo, World Bank, BLS, Treasury, Hyperliquid)
- **v3.1** - Transform engine (22 operations)
- **v3.2** - Enhanced time alignment, API Tester expansion

## Performance

- **Bundle Size:** 48 KB (gzipped)
- **Cache Hit Rate:** 60-95% (provider-dependent)
- **API Response:** 100-1500ms (provider-dependent)
- **Transform Overhead:** 1-5ms per operation (1000 points)

## Getting Help

- Read [DATA_LAYER.md](./DATA_LAYER.md) for architecture
- Check [EXAMPLES.md](./EXAMPLES.md) for patterns
- Use API Tester at `/api-tester` for testing
- Refer to [PROVIDERS.md](./PROVIDERS.md) for API details

## Contributing

See main project repository for contribution guidelines.

## License

See main project LICENSE file.

---

**Start with [DATA_LAYER.md](./DATA_LAYER.md) for comprehensive introduction.**

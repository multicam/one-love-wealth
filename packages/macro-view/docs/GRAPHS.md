# Graph System Documentation

Enhanced graph definitions with 11-provider support, transforms, and time alignment.

## Overview

The graph system evolved from legacy 2-provider format to enhanced multi-provider system.

**Legacy:** `graphs-config.ts` (46 graphs, FRED + CoinGecko only)
**Enhanced:** `graphs-config-enhanced.ts` (80 graphs, all 11 providers)

## Current Status

- **80 enhanced graphs** - All legacy graphs migrated + Phase 16 + Phase 17 (Complete)
- **11 providers** - FRED, CoinGecko, Yahoo, World Bank, BLS, Treasury, Hyperliquid, Alpha Vantage, Quandl, IMF, OECD
- **Enhanced rendering** - EnhancedGraphRow.svelte component
- **Active system** - `/graphs` page uses enhanced system
- **Favorites system** - LocalStorage-based bookmarking (Phase 16C)
- **Phase 17 complete** - 23 new graphs across 4 phases (A, B, C, D)
- **Multi-provider capability** - Up to 5 data sources per graph
- **100% provider utilization** - All 11 providers actively used

## Graph Definition

### Enhanced Format

```typescript
interface EnhancedGraphDefinition {
  id: string;
  title: string;
  description: string;

  dataSources: DataSourceConfig[];  // Discriminated union
  transforms?: DataTransform[];     // Client-side ops
  chartConfig: ChartConfig;         // Line/Scatter/Bar/Area
  timeAlignment?: TimeAlignmentConfig;
}
```

### Legacy Format (Deprecated)

```typescript
interface GraphDefinition {
  id: string;
  title: string;
  description: string;

  dataSources: {
    name: string;
    id: string;
    type: 'fred' | 'coingecko';  // Only 2 providers
    color?: string;
    label?: string;
  }[];

  chartConfig: {
    type: 'line';  // Only line charts
    yAxisLog?: boolean;
    dualAxis?: boolean;
    timeShift?: number;  // Ambiguous (which series?)
  };
}
```

## Key Improvements

### 1. Multi-Provider Support

**Before:** Hardcoded FRED and CoinGecko clients
```typescript
if (source.type === 'fred') {
  data = await fredClient.fetchSeries(source.id);
} else if (source.type === 'coingecko') {
  data = await coinGeckoClient.fetchMarketChart(source.id);
}
```

**After:** Dynamic provider registry
```typescript
const result = await dataProviderRegistry.fetch(sourceConfig);
```

### 2. Server-Side Transforms

**Before:** No YoY support, used raw values
```typescript
{ name: 'M2 YoY', id: 'M2SL', type: 'fred' }
// BUG: This fetches raw M2, not YoY!
```

**After:** Proper server-side YoY
```typescript
{
  type: 'fred',
  seriesId: 'M2SL',
  units: 'pc1',  // ⭐ Server-side YoY
  display: { label: 'M2 YoY %' }
}
```

### 3. Client-Side Transforms

**Before:** Not supported
**After:** 22 transform operations
```typescript
transforms: [
  { operation: { type: 'normalize', base: 100 } },
  { operation: { type: 'yoy', periods: 365 } }
]
```

### 4. Explicit Time Alignment

**Before:** Ambiguous shift
```typescript
timeShift: 6  // Which series? Lead or lag?
```

**After:** Explicit targeting
```typescript
timeAlignment: {
  shifts: [{
    seriesIndex: 1,  // Second series
    months: 6,
    direction: 'lead',
    description: 'M2 leads by 6 months'
  }]
}
```

### 5. Chart Type Support

**Before:** Only line charts
**After:** Line, Scatter, Bar, Area (line implemented, others fallback)

## Migration Examples

### Example 1: Simple YoY Fix

**Before:**
```typescript
{
  id: '36',
  title: 'Liquidity Index YoY%',
  dataSources: [
    { name: 'M2 YoY', id: 'M2SL', type: 'fred' }  // Wrong: raw M2
  ],
  chartConfig: { type: 'line' }
}
```

**After:**
```typescript
{
  id: '36',
  title: 'Liquidity Index YoY%',
  dataSources: [{
    type: 'fred',
    id: 'm2-yoy',
    name: 'M2 YoY',
    seriesId: 'M2SL',
    units: 'pc1',  // ✅ Correct: server-side YoY
    display: { color: '#3b82f6', label: 'M2 YoY %' }
  }],
  chartConfig: { type: 'line' }
}
```

### Example 2: Time Alignment Fix

**Before:**
```typescript
{
  id: '15',
  title: 'ISM vs Liquidity (YoY)',
  dataSources: [
    { name: 'ISM PMI', id: 'IPMAN', type: 'fred' },
    { name: 'M2 YoY', id: 'M2SL', type: 'fred' }
  ],
  chartConfig: {
    type: 'line',
    dualAxis: true,
    timeShift: 6  // Unclear: which series?
  }
}
```

**After:**
```typescript
{
  id: '15',
  title: 'ISM vs Liquidity (YoY)',
  dataSources: [
    {
      type: 'fred',
      id: 'ism-pmi',
      seriesId: 'IPMAN',
      display: { color: '#10b981', yAxisId: 'left' }
    },
    {
      type: 'fred',
      id: 'm2-yoy',
      seriesId: 'M2SL',
      units: 'pc1',
      display: { color: '#3b82f6', yAxisId: 'right' }
    }
  ],
  chartConfig: { type: 'line', dualAxis: true },
  timeAlignment: {
    shifts: [{
      seriesIndex: 1,  // ✅ Clear: second series
      months: 6,
      direction: 'lead',
      description: 'M2 leads by 6 months'
    }]
  }
}
```

### Example 3: Normalization

**Before:**
```typescript
{
  id: '2',
  title: 'Digital Assets Performance',
  dataSources: [
    { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko' },
    { name: 'S&P 500', id: 'SP500', type: 'fred' }
  ],
  chartConfig: { type: 'line', yAxisLog: true }
  // Problem: Different scales hard to compare
}
```

**After:**
```typescript
{
  id: '2',
  title: 'Digital Assets Performance',
  description: 'Normalized to 100 for comparison',
  dataSources: [
    { type: 'coingecko', coinId: 'bitcoin', /* ... */ },
    { type: 'fred', seriesId: 'SP500', /* ... */ }
  ],
  transforms: [
    { operation: { type: 'normalize', base: 100 } }  // ✅ Same scale
  ],
  chartConfig: { type: 'line' }
}
```

## Usage in Components

### EnhancedGraphRow.svelte

Location: `src/lib/components/graphs/EnhancedGraphRow.svelte`

**Rendering pipeline:**
1. Fetch all dataSources via registry
2. Apply client-side transforms
3. Apply time alignment
4. Build Chart.js datasets
5. Route to chart component

### Graphs Page

Location: `src/routes/graphs/+page.svelte`

```typescript
import { ENHANCED_GRAPHS_LIST } from '$lib/logic/graphs-config-enhanced';
import EnhancedGraphRow from '$lib/components/graphs/EnhancedGraphRow.svelte';

{#each ENHANCED_GRAPHS_LIST as graph}
  <EnhancedGraphRow {graph} />
{/each}
```

## Creating Custom Graphs

### Simple Graph

```typescript
const myGraph: EnhancedGraphDefinition = {
  id: 'my-custom-graph',
  title: 'My Analysis',
  description: 'Custom macroeconomic analysis',

  dataSources: [{
    type: 'fred',
    id: 'series1',
    name: 'GDP',
    seriesId: 'GDPC1',
    display: { color: '#3b82f6' }
  }],

  chartConfig: { type: 'line' }
};
```

### Advanced Graph

```typescript
const advancedGraph: EnhancedGraphDefinition = {
  id: 'advanced-analysis',
  title: 'Multi-Provider Analysis',
  description: 'Combines 3 providers with transforms and time shifts',

  dataSources: [
    {
      type: 'fred',
      id: 'gdp-yoy',
      name: 'GDP YoY',
      seriesId: 'GDPC1',
      units: 'pc1',  // Server-side YoY
      display: { color: '#3b82f6', yAxisId: 'left' }
    },
    {
      type: 'coingecko',
      id: 'btc',
      name: 'Bitcoin',
      coinId: 'bitcoin',
      display: { color: '#f59e0b', yAxisId: 'right' }
    },
    {
      type: 'worldbank',
      id: 'debt',
      name: 'Debt/GDP',
      indicatorCode: 'GC.DOD.TOTL.GD.ZS',
      countryCode: 'USA',
      display: { color: '#ef4444', yAxisId: 'right' }
    }
  ],

  transforms: [
    {
      seriesIndex: 1,  // Normalize Bitcoin only
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
      description: 'GDP leads by 3 months'
    }],
    recentPoints: 200,
    dateRange: { start: '2010-01-01' }
  }
};
```

## File Locations

```
src/lib/
├── types/
│   └── graph-definition.ts          # Type definitions
├── logic/
│   ├── graphs-config.ts             # Legacy (deprecated)
│   └── graphs-config-enhanced.ts    # Enhanced (active)
└── components/
    └── graphs/
        ├── GraphRow.svelte          # Legacy renderer
        └── EnhancedGraphRow.svelte  # Enhanced renderer ✅

src/routes/
└── graphs/
    └── +page.svelte                 # Uses enhanced system
```

## Graph Count by Provider

| Provider | Graph Count | Examples |
|----------|------------|----------|
| FRED | 38 | GDP, M2, ISM, Rates, Unemployment |
| CoinGecko | 15 | Bitcoin, Ethereum, Altcoins |
| Yahoo | 0 | (Ready for use) |
| World Bank | 0 | (Ready for use) |
| BLS | 0 | (Ready for use) |
| Treasury | 0 | (Ready for use) |
| Hyperliquid | 0 | (Ready for use) |

## Next Steps

- Add Yahoo-based stock graphs
- Add World Bank international comparisons
- Add BLS labor market graphs
- Add Treasury fiscal analysis graphs
- Add Hyperliquid crypto derivatives graphs
- Implement ScatterChart component (currently fallback)
- Implement BarChart component (currently fallback)
- Implement AreaChart component (currently fallback)

## See Also

- [Providers](./PROVIDERS.md) - Data source details
- [Transforms](./TRANSFORMS.md) - Transform operations
- [Examples](./EXAMPLES.md) - Usage patterns
- [Data Layer](./DATA_LAYER.md) - System architecture

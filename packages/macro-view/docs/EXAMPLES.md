# Usage Examples

Common patterns and recipes for the Macro View data layer.

## Basic Fetching

### Single Provider

```typescript
import { dataProviderRegistry } from '$lib/data-providers';

// FRED economic data
const m2 = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2',
  name: 'M2 Money Supply',
  seriesId: 'M2SL'
});

console.log(m2.series.data); // DataPoint[]
```

### Multiple Providers (Parallel)

```typescript
const configs = [
  { type: 'fred', id: 'gdp', name: 'GDP', seriesId: 'GDPC1' },
  { type: 'coingecko', id: 'btc', name: 'Bitcoin', coinId: 'bitcoin' }
];

const results = await dataProviderRegistry.fetchAll(configs);
```

## Server-Side Transforms

### FRED YoY

```typescript
// Prefer server-side YoY when available
const m2YoY = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2-yoy',
  name: 'M2 YoY',
  seriesId: 'M2SL',
  units: 'pc1' // ⭐ Server-side YoY calculation
});
```

### FRED Frequency Aggregation

```typescript
// Convert daily to weekly
const data = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'series-weekly',
  name: 'Series Weekly',
  seriesId: 'DEXUSEU', // Daily EUR/USD
  frequency: 'w',
  aggregationMethod: 'avg'
});
```

## Client-Side Transforms

### Bitcoin YoY (CoinGecko)

```typescript
import { applyTransforms } from '$lib/logic/transform-engine';

const btc = await dataProviderRegistry.fetch({
  type: 'coingecko',
  id: 'btc',
  name: 'Bitcoin',
  coinId: 'bitcoin',
  days: 'max'
});

// Apply YoY transform
const btcYoY = applyTransforms(btc.series.data, [
  { operation: { type: 'yoy', periods: 365 } }
]);
```

### Normalize Multiple Assets

```typescript
// Fetch multiple assets
const btc = await dataProviderRegistry.fetch({ /* ... */ });
const sp500 = await dataProviderRegistry.fetch({ /* ... */ });
const gold = await dataProviderRegistry.fetch({ /* ... */ });

// Normalize each to 100 at start
const btcNorm = applyTransforms(btc.series.data, [
  { operation: { type: 'normalize', base: 100 } }
]);
const sp500Norm = applyTransforms(sp500.series.data, [
  { operation: { type: 'normalize', base: 100 } }
]);
const goldNorm = applyTransforms(gold.series.data, [
  { operation: { type: 'normalize', base: 100 } }
]);

// Now all three start at 100 and can be compared
```

## Enhanced Graphs

### Multi-Provider Graph

```typescript
const graph: EnhancedGraphDefinition = {
  id: 'btc-vs-gdp',
  title: 'Bitcoin vs GDP Growth',
  description: 'Correlation between Bitcoin and economic growth',

  dataSources: [
    {
      type: 'coingecko',
      id: 'btc',
      name: 'Bitcoin',
      coinId: 'bitcoin',
      days: 'max',
      display: { color: '#f59e0b', label: 'BTC', yAxisId: 'left' }
    },
    {
      type: 'fred',
      id: 'gdp-yoy',
      name: 'Real GDP YoY',
      seriesId: 'GDPC1',
      units: 'pc1', // Server-side YoY
      display: { color: '#3b82f6', label: 'GDP YoY %', yAxisId: 'right' }
    }
  ],

  chartConfig: {
    type: 'line',
    dualAxis: true,
    yAxisLog: true
  }
};
```

### Graph with Transforms

```typescript
const graph: EnhancedGraphDefinition = {
  id: 'asset-comparison',
  title: 'Asset Performance Comparison',
  description: 'Normalized to 100 at start',

  dataSources: [
    { type: 'coingecko', coinId: 'bitcoin', /* ... */ },
    { type: 'yahoo', symbol: '^GSPC', /* ... */ },
    { type: 'fred', seriesId: 'GOLDAMGBD228NLBM', /* ... */ }
  ],

  // Normalize all series
  transforms: [
    { operation: { type: 'normalize', base: 100 } }
  ],

  chartConfig: { type: 'line' }
};
```

### Graph with Time Alignment

```typescript
const graph: EnhancedGraphDefinition = {
  id: 'rates-lead-ism',
  title: 'Interest Rates Lead ISM',
  description: 'Rates typically lead economic indicators',

  dataSources: [
    { type: 'fred', seriesId: 'IPMAN', /* ISM PMI */ },
    { type: 'fred', seriesId: 'GS10', /* 10Y Treasury */ }
  ],

  chartConfig: {
    type: 'line',
    dualAxis: true
  },

  timeAlignment: {
    shifts: [{
      seriesIndex: 1, // Shift the 10Y rate
      months: 6,
      direction: 'lead',
      description: 'Rates lead ISM by 6 months'
    }],
    recentPoints: 200 // Last 200 data points
  }
};
```

## Advanced Patterns

### Custom Cache TTL

```typescript
// Short TTL for volatile crypto data
const btc = await dataProviderRegistry.fetch({
  type: 'coingecko',
  id: 'btc',
  name: 'Bitcoin',
  coinId: 'bitcoin',
  cache: {
    ttl: 60 * 1000, // 1 minute
    frequency: 'realtime'
  }
});

// Long TTL for annual data
const worldBankData = await dataProviderRegistry.fetch({
  type: 'worldbank',
  id: 'gdp',
  name: 'GDP',
  indicatorCode: 'NY.GDP.MKTP.CD',
  cache: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    frequency: 'annual'
  }
});
```

### Force Fresh Data

```typescript
const data = await dataProviderRegistry.fetch({
  /* ... config ... */,
  cache: {
    forceRefresh: true // Bypass cache
  }
});
```

### Multi-Country Comparison

```typescript
const countries = ['USA', 'CHN', 'JPN', 'DEU'];

const gdpData = await Promise.all(
  countries.map(country =>
    dataProviderRegistry.fetch({
      type: 'worldbank',
      id: `gdp-${country}`,
      name: `GDP ${country}`,
      indicatorCode: 'NY.GDP.MKTP.CD',
      countryCode: country,
      display: { label: country }
    })
  )
);
```

### Rolling Correlation

```typescript
// Fetch two series
const m2 = await dataProviderRegistry.fetch({ /* M2 */ });
const btc = await dataProviderRegistry.fetch({ /* Bitcoin */ });

// Apply 30-day moving average to both
const m2Smooth = applyTransforms(m2.series.data, [
  { operation: { type: 'rolling_avg', window: 30 } }
]);
const btcSmooth = applyTransforms(btc.series.data, [
  { operation: { type: 'rolling_avg', window: 30 } }
]);

// Now correlation is smoother
```

### YoY with Normalization

```typescript
// Calculate YoY, then normalize to 100
const data = await dataProviderRegistry.fetch({ /* ... */ });

const transformed = applyTransforms(data.series.data, [
  { operation: { type: 'yoy', periods: 12 } }, // Monthly YoY first
  { operation: { type: 'normalize', base: 100 } } // Then index to 100
]);
```

## Common Use Cases

### Macro Dashboard

```typescript
// Fetch key indicators in parallel
const indicators = await dataProviderRegistry.fetchAll([
  { type: 'fred', seriesId: 'M2SL', /* M2 */ },
  { type: 'fred', seriesId: 'UNRATE', /* Unemployment */ },
  { type: 'fred', seriesId: 'CPIAUCSL', /* CPI */ },
  { type: 'fred', seriesId: 'GS10', /* 10Y Rate */ },
  { type: 'coingecko', coinId: 'bitcoin', /* BTC */ }
]);
```

### Correlation Study

```typescript
// Bitcoin vs Liquidity
const graph: EnhancedGraphDefinition = {
  id: 'btc-m2-correlation',
  title: 'Bitcoin vs M2 Correlation',
  description: 'Weekly aggregated data',

  dataSources: [
    {
      type: 'fred',
      id: 'm2',
      seriesId: 'M2SL',
      frequency: 'w', // Weekly aggregation
      aggregationMethod: 'avg'
    },
    {
      type: 'coingecko',
      id: 'btc',
      coinId: 'bitcoin'
    }
  ],

  chartConfig: {
    type: 'scatter', // Scatter for correlation
    regression: true,
    yAxisLog: true
  }
};
```

### Leading Indicators

```typescript
// Create graph with leading indicator
const graph: EnhancedGraphDefinition = {
  id: 'leading-indicator',
  title: 'Financial Conditions Lead ISM',
  description: 'FCI leads ISM PMI by 9 months',

  dataSources: [
    { type: 'fred', seriesId: 'IPMAN', /* ISM PMI */ },
    { type: 'fred', seriesId: 'NFCI', /* Financial Conditions */ }
  ],

  chartConfig: { type: 'line', dualAxis: true },

  timeAlignment: {
    shifts: [{
      seriesIndex: 1,
      months: 9,
      direction: 'lead'
    }]
  }
};
```

## Error Handling

### Graceful Degradation

```typescript
try {
  const data = await dataProviderRegistry.fetch(config);
  // Use data
} catch (error) {
  console.error('Fetch failed:', error);
  // Fall back to mock data or show error
}
```

### Validating Results

```typescript
const result = await dataProviderRegistry.fetch(config);

if (result.series.data.length === 0) {
  console.warn('No data returned');
  // Handle empty result
}

if (result.fromCache) {
  console.log('Using cached data');
}
```

## Performance Tips

1. **Use parallel fetching** for multiple providers
2. **Prefer server-side transforms** (FRED units, BLS calculations)
3. **Specify date ranges** to reduce data transfer
4. **Use appropriate cache TTLs** based on data update frequency
5. **Batch transform operations** in single applyTransforms call

## See Also

- [Providers](./PROVIDERS.md) - Provider-specific details
- [Transforms](./TRANSFORMS.md) - Transform operations
- [Graphs](./GRAPHS.md) - Graph system
- [Data Layer](./DATA_LAYER.md) - Architecture

# Transform Engine Reference

Client-side data transformations for operations not available from providers.

## Overview

The transform engine provides 22 operations organized into 5 categories:
- **Percentage Changes** - YoY, MoM, percent change, difference
- **Normalization** - Base value, date-specific, z-score, rank
- **Math Operations** - Invert, log, abs, cumsum
- **Window Functions** - Rolling averages and standard deviation
- **Adjustments** - Scale, offset, clip

## Usage

```typescript
import { applyTransforms } from '$lib/logic/transform-engine';

// Single transform
const yoyData = applyTransforms(data, [
  { operation: { type: 'yoy', periods: 365 } }
]);

// Multiple transforms (applied in order)
const normalized = applyTransforms(data, [
  { operation: { type: 'yoy', periods: 365 } },
  { operation: { type: 'normalize', base: 100 } }
]);

// Series-specific (in graph definitions)
transforms: [
  {
    seriesIndex: 1, // Apply to second series only
    operation: { type: 'normalize', base: 100 }
  }
]
```

## Transform Operations

### Percentage Changes

#### `yoy` - Year-over-Year

```typescript
{ type: 'yoy', periods?: number }
```

Calculates YoY percentage change: `((value[t] - value[t-periods]) / value[t-periods]) * 100`

**Parameters:**
- `periods` - Number of data points representing 1 year (default: 365 for daily data)

**Use when:** Provider doesn't support server-side YoY (CoinGecko, Yahoo, Hyperliquid)

**Example:**
```typescript
{ operation: { type: 'yoy', periods: 365 } } // Daily data
{ operation: { type: 'yoy', periods: 12 } }  // Monthly data
```

#### `mom` - Month-over-Month

```typescript
{ type: 'mom', periods?: number }
```

Calculates MoM percentage change.

**Parameters:**
- `periods` - Number of data points representing 1 month (default: 30)

#### `pct_change` - Percent Change

```typescript
{ type: 'pct_change', periods?: number }
```

Generic percentage change from N periods ago.

**Parameters:**
- `periods` - Lookback period (default: 1)

#### `diff` - Difference

```typescript
{ type: 'diff', periods?: number }
```

Absolute difference from N periods ago: `value[t] - value[t-periods]`

**Parameters:**
- `periods` - Lookback period (default: 1)

### Normalization

#### `normalize` - Normalize to Base

```typescript
{ type: 'normalize', base?: number }
```

Normalize all values to a base index: `(value / firstValue) * base`

**Parameters:**
- `base` - Base index value (default: 100)

**Use when:** Comparing multiple assets at different scales

**Example:**
```typescript
// Normalize Bitcoin and S&P 500 to 100 at start
{ operation: { type: 'normalize', base: 100 } }
```

#### `normalize_date` - Normalize to Specific Date

```typescript
{ type: 'normalize_date', date: string }
```

Normalize all values to base 100 at a specific date.

**Parameters:**
- `date` - ISO date string (required)

**Example:**
```typescript
// Normalize to Jan 1, 2020
{ operation: { type: 'normalize_date', date: '2020-01-01' } }
```

#### `zscore` - Z-Score Standardization

```typescript
{ type: 'zscore' }
```

Standardize to mean=0, std=1: `(value - mean) / std`

**Use when:** Comparing distributions or volatility

#### `rank` - Percentile Rank

```typescript
{ type: 'rank' }
```

Convert values to percentile ranks (0-100).

### Math Operations

#### `invert` - Invert Values

```typescript
{ type: 'invert' }
```

Multiply all values by -1.

**Use when:** Inverting interest rates to show on dual axis

#### `log` - Natural Logarithm

```typescript
{ type: 'log' }
```

Apply natural log: `ln(value)`

#### `log10` - Base-10 Logarithm

```typescript
{ type: 'log10' }
```

Apply log base 10: `log10(value)`

#### `abs` - Absolute Value

```typescript
{ type: 'abs' }
```

Convert all values to absolute value.

#### `cumsum` - Cumulative Sum

```typescript
{ type: 'cumsum' }
```

Running total of all values.

### Window Functions

#### `rolling_avg` - Rolling Average

```typescript
{ type: 'rolling_avg', window: number }
```

Simple moving average over N periods.

**Parameters:**
- `window` - Window size (required)

**Example:**
```typescript
{ operation: { type: 'rolling_avg', window: 30 } } // 30-day SMA
```

#### `rolling_std` - Rolling Standard Deviation

```typescript
{ type: 'rolling_std', window: number }
```

Rolling standard deviation over N periods.

**Parameters:**
- `window` - Window size (required)

### Adjustments

#### `scale` - Scale by Factor

```typescript
{ type: 'scale', factor: number }
```

Multiply all values by a constant.

**Parameters:**
- `factor` - Scaling factor (required)

#### `offset` - Add Offset

```typescript
{ type: 'offset', value: number }
```

Add a constant to all values.

**Parameters:**
- `value` - Offset value (required)

#### `clip` - Clip to Range

```typescript
{ type: 'clip', min?: number, max?: number }
```

Constrain values to [min, max] range.

**Parameters:**
- `min` - Minimum value (optional)
- `max` - Maximum value (optional)

## Server-Side vs Client-Side

**Prefer server-side when available:**

| Provider | Server-Side Operations | Use Client-Side For |
|----------|----------------------|---------------------|
| FRED | YoY, MoM, log, changes | Normalize, zscore |
| CoinGecko | None | All transforms |
| Yahoo | None | All transforms |
| World Bank | None | All transforms |
| BLS | Calculations (YoY, MoM) | Normalize, zscore |
| Treasury | None | All transforms |
| Hyperliquid | None | All transforms |

**Why prefer server-side:**
- Reduces data transfer
- More accurate (exact dates)
- Faster (no client processing)

## Common Patterns

### Comparing Assets at Different Scales

```typescript
// Normalize Bitcoin and Gold to same baseline
dataSources: [
  { type: 'coingecko', coinId: 'bitcoin', ... },
  { type: 'fred', seriesId: 'GOLDAMGBD228NLBM', ... }
],
transforms: [
  { operation: { type: 'normalize', base: 100 } }
]
```

### YoY for Non-Supporting Providers

```typescript
// Bitcoin YoY (CoinGecko doesn't support)
dataSources: [
  { type: 'coingecko', coinId: 'bitcoin', days: 'max', ... }
],
transforms: [
  { operation: { type: 'yoy', periods: 365 } }
]
```

### Smoothing Noisy Data

```typescript
// 30-day moving average of Bitcoin
transforms: [
  { operation: { type: 'rolling_avg', window: 30 } }
]
```

### Multi-Step Transformation

```typescript
// YoY percentage, then normalize to 100
transforms: [
  { operation: { type: 'yoy', periods: 12 } },  // Monthly YoY
  { operation: { type: 'normalize', base: 100 } } // Index to 100
]
```

### Series-Specific Transforms

```typescript
// Only normalize the second series
transforms: [
  {
    seriesIndex: 1,
    operation: { type: 'normalize', base: 100 }
  }
]
```

## Performance

- **Transform overhead:** ~1-5ms per operation for 1000 data points
- **Memory efficient:** Single pass through data
- **Composed transforms:** Applied sequentially

## Implementation

Located at: `src/lib/logic/transform-engine.ts`

Each transform is implemented as a pure function: `(DataPoint[], params) => DataPoint[]`

## See Also

- [Providers](./PROVIDERS.md) - Server-side transform capabilities
- [Graphs](./GRAPHS.md) - Using transforms in graph definitions
- [Examples](./EXAMPLES.md) - Common usage patterns

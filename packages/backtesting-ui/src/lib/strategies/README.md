# Strategy Registry

Dynamic strategy registry with multi-symbol support and automatic form generation.

## Overview

The strategy registry defines all available backtesting strategies with their parameters, defaults, and UI metadata. The UI dynamically generates forms based on field definitions.

## Features

- **7 Strategies**: MA Crossover, RSI Reversion, Buy & Hold, VIX Hedge, Bollinger Breakout, MACD Divergence, Pairs Trading
- **Multi-Symbol Support**: VIX Hedge (2 symbols), Pairs Trading (2 symbols)
- **Dynamic Forms**: Automatic form generation from field definitions
- **Smart Defaults**: Secondary symbols can be pre-filled and hidden
- **Validation**: Parameter validation with custom rules
- **Type Safety**: Full TypeScript support

## Usage

### Get Strategy

```typescript
import { STRATEGIES, getStrategy } from '$lib/strategies';

const strategy = getStrategy('ma-crossover');
console.log(strategy.name); // "MA Crossover"
console.log(strategy.fields); // Array of field definitions
```

### Render Dynamic Form

```svelte
<script lang="ts">
  import { getStrategy, getVisibleSymbolFields } from '$lib/strategies';

  const strategy = getStrategy('vix-hedge');
  const symbolFields = getVisibleSymbolFields(strategy);

  let params = $state({ ...strategy.defaults });
</script>

<!-- Render symbol fields -->
{#each symbolFields as field}
  <SymbolSearch
    label={field.label}
    help={field.help}
    bind:value={params[field.key]}
  />
{/each}

<!-- Render other fields -->
{#each strategy.fields.filter(f => f.type !== 'symbol') as field}
  {#if field.type === 'slider'}
    <Slider {...field} bind:value={params[field.key]} />
  {:else if field.type === 'toggle'}
    <Toggle {...field} bind:value={params[field.key]} />
  {/if}
{/each}
```

### Load Data for Strategy

```typescript
import { loadStrategyData } from '$lib/services/data';
import { getStrategy } from '$lib/strategies';

const strategy = getStrategy('vix-hedge');
const params = {
  tradingSymbol: 'TQQQ',
  vixSymbol: '^VIX',
  vixExitThreshold: 25,
  // ... other params
};

const result = await loadStrategyData(strategy, params, { years: 5 });
console.log(result.data); // BacktestData with both symbols
```

### Validate Parameters

```typescript
import { validateStrategyParams } from '$lib/strategies';

const validation = validateStrategyParams(strategy, params);

if (!validation.valid) {
  console.error(validation.errors);
  // ["Entry threshold must be below exit threshold"]
}
```

## Strategy Definitions

### Single-Symbol Strategies

**MA Crossover** (`ma-crossover`)
- Category: Trend
- Symbols: 1 (trading symbol)
- Parameters: fastPeriod, slowPeriod, positionSize
- Recommended: 10 years

**RSI Reversion** (`rsi-reversion`)
- Category: Mean Reversion
- Symbols: 1
- Parameters: rsiPeriod, oversold, overbought, positionSize
- Recommended: 3 years

**Buy & Hold** (`buy-and-hold`)
- Category: Trend
- Symbols: 1
- Parameters: positionSize
- Recommended: 20 years

**Bollinger Breakout** (`bollinger-breakout`)
- Category: Volatility
- Symbols: 1
- Parameters: period, stdDev, mode, oversoldThreshold, overboughtThreshold, useStopLoss, positionSize
- Recommended: 3 years

**MACD Divergence** (`macd-divergence`)
- Category: Momentum
- Symbols: 1
- Parameters: fastPeriod, slowPeriod, signalPeriod, positionSize
- Recommended: 5 years

### Multi-Symbol Strategies

**VIX Hedge** (`vix-hedge`)
- Category: Multi-Symbol
- Symbols: 2 (tradingSymbol + vixSymbol)
- Symbol Display:
  - `tradingSymbol`: Visible (user selects)
  - `vixSymbol`: Advanced (default: ^VIX)
- Parameters: vixExitThreshold, vixEntryThreshold, useMASignal, vixMAPeriod, partialExit, reducedPositionSize, positionSize
- Recommended: 5 years
- **Use Case**: Reduce exposure when volatility spikes

**Pairs Trading** (`pairs-trading`)
- Category: Multi-Symbol
- Symbols: 2 (symbol1 + symbol2)
- Symbol Display: Both visible
- Parameters: lookbackPeriod, entryThreshold, exitThreshold, positionSize
- Recommended: 5 years
- **Use Case**: Mean reversion on correlated pairs

## Field Types

### Symbol Field
```typescript
{
  key: 'tradingSymbol',
  type: 'symbol',
  label: 'Trading Symbol',
  help: 'Symbol to trade',
  default: 'TQQQ',        // Pre-filled value
  showByDefault: true,    // false = hidden in advanced
}
```

### Slider Field
```typescript
{
  key: 'fastPeriod',
  type: 'slider',
  label: 'Fast Period',
  help: 'Short-term MA period',
  min: 5,
  max: 100,
  step: 5,
  default: 50,
}
```

### Percent Field
```typescript
{
  key: 'positionSize',
  type: 'percent',
  label: 'Position Size',
  help: 'Percentage of capital',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0.95,
}
```

### Radio Field
```typescript
{
  key: 'mode',
  type: 'radio',
  label: 'Mode',
  options: [
    { value: 'breakout', label: 'Breakout' },
    { value: 'reversion', label: 'Mean Reversion' },
  ],
  default: 'breakout',
}
```

### Toggle Field
```typescript
{
  key: 'useStopLoss',
  type: 'toggle',
  label: 'Use Stop Loss',
  help: 'Exit below middle band',
  default: true,
}
```

### Number Field
```typescript
{
  key: 'threshold',
  type: 'number',
  label: 'Threshold',
  min: 0,
  max: 100,
  step: 1,
  default: 25,
}
```

### Select Field
```typescript
{
  key: 'method',
  type: 'select',
  label: 'Method',
  options: [
    { value: 'grid', label: 'Grid Search', description: 'Test all combinations' },
    { value: 'random', label: 'Random Search', description: 'Sample randomly' },
  ],
  default: 'grid',
}
```

## Helper Functions

### Get Symbol Fields

```typescript
import { getSymbolFields, getVisibleSymbolFields, getAdvancedSymbolFields } from '$lib/strategies';

const all = getSymbolFields(strategy);        // All symbol fields
const visible = getVisibleSymbolFields(strategy);  // showByDefault !== false
const advanced = getAdvancedSymbolFields(strategy); // showByDefault === false
```

### Get Required Symbols

```typescript
import { getRequiredSymbols } from '$lib/strategies';

const symbols = getRequiredSymbols(strategy, params);
// ['TQQQ', '^VIX'] for VIX Hedge
// ['SPY', 'IWM'] for Pairs Trading
```

### Check Multi-Symbol

```typescript
import { isMultiSymbolStrategy } from '$lib/strategies';

if (isMultiSymbolStrategy(strategy)) {
  console.log('Strategy requires multiple symbols');
}
```

### Validate Parameters

```typescript
import { validateStrategyParams } from '$lib/strategies';

const result = validateStrategyParams(strategy, params);
// { valid: boolean, errors: string[] }
```

## Advanced Settings Pattern

For multi-symbol strategies like VIX Hedge:

1. **Main UI**: Shows only `tradingSymbol`
2. **Advanced Section** (collapsible): Shows `vixSymbol` with default `^VIX`
3. **90% of users**: Never change VIX symbol
4. **Power users**: Can override in advanced settings

```svelte
<!-- Main Settings -->
<SymbolSearch label="Trading Symbol" bind:value={params.tradingSymbol} />

<!-- Advanced Settings (collapsible) -->
<SettingsSection title="Advanced Settings">
  <SymbolSearch
    label="VIX Symbol"
    bind:value={params.vixSymbol}
    placeholder="^VIX"
  />
</SettingsSection>
```

## Custom Validation

Strategies can define custom validation functions:

```typescript
{
  validation: (p) =>
    p.slowPeriod <= p.fastPeriod
      ? 'Slow period must be greater than fast period'
      : null,
}
```

Validation runs automatically when parameters change.

## Search & Filter

```typescript
import { searchStrategies, getStrategiesByCategory } from '$lib/strategies';

// Search by name/tags
const results = searchStrategies('mean reversion');
// Returns: [RSI Reversion, Bollinger Breakout, Pairs Trading]

// Filter by category
const trendStrategies = getStrategiesByCategory('trend');
// Returns: [MA Crossover, Buy & Hold]
```

## Adding New Strategies

1. Import strategy class from `@one-love-wealth/backtesting`
2. Add entry to `STRATEGIES` object:

```typescript
'my-strategy': {
  id: 'my-strategy',
  name: 'My Strategy',
  description: 'Does something cool',
  category: 'momentum',
  create: (p) => new MyStrategy(p),
  defaults: {
    symbol: 'SPY',
    param1: 10,
  },
  fields: [
    {
      key: 'symbol',
      type: 'symbol',
      label: 'Symbol',
      showByDefault: true,
    },
    {
      key: 'param1',
      type: 'slider',
      label: 'Parameter 1',
      min: 5,
      max: 50,
      step: 5,
      default: 10,
    },
  ],
  recommendedYears: 5,
  tags: ['momentum', 'custom'],
}
```

## Type Safety

All registry entries are fully typed:

```typescript
import type { StrategyDefinition, StrategyRegistry } from '$lib/strategies';

const strategy: StrategyDefinition = getStrategy('ma-crossover');

// TypeScript knows about all fields
strategy.name;        // string
strategy.category;    // 'trend' | 'momentum' | ...
strategy.fields;      // StrategyField[]
strategy.validation;  // ((params: any) => string | null) | undefined
```

## Best Practices

1. **Always use defaults**: Provide sensible defaults for all parameters
2. **Help text**: Add help text to explain parameters
3. **Validation**: Add validation for parameter constraints
4. **Recommended years**: Set appropriate date range recommendations
5. **Categories**: Use consistent categories for filtering
6. **Tags**: Add searchable tags
7. **Advanced settings**: Hide advanced symbols with `showByDefault: false`

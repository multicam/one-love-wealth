# Backtesting UI Configuration

Centralized configuration system with defaults, presets, and localStorage persistence.

## Overview

All configuration is stored in `defaults.ts` with type-safe constants. User overrides are persisted to localStorage.

## Quick Start

```typescript
import { loadConfig, saveConfig, DEFAULT_CONFIG } from '$lib/config';

// Load config (defaults + user overrides)
const config = loadConfig();

// Use config values
console.log(config.dateRange.years); // 5 (default)
console.log(config.backtest.initialCapital); // 100000

// Update config
const updated = {
  ...config,
  dateRange: { ...config.dateRange, years: 10 },
};
saveConfig(updated);
```

## Configuration Sections

### Date Range
```typescript
config.dateRange = {
  years: 5,              // Lookback period
  startDate: null,       // Custom start (null = calculated)
  endDate: null,         // Custom end (null = today)
}
```

**Presets:**
- `'1y'` - 1 Year
- `'3y'` - 3 Years
- `'5y'` - 5 Years (default)
- `'10y'` - 10 Years
- `'20y'` - 20 Years
- `'max'` - Max Available (~50 years)

### Backtest Engine
```typescript
config.backtest = {
  initialCapital: 100_000,    // Starting capital
  commission: 0,               // Fixed per trade
  commissionPercent: 0,        // Percentage of trade
  slippage: 0.001,            // 0.1% slippage
  maxPositionSize: 1,          // 100% max position
  allowShort: false,
  marginRequirement: 1.5,
}
```

### Strategy
```typescript
config.strategy = {
  defaultStrategy: 'ma-crossover',
  defaultSymbol: 'SPY',
  showAdvancedParams: false,
}
```

### Optimization
```typescript
config.optimization = {
  method: 'grid',              // 'grid' | 'random' | 'genetic'
  objective: 'sharpeRatio',    // Metric to optimize
  maxIterations: 1000,
  topN: 20,                    // Top results to show
  populationSize: 50,          // For genetic
  mutationRate: 0.1,           // For genetic
}
```

### Validation
```typescript
config.validation = {
  trainTestSplit: 0.7,         // 70% train, 30% test
  numFolds: 5,                 // Cross-validation folds
  enableWalkForward: true,
  numWindows: 5,
  inSampleRatio: 0.7,
  enableMonteCarlo: true,
  numSimulations: 1000,
  confidenceLevel: 0.95,
  enableBenchmarks: true,
  defaultBenchmarks: ['SPY', '^GSPC'],
}
```

### UI Preferences
```typescript
config.ui = {
  showEquityCurve: true,
  showDrawdown: true,
  showTradeMarkers: true,
  visibleMetrics: [
    'totalReturnPercent',
    'sharpeRatio',
    'maxDrawdownPercent',
    'cagr',
    'winRate',
    'profitFactor',
  ],
  theme: 'dark',
  resultsPosition: 'center',
  settingsPosition: 'right',
}
```

### Data Loading
```typescript
config.data = {
  interval: '1d',
  provider: 'yahoo',
  gapFillStrategy: 'forward-fill',
  cacheData: true,
  cacheTTL: 86400000,          // 24 hours
}
```

## Usage Patterns

### In Svelte Components

```svelte
<script lang="ts">
  import { loadConfig, saveConfig } from '$lib/config';

  let config = $state(loadConfig());

  function updateYears(years: number) {
    config = {
      ...config,
      dateRange: { ...config.dateRange, years },
    };
    saveConfig(config);
  }
</script>

<select value={config.dateRange.years} onchange={(e) => updateYears(+e.target.value)}>
  <option value={1}>1 Year</option>
  <option value={5}>5 Years</option>
  <option value={10}>10 Years</option>
</select>
```

### With Stores

```typescript
// stores/config.ts
import { writable } from 'svelte/store';
import { loadConfig, saveConfig } from '$lib/config';

const configStore = writable(loadConfig());

// Auto-save on changes
configStore.subscribe((config) => {
  saveConfig(config);
});

export { configStore };
```

### Update Specific Section

```typescript
import { updateConfigSection } from '$lib/config';

// Update just the date range
updateConfigSection('dateRange', { years: 10 });

// Update multiple backtest settings
updateConfigSection('backtest', {
  initialCapital: 50_000,
  commission: 1.00,
});
```

### Reset to Defaults

```typescript
import { resetConfig, DEFAULT_CONFIG } from '$lib/config';

// Clear localStorage
resetConfig();

// Use defaults directly
const config = DEFAULT_CONFIG;
```

## Date Range Utilities

```typescript
import { calculateDateRange, formatDateRange, validateDateRange } from '$lib/utils/date-range';

// Calculate range from years
const range = calculateDateRange(5); // Last 5 years
// { start: Date, end: Date }

// Format for display
const display = formatDateRange(range);
// "Jan 1, 2020 - Jan 1, 2025"

// Validate
const validation = validateDateRange(range);
// { valid: true }
```

## Storage

- **Key:** `backtesting-ui-config`
- **Format:** JSON
- **Storage:** localStorage
- **Only stores overrides** (not entire config)
- **Automatically merges** with defaults on load

## Extending Configuration

To add new config options:

1. Add to `defaults.ts`:
```typescript
export const NEW_SECTION_CONFIG = {
  newOption: 'default-value',
} as const;

export const DEFAULT_CONFIG = {
  ...
  newSection: NEW_SECTION_CONFIG,
} as const;
```

2. Update `UserConfig` type:
```typescript
export type UserConfig = Partial<{
  ...
  newSection: Partial<typeof NEW_SECTION_CONFIG>;
}>;
```

3. Update `mergeConfig()` and `saveConfig()` functions

## Best Practices

1. **Always load config on app init**
2. **Save config after user changes**
3. **Use presets for common date ranges**
4. **Validate date ranges before backtest**
5. **Show warnings for unusual settings**
6. **Reset to defaults if localStorage corrupted**

## Examples

### Date Preset Selector

```svelte
<script lang="ts">
  import { DATE_RANGE_PRESETS, updateConfigSection } from '$lib/config';

  function selectPreset(preset: keyof typeof DATE_RANGE_PRESETS) {
    const config = DATE_RANGE_PRESETS[preset];
    updateConfigSection('dateRange', { years: config.years });
  }
</script>

{#each Object.entries(DATE_RANGE_PRESETS) as [key, preset]}
  <button onclick={() => selectPreset(key)}>
    {preset.label}
  </button>
{/each}
```

### Capital Input with Validation

```svelte
<script lang="ts">
  import { getConfigSection, updateConfigSection } from '$lib/config';

  let capital = $state(getConfigSection('backtest').initialCapital);

  function updateCapital() {
    if (capital < 1000) {
      alert('Minimum capital is $1,000');
      return;
    }
    updateConfigSection('backtest', { initialCapital: capital });
  }
</script>

<input
  type="number"
  bind:value={capital}
  onblur={updateCapital}
  min={1000}
  step={1000}
/>
```

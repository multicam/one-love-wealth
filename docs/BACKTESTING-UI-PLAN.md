# Backtesting UI Package Plan

> **Package:** `@one-love-wealth/backtesting-ui`  
> **Framework:** SvelteKit 2 + Svelte 5 (matching crypto-viz)  
> **Layout:** Three-column layout inspired by crypto-viz  
> **Status:** Planning Phase  
> **Last Updated:** 2026-01-02

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Architecture](#architecture)
4. [Data Flow](#data-flow)
5. [Configuration Types](#configuration-types)
6. [Visualizations](#visualizations)
7. [State Management](#state-management)
8. [Component Structure](#component-structure)
9. [UI Modes & Workflows](#ui-modes--workflows)
10. [Technical Considerations](#technical-considerations)
11. [Dependencies](#dependencies)
12. [Implementation Phases](#implementation-phases)

---

## Overview

The `backtesting-ui` package provides a web interface for the `@one-love-wealth/backtesting` engine.

**Core Features:**
- Strategy backtesting with configurable parameters
- Parameter optimization (grid, random, genetic)
- Walk-forward analysis & Monte Carlo simulation
- Benchmark comparison & validation scoring
- Report generation (JSON, Markdown, HTML)

**Non-Goals (for MVP):**
- Real-time/live trading
- Custom strategy code editor
- Multi-user collaboration

---

## Design Principles

1. **Single-page app with modes** - No separate routes for optimize/validate; use tabs/modes instead (simpler, matches crypto-viz)
2. **Leverage shared-ui** - Use existing toast, spinner, button components from `@one-love-wealth/shared-ui`
3. **Progressive disclosure** - Show basic options first, advanced in collapsible sections
4. **URL state** - Encode strategy + params in URL for shareability
5. **Offline-first** - Cache data and results in localStorage/IndexedDB
6. **Web Workers** - Heavy computations (optimization, Monte Carlo) run in workers

---

## Architecture

```
packages/backtesting-ui/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── charts/           # lightweight-charts + d3 visualizations
│   │   │   ├── controls/         # Sliders, selectors, toggles
│   │   │   ├── layout/           # ThreeColumnLayout, panels
│   │   │   ├── results/          # Metrics, trade log, validation
│   │   │   └── settings/         # Config sections
│   │   ├── services/
│   │   │   ├── backtest.ts       # Run backtests (wraps engine)
│   │   │   ├── data.ts           # Load data from data-layer
│   │   │   └── storage.ts        # LocalStorage persistence
│   │   ├── stores/               # Svelte 5 runes-based stores
│   │   ├── workers/              # Web Workers for heavy ops
│   │   └── utils/
│   │       ├── constants.ts      # Strategy definitions, defaults
│   │       ├── url-state.ts      # URL encoding/decoding
│   │       └── formatters.ts     # Number/date formatting
│   └── routes/
│       ├── +page.svelte          # Single-page app
│       └── +layout.svelte        # App shell
├── static/
└── package.json
```

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ data-layer  │────▶│ BacktestData │────▶│ BacktestEngine  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
            ┌───────────────┐           ┌─────────────────┐           ┌─────────────────┐
            │ BacktestResult│           │OptimizationOutput│          │ ValidationOutput│
            └───────┬───────┘           └────────┬────────┘           └────────┬────────┘
                    │                            │                             │
                    └────────────────────────────┼─────────────────────────────┘
                                                 ▼
                                          ┌─────────────┐
                                          │   UI State  │
                                          │  (stores)   │
                                          └─────────────┘
```

---

## Configuration Types

All configuration types are imported from `@one-love-wealth/backtesting`. The UI dynamically generates forms based on these types.

### Backtest Configuration

```typescript
interface BacktestConfig {
  initialCapital: number;      // $1K - $10M, default $100K
  commission?: number;         // $0 - $10/share
  commissionPercent?: number;  // 0% - 1%
  slippage?: number;           // 0% - 1%, default 0.1%
  maxPositionSize?: number;    // 10% - 100%
  allowShort?: boolean;        // default false
  marginRequirement?: number;  // 1.0 - 3.0
}
```

### Strategy Registry

Strategies are defined in a registry with metadata for UI generation:

```typescript
const STRATEGY_REGISTRY = {
  'buy-and-hold': {
    name: 'Buy & Hold',
    factory: BuyAndHoldStrategy,
    defaults: DEFAULT_BUY_AND_HOLD_PARAMS,
    params: [
      { key: 'symbol', type: 'symbol', label: 'Symbol' },
      { key: 'positionSize', type: 'percent', label: 'Position Size', min: 0.1, max: 1, step: 0.05 },
    ],
  },
  'ma-crossover': {
    name: 'MA Crossover',
    factory: MACrossoverStrategy,
    defaults: DEFAULT_MA_CROSSOVER_PARAMS,
    params: [
      { key: 'symbol', type: 'symbol', label: 'Symbol' },
      { key: 'fastPeriod', type: 'number', label: 'Fast Period', min: 5, max: 100, step: 5 },
      { key: 'slowPeriod', type: 'number', label: 'Slow Period', min: 20, max: 300, step: 10 },
      { key: 'positionSize', type: 'percent', label: 'Position Size', min: 0.1, max: 1, step: 0.05 },
    ],
  },
  'rsi-reversion': { /* ... */ },
  'bollinger-breakout': { /* ... */ },
  'vix-hedge': { /* ... */ },
  'macd-divergence': { /* ... */ },
  'pairs-trading': { /* ... */ },
} as const;
```

**Parameter Types:**
- `symbol` → Dropdown (from available symbols)
- `number` → Slider with min/max/step
- `percent` → Slider (0-1) with % display
- `boolean` → Toggle
- `enum` → Radio or dropdown

### Testing Configuration

```typescript
// Optimization
interface OptimizationConfig {
  method: 'grid' | 'random' | 'genetic';
  objective: OptimizationObjective;  // sharpeRatio, totalReturn, etc.
  parameters: ParameterRange[];
  iterations?: number;      // 10-1000 for random/genetic
  populationSize?: number;  // 10-200 for genetic
  mutationRate?: number;    // 0.01-0.5 for genetic
  topN?: number;            // 5-50
}

// Walk-Forward
interface WalkForwardConfig {
  numWindows: number;        // 2-20
  inSampleRatio: number;     // 0.5-0.9
  optimizePerWindow: boolean;
  anchored?: boolean;
}

// Monte Carlo
interface MonteCarloConfig {
  numSimulations: number;    // 100-10000
  method: 'trade-shuffle' | 'bootstrap-returns' | 'random-entry';
  confidenceLevel?: number;  // 0.90-0.99
  seed?: number;
}

// Full Validation (combines above)
interface ValidationConfig {
  trainTestSplit?: number;   // 0.5-0.9
  numFolds?: number;         // 2-10
  walkForward?: WalkForwardConfig;
  monteCarlo?: MonteCarloConfig;
  benchmarks?: BenchmarkDefinition[];
}
```

---

## Visualizations

Prioritized by MVP importance. All charts use **lightweight-charts** for financial data and **d3** for statistical visualizations.

### MVP (Phase 1-2)

| Component | Library | Data Source |
|-----------|---------|-------------|
| **Equity Curve** | lightweight-charts | `equityCurve[]` |
| **Price Chart** | lightweight-charts | OHLC bars + trades |
| **Metrics Cards** | Tailwind | `PerformanceMetrics` |
| **Trade Log** | HTML table | `trades[]` |

### Phase 3 (Optimization)

| Component | Library | Data Source |
|-----------|---------|-------------|
| **Parameter Heatmap** | d3 | `OptimizationOutput.allResults` |
| **Top Results Table** | HTML table | `OptimizationOutput.topResults` |

### Phase 4 (Validation)

| Component | Library | Data Source |
|-----------|---------|-------------|
| **Score Gauge** | SVG/CSS | `ValidationScore.overall` |
| **WF Timeline** | d3 | `WalkForwardOutput.windows` |
| **MC Distribution** | d3 histogram | `MonteCarloOutput.simulations` |
| **Benchmark Overlay** | lightweight-charts | `BenchmarkComparison[]` |

### Chart Features

**Equity Curve:**
- Line with optional drawdown shading
- Trade markers (triangles for buy/sell)
- Benchmark overlay toggle
- Synchronized crosshair

**Price Chart:**
- Candlesticks with volume
- Entry/exit markers
- Strategy-specific overlays (MAs, bands)

**Metrics Dashboard:**
```
┌─────────────┬─────────────┬─────────────┐
│ Total Return│ Sharpe      │ Max DD      │
│ +45.2%      │ 1.85        │ -12.3%      │
├─────────────┼─────────────┼─────────────┤
│ CAGR        │ Win Rate    │ Profit Factor│
│ 18.5%       │ 62%         │ 2.1         │
└─────────────┴─────────────┴─────────────┘
```

### Deferred (Post-MVP)

- 3D surface plots (rarely needed)
- Radar charts (tables work better)
- Equity fan charts (complex, low value)

---

## State Management

Using Svelte 5 runes. Consolidated into 3 store files to reduce complexity.

### stores/app.svelte.ts

```typescript
// UI Mode
export const mode = $state<'backtest' | 'optimize' | 'validate'>('backtest');

// Loading states
export const isRunning = $state(false);
export const error = $state<string | null>(null);

// Selected strategy
export const selectedStrategy = $state<keyof typeof STRATEGY_REGISTRY>('ma-crossover');
export const strategyParams = $state<Record<string, any>>({});

// Data
export const symbols = $state<string[]>(['SPY']);
export const dateRange = $state({ start: new Date('2020-01-01'), end: new Date() });
export const backtestData = $state<BacktestData | null>(null);
```

### stores/results.svelte.ts

```typescript
// All result types in one place
export const backtestResult = $state<BacktestResult | null>(null);
export const optimizationResult = $state<OptimizationOutput | null>(null);
export const validationResult = $state<ValidationOutput | null>(null);

// Derived
export const hasResults = $derived(
  backtestResult !== null || optimizationResult !== null || validationResult !== null
);
```

### stores/config.svelte.ts

```typescript
// Persisted to localStorage
export const config = $state({
  backtest: { ...DEFAULT_BACKTEST_CONFIG },
  optimization: {
    method: 'grid' as const,
    objective: 'sharpeRatio' as const,
    iterations: 100,
    topN: 10,
  },
  validation: {
    trainTestSplit: 0.7,
    numFolds: 5,
    walkForward: { numWindows: 5, inSampleRatio: 0.7, optimizePerWindow: false },
    monteCarlo: { numSimulations: 1000, method: 'bootstrap-returns' as const },
  },
  ui: {
    showDrawdown: true,
    showBenchmark: true,
    equityHeight: 300,
  },
});

// Auto-persist on change
$effect(() => {
  localStorage.setItem('backtesting-ui-config', JSON.stringify(config));
});
```

---

## Component Structure

Flattened hierarchy (max 2 levels deep). Components are organized by feature, not by type.

```
src/lib/components/
├── layout/
│   ├── ThreeColumnLayout.svelte    # Main layout shell
│   ├── LeftNav.svelte              # Strategy list + mode tabs
│   ├── MainPanel.svelte            # Results area
│   └── SettingsPanel.svelte        # Config forms
│
├── charts/
│   ├── EquityCurve.svelte          # Primary chart
│   ├── PriceChart.svelte           # Candlesticks + signals
│   ├── Heatmap.svelte              # Optimization results
│   └── Distribution.svelte         # Monte Carlo histograms
│
├── results/
│   ├── MetricsGrid.svelte          # 6-card metrics display
│   ├── TradeLog.svelte             # Sortable trade table
│   ├── ValidationScore.svelte      # Score gauge + flags
│   └── TopResults.svelte           # Optimization rankings
│
├── settings/
│   ├── StrategyParams.svelte       # Dynamic param form
│   ├── BacktestConfig.svelte       # Capital, commission, etc.
│   ├── OptimizationConfig.svelte   # Method, objective, ranges
│   └── ValidationConfig.svelte     # Train/test, WF, MC options
│
└── controls/
    ├── SymbolSelect.svelte         # Multi-symbol picker
    ├── DateRange.svelte            # Start/end date pickers
    ├── ParamSlider.svelte          # Reusable slider
    └── RunButton.svelte            # Execute action
```

**Shared UI imports:** `Button`, `Spinner`, `Toast` from `@one-love-wealth/shared-ui`

---

## UI Modes & Workflows

Single-page app with 3 modes (tabs in left nav):

### Mode: Backtest (default)

```
┌─────────┬────────────────────────────────┬──────────────┐
│ Left    │ Center                         │ Right        │
├─────────┼────────────────────────────────┼──────────────┤
│ [Modes] │ EquityCurve + PriceChart       │ BacktestCfg  │
│ Strategy│ MetricsGrid                    │ StrategyParams│
│ List    │ TradeLog                       │ [Run]        │
└─────────┴────────────────────────────────┴──────────────┘
```

**Flow:** Select strategy → Configure → Run → View results

### Mode: Optimize

```
┌─────────┬────────────────────────────────┬──────────────┐
│ Left    │ Center                         │ Right        │
├─────────┼────────────────────────────────┼──────────────┤
│ [Modes] │ Heatmap (if grid)              │ OptimizeCfg  │
│ Strategy│ TopResults table               │ ParamRanges  │
│ List    │ Selected result details        │ [Optimize]   │
└─────────┴────────────────────────────────┴──────────────┘
```

**Flow:** Define ranges → Choose method → Run → Click result → Apply to backtest

### Mode: Validate

```
┌─────────┬────────────────────────────────┬──────────────┐
│ Left    │ Center                         │ Right        │
├─────────┼────────────────────────────────┼──────────────┤
│ [Modes] │ ValidationScore gauge          │ ValidateCfg  │
│ Strategy│ WF Timeline / MC Distribution  │ (collapsible)│
│ List    │ Benchmark comparison           │ [Validate]   │
│         │ [Export Report]                │ [Quick]      │
└─────────┴────────────────────────────────┴──────────────┘
```

**Flow:** Configure → Run (or Quick Validate) → View score → Export report

---

## Technical Considerations

### Web Workers

Heavy computations run in workers to keep UI responsive:

```typescript
// workers/backtest.worker.ts
self.onmessage = async (e) => {
  const { strategy, data, config } = e.data;
  const result = runBacktest(strategy, data, config);
  self.postMessage(result);
};
```

**Worker-bound operations:**
- `runBacktest()` - for large datasets
- `optimizeStrategy()` - always (can take minutes)
- `monteCarloSimulation()` - always (1000+ iterations)
- `validateStrategy()` - always (combines above)

### Data Loading

Integration with `@one-love-wealth/data-layer`:

```typescript
// services/data.ts
import { loadBacktestData } from '@one-love-wealth/backtesting';

export async function loadData(symbols: string[], start: Date, end: Date) {
  return loadBacktestData({
    symbols,
    startDate: start,
    endDate: end,
    source: 'yahoo',  // or 'binance', etc.
  });
}
```

### URL State

Shareable URLs encode current state:

```
/backtest?strategy=ma-crossover&fastPeriod=50&slowPeriod=200&symbols=SPY,QQQ
```

### Error Handling

- Toast notifications for user-facing errors
- Console logging for debug
- Graceful degradation (show partial results if available)

---

## Dependencies

```json
{
  "name": "@one-love-wealth/backtesting-ui",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "@one-love-wealth/backtesting": "workspace:*",
    "@one-love-wealth/data-layer": "workspace:*",
    "@one-love-wealth/shared-ui": "workspace:*",
    "lightweight-charts": "^4.2.0",
    "d3": "^7.9.0"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/adapter-static": "^3.0.0",
    "svelte": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Note:** Uses `bun` as package manager (monorepo standard).

---

## Implementation Phases

### Phase 1: Foundation (MVP)

**Goal:** Run a backtest and see results

| Task | Est. | Priority |
|------|------|----------|
| Package scaffolding (SvelteKit + Tailwind) | 2h | P0 |
| Copy layout from crypto-viz | 1h | P0 |
| Strategy registry + param forms | 3h | P0 |
| Data loading service | 2h | P0 |
| Backtest execution (main thread) | 2h | P0 |
| Equity curve chart | 3h | P0 |
| Metrics grid (6 cards) | 2h | P0 |

**Done when:** Can select MA Crossover, run backtest on SPY, see equity curve + metrics.

### Phase 2: Charts & Polish

**Goal:** Full charting experience

| Task | Est. | Priority |
|------|------|----------|
| Price chart with trade markers | 4h | P1 |
| Synchronized crosshairs | 2h | P1 |
| Trade log table | 2h | P1 |
| Chart resizing | 1h | P2 |
| URL state encoding | 2h | P2 |
| LocalStorage persistence | 1h | P2 |

**Done when:** Charts sync, trades visible, state persists across refresh.

### Phase 3: Optimization

**Goal:** Find optimal parameters

| Task | Est. | Priority |
|------|------|----------|
| Web Worker setup | 2h | P0 |
| Optimization config UI | 3h | P0 |
| Parameter range editor | 2h | P0 |
| Run optimization in worker | 2h | P0 |
| Top results table | 2h | P0 |
| Parameter heatmap (d3) | 4h | P1 |
| Apply result to backtest | 1h | P1 |

**Done when:** Can optimize MA Crossover params, see heatmap, apply best to backtest.

### Phase 4: Validation

**Goal:** Comprehensive strategy validation

| Task | Est. | Priority |
|------|------|----------|
| Validation config UI | 3h | P0 |
| Quick Validate button | 1h | P0 |
| Score gauge component | 2h | P0 |
| Walk-forward timeline | 3h | P1 |
| Monte Carlo distribution | 3h | P1 |
| Benchmark overlay | 2h | P1 |
| Report export (MD/HTML) | 3h | P2 |

**Done when:** Can run full validation, see score, export report.

### Phase 5: Future

- Multi-strategy comparison
- Custom strategy editor
- Saved runs / history
- Performance optimizations (virtualized lists, etc.)

---

## Open Questions

1. **Symbol source** - Where do available symbols come from? data-layer? Hardcoded list?
2. **Default date range** - Last 5 years? 10 years? User preference?
3. **Report storage** - Save to file only, or also to cloud/database?

---

## Revision History

| Date | Changes |
|------|---------|
| 2026-01-02 | Initial plan created |
| 2026-01-02 | Optimized: consolidated stores, flattened components, added technical details |

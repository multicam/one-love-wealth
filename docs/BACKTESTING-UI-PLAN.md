# Backtesting UI Package Plan

> **Package:** `@one-love-wealth/backtesting-ui`  
> **Framework:** SvelteKit 2 + Svelte 5  
> **Status:** Planning  
> **Updated:** 2026-01-02

---

## Overview

Web interface for `@one-love-wealth/backtesting`. Single-page app with three modes: Backtest, Optimize, Validate.

**MVP Scope:**
- Run backtests with configurable strategy parameters
- View equity curve, metrics, trade log
- Parameter optimization with results table

**Post-MVP:**
- Walk-forward analysis, Monte Carlo simulation
- Benchmark comparison, validation scoring
- Report export (MD/HTML)

**Out of Scope:**
- Live trading, custom strategy code, multi-user

---

## Design Principles

1. **Copy crypto-viz patterns** - Reuse `ThreeColumnLayout`, `SettingsView`, store patterns directly
2. **Leverage shared-ui** - `Button`, `Spinner`, `Toast` from workspace package
3. **Progressive disclosure** - Basic options visible, advanced in collapsible sections
4. **Web Workers for heavy ops** - Optimization, Monte Carlo run off main thread
5. **LocalStorage persistence** - Settings survive refresh (same pattern as crypto-viz)

---

## Architecture

```
packages/backtesting-ui/
├── src/
│   ├── lib/
│   │   ├── components/           # ~20 components total
│   │   │   ├── layout/           # ThreeColumnLayout (copy from crypto-viz)
│   │   │   ├── charts/           # EquityCurve, PriceChart, Heatmap
│   │   │   ├── results/          # MetricsGrid, TradeLog, TopResults
│   │   │   └── settings/         # StrategyParams, BacktestConfig
│   │   ├── services/
│   │   │   ├── backtest.ts       # Wraps BacktestEngine
│   │   │   └── data.ts           # Wraps data-layer
│   │   ├── stores/
│   │   │   └── index.ts          # Single store file (see below)
│   │   └── workers/
│   │       └── optimizer.worker.ts
│   └── routes/
│       └── +page.svelte          # Single page, mode switching
├── static/
└── package.json
```

**Files to copy from crypto-viz:**
- `src/lib/components/layout/ThreeColumnLayout.svelte`
- `src/lib/components/layout/SettingsView.svelte` → adapt for backtest settings
- `src/lib/stores/settings.js` → adapt store pattern

---

## Strategy Registry

Dynamic form generation from a registry. Each strategy defines its parameters with UI metadata:

```typescript
// utils/strategies.ts
import { 
  MACrossoverStrategy, BollingerBreakoutStrategy, /* ... */
  type MACrossoverParams, type BollingerBreakoutParams,
} from '@one-love-wealth/backtesting';

export const STRATEGIES = {
  'ma-crossover': {
    name: 'MA Crossover',
    create: (p: MACrossoverParams) => new MACrossoverStrategy(p),
    defaults: { symbol: 'SPY', fastPeriod: 50, slowPeriod: 200, positionSize: 0.95 },
    fields: [
      { key: 'symbol', type: 'symbol' },
      { key: 'fastPeriod', type: 'slider', min: 5, max: 100, step: 5 },
      { key: 'slowPeriod', type: 'slider', min: 20, max: 300, step: 10 },
      { key: 'positionSize', type: 'percent' },
    ],
  },
  'bollinger-breakout': {
    name: 'Bollinger Breakout',
    create: (p: BollingerBreakoutParams) => new BollingerBreakoutStrategy(p),
    defaults: { symbol: 'SPY', period: 20, stdDev: 2, mode: 'breakout', positionSize: 0.95 },
    fields: [
      { key: 'symbol', type: 'symbol' },
      { key: 'period', type: 'slider', min: 10, max: 50, step: 5 },
      { key: 'stdDev', type: 'slider', min: 1, max: 3, step: 0.5 },
      { key: 'mode', type: 'radio', options: ['breakout', 'reversion'] },
      { key: 'positionSize', type: 'percent' },
    ],
  },
  // ... other strategies follow same pattern
} as const;

export type StrategyKey = keyof typeof STRATEGIES;
```

**Field types:** `symbol` (dropdown), `slider` (number), `percent` (0-1), `radio` (enum), `toggle` (boolean)

---

## Components

### Charts (lightweight-charts)

| Component | Data | Notes |
|-----------|------|-------|
| `EquityCurve.svelte` | `equityCurve[]` | Line + drawdown shading, trade markers |
| `PriceChart.svelte` | OHLC + trades | Candlesticks, entry/exit arrows |
| `Heatmap.svelte` | optimization results | d3, for grid search (Phase 3) |

### Results

| Component | Data | Notes |
|-----------|------|-------|
| `MetricsGrid.svelte` | `PerformanceMetrics` | 6 cards: Return, Sharpe, MaxDD, CAGR, WinRate, PF |
| `TradeLog.svelte` | `trades[]` | Sortable table, CSV export |
| `TopResults.svelte` | `OptimizationOutput` | Ranked params table (Phase 3) |

### Settings

| Component | Purpose |
|-----------|---------|
| `StrategyParams.svelte` | Dynamic form from registry fields |
| `BacktestConfig.svelte` | Capital, commission, slippage |
| `OptimizationConfig.svelte` | Method, objective, ranges (Phase 3) |

---

## State Management

Single store file using Svelte's `writable` (same pattern as crypto-viz `settings.js`):

```typescript
// stores/index.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Load from localStorage
const stored = browser ? JSON.parse(localStorage.getItem('backtesting-ui') || '{}') : {};

// App state
export const mode = writable<'backtest' | 'optimize' | 'validate'>('backtest');
export const selectedStrategy = writable<StrategyKey>('ma-crossover');
export const strategyParams = writable<Record<string, any>>({});
export const isRunning = writable(false);

// Results
export const backtestResult = writable<BacktestResult | null>(null);
export const optimizationResult = writable<OptimizationOutput | null>(null);

// Config (persisted)
export const config = writable({
  initialCapital: stored.initialCapital ?? 100000,
  commission: stored.commission ?? 0,
  slippage: stored.slippage ?? 0.001,
  showDrawdown: stored.showDrawdown ?? true,
});

// Auto-save config changes
if (browser) {
  config.subscribe(v => localStorage.setItem('backtesting-ui', JSON.stringify(v)));
}
```

---

## UI Layout

Three-column layout (copied from crypto-viz):

```
┌──────────┬─────────────────────────────┬─────────────┐
│ Left     │ Center                      │ Right       │
│ (200px)  │ (flex)                      │ (280px)     │
├──────────┼─────────────────────────────┼─────────────┤
│ Mode tabs│ Charts + Results            │ Settings    │
│ Strategy │ (content varies by mode)    │ [Run]       │
│ list     │                             │             │
└──────────┴─────────────────────────────┴─────────────┘
```

**Mode: Backtest** → EquityCurve, MetricsGrid, TradeLog  
**Mode: Optimize** → Heatmap, TopResults (Phase 3)  
**Mode: Validate** → Score gauge, WF timeline (Post-MVP)

---

## Services

### backtest.ts

```typescript
import { BacktestEngine, type BacktestData, type Strategy } from '@one-love-wealth/backtesting';

const engine = new BacktestEngine({ initialCapital: 100000 });

export function runBacktest(strategy: Strategy, data: BacktestData) {
  return engine.run(strategy, data);
}
```

### optimizer.worker.ts (Phase 3)

```typescript
// Web Worker for optimization - can't pass class instances, so recreate strategy
import { optimizeStrategy, MACrossoverStrategy } from '@one-love-wealth/backtesting';

self.onmessage = (e) => {
  const { strategyKey, data, config, paramRanges } = e.data;
  
  // Factory function recreates strategy with params
  const factory = (params) => new MACrossoverStrategy(params);
  
  const result = optimizeStrategy(factory, data, { ...config, parameters: paramRanges });
  self.postMessage(result);
};
```

---

## Dependencies

```json
{
  "dependencies": {
    "@one-love-wealth/backtesting": "workspace:*",
    "@one-love-wealth/data-layer": "workspace:*",
    "@one-love-wealth/shared-ui": "workspace:*",
    "lightweight-charts": "^4.2.0",
    "d3": "^7.9.0"
  }
}
```

Uses `bun` (monorepo standard). Dev deps: SvelteKit 2, Svelte 5, Tailwind, TypeScript, Vite.

---

## Implementation Phases

### Phase 1: MVP (~15h)

Run a backtest, see results.

- [ ] Scaffold package (copy crypto-viz structure)
- [ ] Strategy registry with 2 strategies (MA Crossover, Buy & Hold)
- [ ] StrategyParams form (dynamic from registry)
- [ ] BacktestConfig form (capital, commission)
- [ ] Data loading (hardcoded SPY for now)
- [ ] EquityCurve chart
- [ ] MetricsGrid (6 cards)

**Done:** Select strategy → Run → See equity curve + metrics

### Phase 2: Polish (~12h)

Full charting, persistence.

- [ ] PriceChart with trade markers
- [ ] TradeLog table
- [ ] LocalStorage persistence
- [ ] Add remaining strategies to registry

**Done:** Charts show trades, settings persist

### Phase 3: Optimization (~16h)

Find optimal parameters.

- [ ] Web Worker for optimization
- [ ] OptimizationConfig UI (method, objective)
- [ ] Parameter range editor
- [ ] TopResults table
- [ ] Heatmap visualization (d3)
- [ ] Apply result → run backtest

**Done:** Optimize params, see heatmap, apply best

### Phase 4+: Validation (Post-MVP)

- Validation config UI
- Score gauge, WF timeline, MC distribution
- Report export

---

## Open Questions

1. **Symbol list** - Hardcode common symbols or fetch from data-layer?
2. **Date range default** - Last 5 years? Configurable?

---

## Changelog

| Date | Notes |
|------|-------|
| 2026-01-02 | Created |
| 2026-01-02 | v2: Consolidated stores, practical code examples |
| 2026-01-02 | v3: Simplified phases, removed over-engineering |

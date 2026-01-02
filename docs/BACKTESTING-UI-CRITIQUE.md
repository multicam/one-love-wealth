# Backtesting UI Plan - Critique & Open Questions

> **Document:** Critique of `docs/BACKTESTING-UI-PLAN.md`
> **Date:** 2026-01-02
> **Purpose:** Identify gaps, suggest improvements, and enumerate open questions

---

## Executive Summary

The plan is a solid foundation but has several gaps when compared against actual codebase patterns and the full `@one-love-wealth/backtesting` API. Key issues:

1. **ThreeColumnLayout is not configurable** - It's a fixed composition, not reusable as-is
2. **Missing 80% of backtesting features** - Plan only covers basic backtest; ignores validation framework
3. **Strategy registry is incomplete** - Missing 5 of 7 available strategies
4. **No data-layer integration details** - Vague on symbol fetching and date range handling
5. **shared-ui components underutilized** - Plan mentions 3 components but 17 are available
6. **Svelte 5 patterns not specified** - Plan uses Svelte 4 syntax in examples

---

## Decisions Made

### ✅ Open Question #1: Symbol List Source
**Decision:** Option C - Hybrid (Curated + External APIs)

**Implementation:**
- Created `packages/data-layer/src/symbols/` module
- Curated registry with 50 popular symbols (instant search)
- Yahoo Finance API integration for comprehensive search
- CoinGecko API integration for crypto
- Smart merging with deduplication and relevance sorting

**Status:** ✅ Complete - Exported from data-layer

### ✅ Open Question #2: Date Range Default
**Decision:** Option A (Fixed 5-year default) + Config File

**Implementation:**
- Created `packages/backtesting-ui/src/lib/config/defaults.ts`
- Default: 5 years lookback
- Presets: 1y, 3y, 5y, 10y, 20y, max
- All backtest settings configurable via config file
- localStorage persistence for user overrides
- Date range utilities with validation

**Status:** ✅ Complete

**Files Created:**
- `config/defaults.ts` - All default values
- `config/storage.ts` - localStorage persistence
- `utils/date-range.ts` - Date utilities
- `config/README.md` - Documentation

### ✅ Open Question #3: Multi-Symbol Strategies
**Decision:** Option A + B Hybrid (Dynamic Fields + Smart Defaults)

**Implementation:**
- Strategy registry supports multiple symbol fields per strategy
- `showByDefault` flag controls which symbols are visible
- VIXHedge: tradingSymbol (visible) + vixSymbol (advanced, default: ^VIX)
- PairsTrading: symbol1 and symbol2 (both visible)
- Data service handles multi-symbol loading automatically
- All 7 strategies defined with full field metadata

**Status:** ✅ Complete

**Files Created:**
- `strategies/types.ts` - Strategy field types and helpers
- `strategies/registry.ts` - Complete registry with all 7 strategies
- `services/data.ts` - Multi-symbol data loading
- `strategies/index.ts` - Module exports

**Strategy Registry Features:**
- Dynamic form generation from field definitions
- Type-safe with validation functions
- Category tagging (trend, momentum, mean-reversion, volatility, multi-symbol)
- Recommended date ranges per strategy
- Helper functions for symbol extraction

### ✅ Open Question #4: Data Gaps Handling
**Decision:** Option A - Transparent (Show User What Happened)

**Implementation:**
- Comprehensive gap analysis with categorization (weekend, holiday, missing, multi-symbol, unknown)
- Quality score calculation (0-100) based on problematic gaps
- Detailed gap information (location, reason, bars missing)
- Visual alert component with severity levels (excellent, good, warning, error)
- Modal with full gap details and recommendations
- Statistics by gap type (weekends, holidays, missing data)

**Status:** ✅ Complete

**Files Created:**
- `utils/gap-analysis.ts` - Gap detection and categorization
- `components/data/GapAnalysisAlert.svelte` - UI component for gap display
- Enhanced `services/data.ts` - Automatic gap analysis on data load

**Gap Analysis Features:**
- Detects and categorizes all gaps in time series
- Distinguishes expected gaps (weekends/holidays) from data quality issues
- Calculates quality score (weekends/holidays don't reduce score)
- Provides actionable recommendations
- Shows individual gap details with dates and reasons
- Timeline visualization of where gaps occurred

### ✅ Open Question #5: Parameter Validation Timing
**Decision:** Option C - Hybrid Validation

**Implementation:**
- Realtime warnings (300ms debounced) during parameter editing
- Hard errors on submit prevent invalid backtests
- Different severity levels per validation mode (error/warning/info)
- Field-level and strategy-level validation rules
- Visual feedback with ValidationMessage and ValidationSummary components

**Status:** ✅ Complete

**Files Created:**
- `lib/validation/types.ts` - Validation system types
- `lib/validation/engine.ts` - Core validation logic (pure functions)
- `lib/validation/store.svelte.ts` - Reactive validation store (Svelte 5)
- `lib/components/validation/ValidationMessage.svelte` - Field-level messages
- `lib/components/validation/ValidationSummary.svelte` - Form-level summary
- `lib/validation/index.ts` - Module exports
- `lib/validation/EXAMPLE-INTEGRATION.md` - Integration examples
- `lib/validation/README.md` - Complete documentation

### ✅ Open Question #6: Data Caching
**Decision:** Option C + D - Hybrid Memory + localStorage

**Implementation:**
- Two-tier caching: LRU memory cache (always active) + TTL-based localStorage (opt-in)
- Memory cache: Max 50 entries, O(1) access, LRU eviction
- Storage cache: Max 5MB, TTL per interval (daily: 24h, weekly: 7d, monthly: 30d)
- Promotion pattern: storage hits promoted to memory
- Auto-eviction when approaching size limits
- Gap analysis included in cached data

**Status:** ✅ Complete

**Files Created:**
- `lib/cache/types.ts` - Cache types (CachedData, CacheKey, CacheConfig)
- `lib/cache/memory-cache.ts` - In-memory LRU cache
- `lib/cache/storage-cache.ts` - localStorage cache with TTL
- `lib/cache/manager.ts` - Orchestrates memory + storage caches
- `lib/cache/index.ts` - Module exports
- `lib/cache/README.md` - Complete documentation
- Enhanced `lib/config/defaults.ts` - Added CACHE_CONFIG section
- Enhanced `lib/services/data.ts` - Integrated caching

### ✅ Open Question #7: Strategy Descriptions Source
**Decision:** Option C - Separate Markdown Files

**Implementation:**
- Each strategy has `.md` file in `lib/strategies/docs/`
- YAML frontmatter for metadata (id, description, category, tags, relatedStrategies)
- Structured sections: How It Works, When to Use, Strengths, Weaknesses, Examples, Parameters
- Dynamic import with `?raw` suffix, parsed on demand
- In-memory caching for parsed docs
- Helper functions for field help/tooltip extraction

**Status:** ✅ Complete

**Files Created:**
- `lib/strategies/docs/types.ts` - StrategyDocs and FieldDocs types
- `lib/strategies/docs/loader.ts` - Markdown parsing and loading (280 lines)
- `lib/strategies/docs/ma-crossover.md` - Complete MA Crossover docs (150 lines)
- `lib/strategies/docs/vix-hedge.md` - Complete VIX Hedge docs (190 lines)
- `lib/strategies/docs/*.md` - Stub docs for 5 other strategies
- `lib/strategies/docs/_TEMPLATE.md` - Copy-paste template for new strategies
- `lib/strategies/docs/README.md` - Documentation system guide

### ✅ Open Question #9: Parameter Presets
**Decision:** Option B - Single "Recommended" Preset

**Implementation:**
- Strategy defaults ARE the recommended preset
- PresetInfo interface with rich metadata (rationale, optimizedFor, expectedMetrics, suitableFor)
- Helper functions: getRecommendedParams(), resetToRecommended(), isUsingRecommended(), getPresetInfo()
- PresetInfo component displays rationale with "Reset to Recommended" button
- Expected metrics as ranges, not exact numbers
- Presets added to MA Crossover and VIX Hedge as examples

**Status:** ✅ Complete

**Files Created:**
- Enhanced `lib/strategies/types.ts` - Added PresetInfo interface and helpers
- Enhanced `lib/strategies/registry.ts` - Added preset metadata to strategies
- `lib/components/strategy/PresetInfo.svelte` - Visual preset display component
- `lib/strategies/PRESETS.md` - Preset system documentation

### ✅ Open Question #10: Custom Strategies
**Decision:** Option B - Code-Based Extension (with Web Worker sandboxing)

**Implementation:**
- CustomStrategyManager: CRUD operations, validation, localStorage persistence
- Web Worker execution: Sandboxed environment, 30-second timeout
- Pattern validation: Detects dangerous APIs (localStorage, fetch, eval, etc.)
- Three templates: Simple MA, RSI mean reversion, Empty boilerplate
- Import/export JSON for sharing strategies
- **CRITICAL SECURITY WARNING:** Arbitrary code execution with comprehensive security documentation

**Status:** ✅ Complete

**Files Created:**
- `lib/custom-strategies/types.ts` - Custom strategy types
- `lib/custom-strategies/manager.ts` - CRUD + validation (280 lines)
- `lib/custom-strategies/executor.worker.ts` - Web Worker for execution
- `lib/custom-strategies/executor.ts` - Wrapper with Promise API
- `lib/custom-strategies/templates.ts` - 3 strategy templates (350 lines)
- `lib/custom-strategies/index.ts` - Module exports
- `lib/custom-strategies/SECURITY.md` - **Comprehensive security documentation (400 lines)**
- `lib/custom-strategies/README.md` - Complete usage guide (500 lines)

### ✅ Open Question #11: Strategy Comparison
**Decision:** Option A - No Comparison (Single Strategy Focus)

**Implementation:**
- Users run one backtest at a time for clear, focused analysis
- No comparison table/chart overlay infrastructure needed
- Manual comparison via note-taking or browser tabs
- Data caching (Q6) enables fast parameter iteration
- Architecture decision documented with rationale and future evolution path

**Status:** ✅ Complete

**Files Created:**
- `packages/backtesting-ui/DECISIONS.md` - All architectural decisions with rationale
- `packages/backtesting-ui/SINGLE-STRATEGY-WORKFLOW.md` - Complete workflow guide
- Updated `docs/BACKTESTING-UI-CRITIQUE.md` - Marked Q11 as resolved

**Rationale:**
- ✅ Simplicity: Clear UX without comparison complexity
- ✅ MVP Speed: Ship faster without comparison infrastructure
- ✅ Focus: Deep analysis of single strategy before moving on
- ✅ Future-Proof: Comparison can be added later without breaking changes
- ❌ Trade-off: No side-by-side comparison (manual note-taking required)

---

## Section-by-Section Critique

### 1. Overview (Lines 10-26)

**Strengths:**
- Clear MVP scope
- Reasonable post-MVP items
- Good "out of scope" boundaries

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Missing validation in MVP | Validation is a core value prop of the backtesting package | Consider including `quickValidate()` in Phase 2 |
| No benchmark comparison | `compareToBenchmarks()` is ready to use | Add benchmark toggle in Phase 2 |
| Report export is "Post-MVP" | `generateBacktestReport()` exists now | Move to Phase 2 - it's trivial |

**Open Questions:**
1. Should validation scoring be MVP or post-MVP given the package fully supports it?
2. Is Monte Carlo simulation actually needed for MVP users, or is it analyst-only?

---

### 2. Design Principles (Lines 29-35)

**Strengths:**
- Correctly identifies crypto-viz as pattern source
- Web Workers for heavy ops is correct
- LocalStorage persistence matches existing pattern

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| "Copy ThreeColumnLayout" is misleading | ThreeColumnLayout is a **fixed composition** that hardcodes AppNav, ViewPanel, SettingsView - it's not a reusable layout component | Either: (a) Create a new flexible layout component, or (b) Copy the *pattern* but build new components |
| "Leverage shared-ui" understates availability | shared-ui has 17 components, not just "Button, Spinner, Toast" | Document: `Card`, `Modal`, `ConfirmDialog`, `AlertDialog`, `DialogProvider`, `IconButton`, `Tooltip`, `EmptyState`, `Skeleton`, `LazyLoad`, `ErrorBoundary`, `FinancialChart`, `LineChart`, `RefreshButton` |
| No mention of Svelte 5 migration | crypto-viz uses Svelte 5 (`$props()`, `$state`, `$derived`, `$effect`) | All examples should use Svelte 5 syntax |

**Open Questions:**
3. Should we extract a truly reusable `FlexibleThreeColumnLayout` component into shared-ui?
4. Is the 280px right panel width optimal for backtest settings (more fields than crypto-viz)?

---

### 3. Architecture (Lines 39-67)

**Strengths:**
- Clean directory structure
- Correct workspace package references
- Reasonable component count estimate (~20)

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Missing `/api/proxy` route | data-layer requires proxy for client-side requests | Add `src/routes/api/proxy/[...provider]/+server.ts` like macro-view |
| No `+layout.svelte` mentioned | Global layout needed for DialogProvider, Toast | Add layout with `<DialogProvider>`, `<Toast position="bottom-right" />` |
| "Single store file" may not scale | With optimization + validation + benchmark results, state grows complex | Consider 3-4 focused stores: `ui.ts`, `backtest.ts`, `optimization.ts`, `validation.ts` |
| Workers directory only has optimizer | Monte Carlo and walk-forward are also CPU-intensive | Plan for `monte-carlo.worker.ts` and `walk-forward.worker.ts` |

**Open Questions:**
5. Should API proxy routes match macro-view's structure exactly for consistency?
6. Is a single page with mode switching the right UX, or should modes be separate routes (`/backtest`, `/optimize`, `/validate`)?
7. How will web workers handle the `Strategy` class serialization problem beyond just optimization?

---

### 4. Strategy Registry (Lines 70-111)

**Strengths:**
- Good concept for dynamic form generation
- Field type system is sensible
- Type-safe with `as const`

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Only 2 strategies listed | Package exports 7 strategies: MACrossover, RSIReversion, BuyAndHold, VIXHedge, BollingerBreakout, MACDDivergence, PairsTrading | Add all 7 to registry |
| VIXHedge is multi-symbol | Registry assumes single `symbol` field | Add `symbols: string[]` field type and multi-symbol support |
| Missing parameter constraints | Some strategies have interdependencies (e.g., slowPeriod > fastPeriod) | Add `validation?: (params) => string | null` to registry |
| No description/help text | Users won't know what strategies do | Add `description` and per-field `help` text |
| Field types incomplete | Missing: `number` (plain input), `select` (dropdown with options), `date` | Expand field type union |

**Example Improved Registry Entry:**
```typescript
'vix-hedge': {
  name: 'VIX Hedge Strategy',
  description: 'Reduces exposure when VIX exceeds threshold, re-enters when volatility subsides',
  create: (p: VIXHedgeParams) => new VIXHedgeStrategy(p),
  defaults: {
    tradingSymbol: 'TQQQ',
    vixSymbol: '^VIX',
    vixExitThreshold: 25,
    vixEntryThreshold: 20,
    // ... etc
  },
  fields: [
    { key: 'tradingSymbol', type: 'symbol', label: 'Trading Symbol', help: 'Symbol to trade' },
    { key: 'vixSymbol', type: 'symbol', label: 'VIX Symbol', help: 'VIX index symbol' },
    { key: 'vixExitThreshold', type: 'slider', min: 15, max: 50, step: 1, label: 'Exit Threshold' },
    // ... etc
  ],
  validation: (p) => p.vixEntryThreshold >= p.vixExitThreshold
    ? 'Entry threshold must be below exit threshold'
    : null,
}
```

**Open Questions:**
8. Should PairsTrading be included in MVP given its complexity (two correlated symbols)?
9. How should multi-symbol strategies display their results differently?
10. Should field validation run on change or only on submit?

---

### 5. Components (Lines 115-140)

**Strengths:**
- Reasonable component breakdown
- lightweight-charts is a good choice for EquityCurve/PriceChart
- d3 for Heatmap is appropriate

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| MetricsGrid shows only 6 metrics | `PerformanceMetrics` has 25+ fields | Add expandable "Advanced Metrics" section |
| No DrawdownChart component | Drawdown visualization is critical for risk assessment | Add `DrawdownChart.svelte` showing underwater curve |
| TradeLog missing pagination | Strategies can generate 1000+ trades | Add pagination or virtual scrolling |
| No MonteCarloDistribution chart | Monte Carlo output has distribution data | Add `DistributionChart.svelte` for histograms |
| EquityCurve "trade markers" unclear | How will entry/exit be shown on equity curve? | Specify marker implementation (icons? colors?) |

**Missing Components (add to plan):**
- `DrawdownChart.svelte` - Underwater equity curve
- `DistributionChart.svelte` - Histogram for Monte Carlo results
- `ValidationScore.svelte` - Score gauge with pass/fail indicators
- `WalkForwardTimeline.svelte` - Visual timeline of in/out sample periods
- `BenchmarkComparison.svelte` - Side-by-side strategy vs benchmark metrics
- `StrategyDescription.svelte` - Rich text description of selected strategy

**Open Questions:**
11. Should charts use lightweight-charts (trading-focused) or shared-ui's `FinancialChart` (Chart.js)?
12. What's the maximum expected trade count, and do we need virtual scrolling?
13. Should the heatmap be 2D (two params) or support N-dimensional parameter visualization?

---

### 6. State Management (Lines 143-177)

**Strengths:**
- Mirrors crypto-viz pattern correctly
- LocalStorage persistence pattern is correct
- Derived stores concept is sound

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Uses Svelte 4 syntax | Plan shows `writable()` but crypto-viz uses Svelte 5 `$state` in some places | Clarify: are we using Svelte 4 stores or Svelte 5 runes? |
| `strategyParams` is `Record<string, any>` | Loses type safety | Use discriminated union or per-strategy param types |
| No validation results store | Plan only has `backtestResult` and `optimizationResult` | Add `validationResult`, `monteCarloResult`, `walkForwardResult`, `benchmarkResult` |
| No history/undo | Users may want to compare runs | Consider `runHistory: BacktestResult[]` with limit |
| No loading states per operation | Single `isRunning` doesn't distinguish operations | Use `loadingState: { backtest: boolean, optimize: boolean, validate: boolean }` |

**Improved Store Example:**
```typescript
// stores/backtest.ts
import { writable, derived } from 'svelte/store';

export const backtestResult = writable<BacktestResult | null>(null);
export const validationResult = writable<ValidationOutput | null>(null);
export const monteCarloResult = writable<MonteCarloOutput | null>(null);
export const benchmarkResults = writable<BenchmarkComparison[] | null>(null);

export const loadingState = writable({
  backtest: false,
  optimize: false,
  validate: false,
  monteCarlo: false,
});

export const isAnyLoading = derived(loadingState, $s =>
  Object.values($s).some(Boolean)
);

// History for comparison
export const runHistory = writable<BacktestResult[]>([]);
export const MAX_HISTORY = 10;
```

**Open Questions:**
14. Svelte 4 stores vs Svelte 5 runes - which is the project standard going forward?
15. Should run history persist to localStorage or just be session-based?
16. How large can optimization results get, and should we worry about localStorage limits?

---

### 7. UI Layout (Lines 180-198)

**Strengths:**
- Visual diagram is helpful
- Mode-based content switching is clear
- Column widths match crypto-viz

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Left panel is too narrow for strategy list | 200px only fits ~15 chars per strategy name | Consider 240px or collapsible with icons |
| No mobile/responsive consideration | 3-column layout breaks on small screens | Add responsive breakpoints or mobile-first design |
| Mode tabs placement unclear | Are tabs in left panel header or content area? | Specify exact location with wireframe |
| Validate mode content is vague | "Score gauge, WF timeline" needs more detail | Add wireframe for validation view |

**Open Questions:**
17. Is responsive design in scope for MVP?
18. Should the left panel support collapsing to icons-only on smaller screens?
19. What happens when switching modes while a backtest is running?

---

### 8. Services (Lines 201-231)

**Strengths:**
- Correct BacktestEngine import
- Web Worker pattern is appropriate

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| `backtest.ts` hardcodes initialCapital | Should use store value | Pass `$config.initialCapital` to engine |
| No data fetching service | How is `BacktestData` obtained? | Add `data.ts` service wrapping `loadBacktestData()` from backtesting package |
| Worker example is strategy-specific | Hardcodes `MACrossoverStrategy` | Use strategy registry factory pattern in worker |
| No validation service | Validation has multiple functions | Add `validation.ts` wrapping `validateStrategy()`, `quickValidate()` |
| No error handling shown | What if backtest fails? | Show error handling pattern with toastStore |

**Missing Services:**
```typescript
// services/data.ts
import { loadBacktestData, type DataLoaderConfig } from '@one-love-wealth/backtesting';

export async function fetchBacktestData(symbols: string[], period: string): Promise<BacktestData> {
  const config: DataLoaderConfig = {
    symbols,
    period,
    interval: '1d',
    gapFillStrategy: 'forward-fill',
  };
  const result = await loadBacktestData(config);
  return result.data;
}

// services/validation.ts
import { validateStrategy, quickValidate, type ValidationConfig } from '@one-love-wealth/backtesting';

export async function runValidation(strategy: Strategy, data: BacktestData, config?: ValidationConfig) {
  return validateStrategy(strategy, data, config);
}

export async function runQuickValidation(strategy: Strategy, data: BacktestData) {
  return quickValidate(strategy, data);
}
```

**Open Questions:**
20. How should the UI handle partial data (e.g., VIX data unavailable for early dates)?
21. Should data fetching show progress, or is it fast enough to just show a spinner?
22. How do we handle web worker errors gracefully?

---

### 9. Dependencies (Lines 234-249)

**Strengths:**
- Correct workspace references
- lightweight-charts version is current
- d3 for heatmap is appropriate

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Missing `@tailwindcss/forms` | Form inputs need styling | Add to devDependencies |
| No date picker library | Date range selection needs UI | Add `date-fns` or similar |
| Consider `@tanstack/svelte-virtual` | For trade log virtualization | Add if trade counts are large |
| Missing testing deps | No test libraries listed | Add `vitest`, `@testing-library/svelte` |

**Open Questions:**
23. Should we use lightweight-charts for all charts, or mix with Chart.js from shared-ui?
24. Is date-fns overkill, or is native Date sufficient?

---

### 10. Implementation Phases (Lines 252-298)

**Strengths:**
- Phased approach is sensible
- Phase 1 MVP is achievable
- Clear "Done" criteria per phase

**Issues:**

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| Phase 1 time estimate (15h) seems low | Building 7 components + services + store from scratch | More realistic: 20-25h |
| "Data loading (hardcoded SPY for now)" | This is a significant limitation | Allow symbol selection in Phase 1 |
| Phase 2 missing quick validation | `quickValidate()` is lightweight | Add to Phase 2 |
| Phase 3 missing walk-forward | WF analysis is a key differentiator | Include WF in Phase 3 or add Phase 3.5 |
| No explicit benchmark phase | `compareToBenchmarks()` ready to use | Add to Phase 2 or 3 |

**Revised Phase Suggestions:**

**Phase 1: MVP (20-25h)**
- Scaffold + Layout + 2 strategies (MA Crossover, Buy & Hold)
- Symbol selector (not hardcoded) + date range
- EquityCurve + MetricsGrid (6 metrics)
- Basic TradeLog (no pagination)

**Phase 2: Polish + Validation (15-18h)**
- PriceChart with trade markers
- Full MetricsGrid (expandable)
- TradeLog pagination
- All 7 strategies
- `quickValidate()` integration
- LocalStorage persistence
- Benchmark comparison (Buy & Hold)

**Phase 3: Optimization (16-20h)**
- Web Worker for optimization
- Parameter range editor
- TopResults table
- Heatmap (2D)
- Apply best params flow

**Phase 4: Advanced Validation (12-15h)**
- Full `validateStrategy()` with config
- Monte Carlo simulation + distribution chart
- Walk-forward analysis + timeline
- Validation score component
- Report export (MD/HTML)

**Open Questions:**
25. Are the time estimates based on working hours or calendar days?
26. Who is the target user - quantitative analysts or casual traders?
27. Should Phase 1 support backtesting without a live data connection (mock data mode)?

---

### 11. Open Questions (Lines 301-304)

The plan lists only 2 open questions. Here's an expanded list:

---

## Full Open Questions List

### Data & Symbols
1. ~~**Symbol list source** - Hardcode common symbols OR fetch from data-layer's available symbols?~~ ✅ **RESOLVED** → Hybrid (C): 50 curated symbols + external APIs (Yahoo/CoinGecko). Implementation in `data-layer/src/symbols/`
2. ~~**Date range default** - Last 5 years? Configurable? Dependent on data availability?~~ ✅ **RESOLVED** → 5 years default with presets (1y, 3y, 5y, 10y, 20y, max) + config file. Implementation in `lib/config/defaults.ts` + localStorage persistence
3. ~~**Multi-symbol strategies** - How to handle VIXHedge (requires trading symbol + VIX)?~~ ✅ **RESOLVED** → Dynamic fields + smart defaults (A+B): VIXHedge hides vixSymbol in advanced settings with ^VIX default. PairsTrading shows both. Implementation in `lib/strategies/`
4. ~~**Data gaps** - How to handle missing data points (weekends, holidays)?~~ ✅ **RESOLVED** → Transparent (A): Show what happened with gap analysis, quality scoring, categorization (weekend/holiday/missing). Implementation in `lib/utils/gap-analysis.ts` + GapAnalysisAlert component
5. **Data loading indicator** - Progress bar or just spinner?
6. ~~**Data caching** - Cache fetched data in localStorage to avoid re-fetching?~~ ✅ **RESOLVED** → Hybrid (C+D): Smart session cache (memory, always active) + optional persistent cache (localStorage with TTL, opt-in). Implementation in `lib/cache/` with memory-cache, storage-cache, and manager. Auto-eviction, LRU, different TTLs per interval.

### Strategy & Parameters
7. ~~**Strategy descriptions** - Where does help text come from?~~ ✅ **RESOLVED** → Separate markdown files (C): Each strategy has `.md` file in `lib/strategies/docs/` with frontmatter (id, description, tags) + sections (How It Works, Strengths, Weaknesses, Examples, Parameters). Loader parses markdown, caches parsed docs, provides getFieldHelp/getFieldTooltip helpers. Template provided for creating new docs.
8. ~~**Parameter validation** - Real-time or on-submit?~~ ✅ **RESOLVED** → Hybrid (C): Soft realtime warnings (yellow, 300ms debounced) + hard submit errors (red, blocking). Implementation in `lib/validation/` with engine, store, and UI components.
9. ~~**Parameter presets** - Should we offer "Conservative", "Aggressive" presets?~~ ✅ **RESOLVED** → Single "Recommended" preset (B): Strategy defaults ARE the recommended preset with PresetInfo metadata (rationale, optimizedFor, expectedMetrics, suitableFor). Helper functions: getRecommendedParams(), resetToRecommended(), isUsingRecommended(). PresetInfo component shows rationale + reset button. Presets added to MA Crossover and VIX Hedge as examples.
10. ~~**Custom strategies** - Is "out of scope" firm, or might advanced users want it?~~ ✅ **RESOLVED** → Code-based extension (B): Users can write JavaScript/TypeScript strategies executed in sandboxed Web Workers. Includes CustomStrategyManager (CRUD, validation, localStorage), executor with 30s timeout, 3 templates (MA, RSI, empty), import/export JSON. **CRITICAL:** Comprehensive SECURITY.md documenting risks, mitigations, and best practices. Custom strategies are powerful but require careful security measures in production.
11. ~~**Strategy comparison** - Can users run multiple strategies on same data?~~ ✅ **RESOLVED** → No comparison (A): Single-strategy focus. Users run one backtest at a time for clear, focused analysis. No comparison table/chart overlays needed. Manual comparison via note-taking or browser tabs. Data caching (Q6) enables fast re-runs with different parameters. See `backtesting-ui/DECISIONS.md` and `SINGLE-STRATEGY-WORKFLOW.md` for rationale and usage guide. Future-proof: Comparison can be added later without breaking single-strategy workflow.

### UI/UX
12. ~~**Layout flexibility** - Is ThreeColumnLayout truly the right pattern, or do we need more flexibility?~~ ✅ **RESOLVED** → Copy crypto-viz pattern (A): Don't over-engineer for MVP. Copy layout pattern and adapt for backtesting needs.
13. ~~**Right panel width** - 280px enough for backtest config + strategy params?~~ ✅ **RESOLVED** → Resizable with drag handle (C): Flexibility for different strategies. Some need more space, some less. Let users adjust.
14. ~~**Mode switching behavior** - What happens to results when switching modes?~~ ✅ **RESOLVED** → Clear results on mode switch (A): Simple, no confusion. Clean slate prevents stale data display.
15. ~~**Responsive design** - Is mobile/tablet support needed?~~ ✅ **RESOLVED** → Desktop-only for MVP (A): Backtesting is analyst tool, typically desktop workflow. Show min-width warning on mobile.
16. ~~**Dark mode** - Is the shared-ui dark theme the only theme?~~ ✅ **RESOLVED** → Dark mode only (A): Matches crypto-viz. Trading tools typically dark. Add toggle post-MVP if requested.
17. ~~**Keyboard shortcuts** - Should there be shortcuts (Cmd+Enter to run)?~~ ✅ **RESOLVED** → Basic shortcuts (B): Enter to run backtest (when params valid), Esc to close dialogs/cancel operations.

### State & Persistence
18. ~~**Store architecture** - Single store vs multiple focused stores?~~ ✅ **RESOLVED** → Multiple focused stores (B): Clear separation of concerns (strategy, config, backtest, optimization, ui stores). Better performance, easier to test. See `backtesting-ui/src/lib/stores/`.
19. ~~**Svelte version** - Svelte 4 stores or Svelte 5 runes?~~ ✅ **RESOLVED** → Svelte 5 runes (A): Matches crypto-viz, future-proof, better DX. All components use `$state`, `$derived`, `$effect`. Store files use `.svelte.ts` extension.
20. ~~**Run history** - Should we keep history of past runs?~~ ✅ **RESOLVED** → Last 10 runs in localStorage (C): Persistent history enables manual comparison workflow from Q11. Store compressed, show in "Recent Results" list.
21. ~~**localStorage limits** - Optimization results could be large; how to handle?~~ ✅ **RESOLVED** → Store compressed (C): gzip compression before localStorage. 5-10x space savings. Size monitoring and auto-eviction.
22. ~~**Session vs persistent** - Which state survives browser close?~~ ✅ **RESOLVED** → Config only (B): Persist symbols, dates, interval, gap-fill, capital. Don't persist strategy selection or results. Clean slate for analysis.

### Results & Visualization
23. ~~**Chart library choice** - lightweight-charts vs Chart.js (shared-ui)?~~ ✅ **RESOLVED** → lightweight-charts + d3 (A): Trading-focused charts with built-in trade markers. Professional appearance. ~250KB bundle. d3 for heatmaps. See `DECISIONS.md` Q23.
24. ~~**Trade log scale** - Expected max trades? Need virtual scrolling?~~ ✅ **RESOLVED** → No pagination for MVP (C): Show all trades in scrollable list. Most strategies <500 trades. Add pagination/virtualization post-MVP if needed.
25. ~~**Metrics display** - Which 6 metrics are "core"? Expandable for 25+?~~ ✅ **RESOLVED** → Standard six metrics (A): Total Return, Sharpe, Max DD, Win Rate, Total Trades, CAGR. Expandable "Advanced Metrics" section for remaining 19+ metrics.
26. ~~**Heatmap dimensions** - 2D (two params) or N-dimensional?~~ ✅ **RESOLVED** → 2D only (A): Two parameters (X/Y axis), color represents objective. Standard optimization visualization. Most strategies have 2-3 key params.
27. ~~**Drawdown visualization** - Separate chart or overlay on equity curve?~~ ✅ **RESOLVED** → Both with toggle (C): Toggle between separate underwater chart and overlay on equity curve. User preference persists in localStorage.

### Optimization & Validation
28. ~~**Optimization methods** - All 3 (grid, random, genetic) in MVP, or just grid?~~ ✅ **RESOLVED** → All three methods (C): Grid Search (exhaustive), Random Search (sampling), Genetic Algorithm (evolutionary). User selects method. All have different strengths.
29. ~~**Optimization objective** - User-selectable (Sharpe, Sortino, Return)?~~ ✅ **RESOLVED** → Three common objectives (B): Sharpe Ratio (default), Sortino Ratio, Total Return. Dropdown selector. Covers 95% of use cases.
30. ~~**Walk-forward in scope?** - It's powerful but complex to visualize~~ ✅ **RESOLVED** → Yes, in MVP (B): Third mode (backtest, optimize, walk-forward). 60% in-sample, 40% out-of-sample. Rolling windows. Timeline visualization. **NOTE:** Ambitious scope addition - consider high priority after basic backtest+optimize.
31. ~~**Monte Carlo simulations** - Default count (1000)? Configurable?~~ ✅ **RESOLVED** → Not in MVP (A): Phase 4 feature. Focus MVP on backtest, optimize, and walk-forward. Monte Carlo is advanced probabilistic analysis.
32. ~~**Validation scoring** - Show pass/fail or full score breakdown?~~ ✅ **RESOLVED** → Not in MVP (A): Phase 4 with Monte Carlo. Walk-forward (Q30) provides validation. Full validation system is Phase 4.

### Integration
33. ~~**API proxy setup** - Copy from macro-view verbatim?~~ ✅ **RESOLVED** → Copy macro-view pattern (A): Single file at `src/routes/api/proxy/[...provider]/+server.ts`. Provider whitelist (yahoo, coingecko, fred). Proven, simple, secure. See `DECISIONS.md` Q33.
34. ~~**Error handling** - Toast for all errors, or modal for critical ones?~~ ✅ **RESOLVED** → Context-appropriate (C): Toast for minor errors, modal for critical errors, inline for validation. Use shared-ui components.
35. ~~**Loading states** - Per-operation or global?~~ ✅ **RESOLVED** → Both global + per-operation (C): Global indicator in header (something happening), per-operation loader in panels (what is happening). Stores have per-operation state.
36. ~~**Web worker communication** - Progress updates during optimization?~~ ✅ **RESOLVED** → Progress bar + iteration count (C): Show percentage, current/total iterations, message. Optimization takes 30+ seconds, needs feedback.

### Testing & Quality
37. **Test coverage** - Unit tests for services? E2E for critical flows?
38. **Accessibility** - ARIA labels? Keyboard navigation?
39. **Performance targets** - Max acceptable time for backtest? Optimization?

### Future Considerations
40. **Live trading path** - If we ever add live trading, how would backtest UI integrate?
41. **Strategy sharing** - Could users export/import strategy configs?
42. **Alerts/notifications** - Notify when long-running optimization completes?

---

## Recommendations Summary

### High Priority (Address Before Implementation)
1. Clarify ThreeColumnLayout reusability - it's NOT a reusable component
2. Decide Svelte 4 vs Svelte 5 patterns
3. Add data loading service (not just "hardcoded SPY")
4. Include all 7 strategies in registry
5. Plan for multi-symbol strategies (VIXHedge)

### Medium Priority (Address During Implementation)
6. Add validation service wrapping package functions
7. Split stores into focused modules
8. Add missing components (DrawdownChart, ValidationScore, etc.)
9. Implement proper error handling with toastStore
10. Add pagination/virtualization for TradeLog

### Low Priority (Polish Phase)
11. Responsive design
12. Keyboard shortcuts
13. Run history comparison
14. Report export

---

## Appendix: Actual Package Exports

For reference, here's what `@one-love-wealth/backtesting` actually exports:

**Strategies (7):**
- `MACrossoverStrategy`
- `RSIReversionStrategy`
- `BuyAndHoldStrategy`
- `VIXHedgeStrategy`
- `BollingerBreakoutStrategy`
- `MACDDivergenceStrategy`
- `PairsTradingStrategy`

**Testing Framework:**
- `optimizeStrategy()` - Parameter optimization
- `validateStrategy()` - Full validation
- `quickValidate()` - Fast validation
- `walkForwardAnalysis()` - Walk-forward testing
- `monteCarloSimulation()` - Monte Carlo
- `compareToBenchmarks()` - Benchmark comparison
- `generateReport()` - Report generation
- `generateBacktestReport()` - Backtest-only report

**Data Loading:**
- `loadBacktestData()` - Multi-symbol data loading
- `loadSymbol()` - Single symbol loading

**Types (key ones):**
- `BacktestResult`
- `PerformanceMetrics` (25+ fields)
- `ValidationOutput` (includes score 0-100)
- `OptimizationOutput`
- `MonteCarloOutput`
- `WalkForwardOutput`
- `BenchmarkComparison`

# Architecture Decisions

This document records key architectural decisions made during the development of the backtesting UI.

## Question 11: Strategy Comparison (2026-01-02)

**Decision:** Option A - No Comparison (Single Strategy Focus)

**Context:**
Should users be able to run multiple strategies simultaneously on the same data for comparison?

**Options Considered:**
- A. No comparison - one at a time ✅ **SELECTED**
- B. Sequential comparison - run multiple, wait for all
- C. Parallel comparison - run multiple simultaneously
- D. Batch with saved results - save results for later comparison
- E. Hybrid sequential + caching - sequential with foundation for parallel

**Rationale:**
- **Simplicity:** Single-strategy focus keeps UI clean and mental model clear
- **MVP Speed:** No comparison infrastructure needed (tables, overlays, result storage)
- **Performance:** No parallel execution complexity or resource contention
- **Future-Proof:** Can add comparison later without breaking single-strategy workflow

**Implementation:**
- Single backtest execution at a time
- No comparison UI components
- No result storage beyond data caching (Question 6)
- Clear workflow: Select strategy → Configure → Run → Analyze

**Future Considerations:**
If comparison is needed later:
1. Add result storage layer (extend data cache)
2. Add comparison table component
3. Add chart overlay support
4. Add "Compare with..." button to results
5. Consider Option E (Hybrid) as next evolution

**Trade-offs Accepted:**
- ❌ Cannot compare strategies side-by-side without manual note-taking
- ❌ Must re-run strategies to compare (but data cache helps)
- ✅ Simpler codebase and faster development
- ✅ Lower cognitive load for users
- ✅ Easier to debug and maintain

---

## Question 19: Svelte Version Strategy (2026-01-02)

**Decision:** Option A - Svelte 5 Runes

**Context:**
Should the backtesting UI use Svelte 4 stores or Svelte 5 runes for state management?

**Options Considered:**
- A. Svelte 5 Runes ✅ **SELECTED**
- B. Svelte 4 Stores (writable/derived/readable)
- C. Hybrid (mix runes + stores)

**Rationale:**
- **Consistency:** crypto-viz already uses Svelte 5, validation system (Q5) uses Svelte 5
- **Future-proof:** Svelte 5 is the framework's direction
- **Better DX:** Less boilerplate, better TypeScript inference
- **Already committed:** Validation system built with `.svelte.ts` files and runes

**Implementation:**
- All components use `$state`, `$derived`, `$effect`
- Store files use `.svelte.ts` extension (not `.ts`)
- No `writable()`, `derived()`, `readable()` imports from 'svelte/store'
- Auto-subscriptions work naturally with `$` prefix in templates

**Example:**
```typescript
// stores/backtest.svelte.ts
export let backtestResult = $state<BacktestResult | null>(null);
export let isRunning = $state(false);
export const hasResult = $derived(backtestResult !== null);

// Component.svelte
<script lang="ts">
  import { backtestResult, isRunning } from './stores/backtest.svelte';

  let localState = $state(0);
  let computed = $derived(localState * 2);
</script>

{#if isRunning}
  <Spinner />
{:else if backtestResult}
  <ResultsView result={backtestResult} />
{/if}
```

**Trade-offs Accepted:**
- ❌ Less Stack Overflow examples (newer API)
- ✅ Consistent with project patterns
- ✅ Less boilerplate code
- ✅ Better reactivity

---

## Question 18: Store Architecture (2026-01-02)

**Decision:** Option B - Multiple Focused Stores

**Context:**
How should we organize state management? Single monolithic store or multiple focused stores?

**Options Considered:**
- A. Single Store (monolithic with all state)
- B. Multiple Focused Stores ✅ **SELECTED**
- C. Domain-Grouped Stores (middle ground)

**Rationale:**
- **Clear Responsibility:** Each store has one job
- **Performance:** Components only react to relevant changes
- **Testability:** Easy to test individual stores
- **Scalability:** Easy to add new stores as features grow
- **Consistency:** Matches crypto-viz pattern and validation system (Q5)

**Implementation:**
```
stores/
├── strategy.svelte.ts      # Selected strategy + params
├── config.svelte.ts        # Backtest config (symbols, dates, interval)
├── backtest.svelte.ts      # Backtest execution + results
├── optimization.svelte.ts  # Optimization execution + results
├── validation.svelte.ts    # Validation execution + results (from Q5)
├── ui.svelte.ts            # UI state (mode, sidebar, dialogs)
└── index.ts                # Re-exports all stores
```

**Store Responsibilities:**
- **strategy.svelte.ts:** Selected strategy ID, parameters, derived strategy instance
- **config.svelte.ts:** Symbols, date ranges, interval, gap-fill strategy, initial capital
- **backtest.svelte.ts:** Backtest result, execution state, errors
- **optimization.svelte.ts:** Optimization result, execution state, parameter ranges
- **validation.svelte.ts:** Validation result, execution state (already exists from Q5)
- **ui.svelte.ts:** Current mode (backtest/optimize/validate), sidebar state, dialogs

**Example Usage:**
```typescript
// Component only imports what it needs
<script lang="ts">
  import { selectedStrategy, params } from '$lib/stores/strategy.svelte';
  import { result, isRunning } from '$lib/stores/backtest.svelte';
  import { mode } from '$lib/stores/ui.svelte';

  // Component only re-renders when these specific values change
</script>
```

**Trade-offs Accepted:**
- ❌ Multiple imports in components (but explicit and clear)
- ❌ More files to maintain
- ✅ Clear separation of concerns
- ✅ Better performance (targeted reactivity)
- ✅ Easier to test and maintain

---

## Question 23: Chart Library Choice (2026-01-02)

**Decision:** Option A - lightweight-charts + d3

**Context:**
Which charting library should we use for equity curves, price charts, and optimization visualizations?

**Options Considered:**
- A. lightweight-charts + d3 ✅ **SELECTED**
- B. Chart.js (via shared-ui FinancialChart)
- C. Hybrid (lightweight-charts + d3)
- D. Chart.js + d3

**Rationale:**
- **Consistency:** Matches crypto-viz pattern (users familiar with style)
- **Trading-focused:** Built specifically for financial charts
- **Performance:** Handles 1000+ data points smoothly
- **Trade markers:** Built-in support for entry/exit visualization
- **Professional:** Looks like TradingView charts
- **Accept d3:** Heatmaps need d3 regardless of line chart library

**Implementation:**

**Chart Breakdown:**
- **Equity Curve:** lightweight-charts line series with trade markers
- **Price Chart:** lightweight-charts candlestick or line series
- **Drawdown Chart:** lightweight-charts area series (underwater curve)
- **Optimization Heatmap:** d3 custom implementation
- **Distribution Chart:** d3 or lightweight-charts histogram

**Example - Equity Curve with Trade Markers:**
```typescript
import { createChart } from 'lightweight-charts';

const chart = createChart(container, {
  layout: { background: { color: '#1e1e1e' }, textColor: '#d1d4dc' },
  timeScale: { timeVisible: true, secondsVisible: false },
});

const lineSeries = chart.addLineSeries({
  color: '#2962ff',
  lineWidth: 2,
});

// Equity data
lineSeries.setData(equity.map(e => ({
  time: e.timestamp / 1000, // Unix timestamp in seconds
  value: e.value,
})));

// Trade markers
lineSeries.setMarkers(trades.map(t => ({
  time: t.time / 1000,
  position: t.type === 'entry' ? 'belowBar' : 'aboveBar',
  color: t.type === 'entry' ? '#00ff00' : '#ff0000',
  shape: t.type === 'entry' ? 'arrowUp' : 'arrowDown',
  text: t.type === 'entry' ? 'Buy' : 'Sell',
})));
```

**Bundle Size:**
- lightweight-charts: ~200KB minified
- d3 (heatmap modules only): ~50KB minified
- Total: ~250KB for all charting

**Trade-offs Accepted:**
- ❌ Larger bundle than Chart.js alone (~250KB vs ~70KB)
- ❌ Two charting libraries to maintain
- ✅ Professional trading charts
- ✅ Excellent performance with large datasets
- ✅ Built-in trade markers
- ✅ Consistent with crypto-viz

---

## Question 33: API Proxy Setup (2026-01-02)

**Decision:** Option A - Copy macro-view Pattern

**Context:**
How should we implement the API proxy for client-side data requests? data-layer requires a proxy to fetch from Yahoo Finance and CoinGecko (CORS restrictions).

**Options Considered:**
- A. Copy macro-view pattern exactly ✅ **SELECTED**
- B. Direct integration (no proxy, server-only)
- C. Custom proxy with caching
- D. Environment-based routing

**Rationale:**
- **Proven:** Already working in production (macro-view)
- **Simple:** Single file, ~40 lines of code
- **Consistent:** Same pattern across all apps
- **Secure:** Provider whitelist prevents abuse
- **Zero friction:** data-layer auto-detects and uses proxy

**Implementation:**

**File Structure:**
```
src/routes/
└── api/
    └── proxy/
        └── [...provider]/
            └── +server.ts
```

**Proxy Features:**
- Provider whitelist (yahoo, coingecko, fred)
- URL validation
- Proper error handling
- User-Agent header
- JSON response forwarding

**Usage:**
```typescript
// Client-side - data-layer automatically uses proxy
import { loadBacktestData } from '@one-love-wealth/backtesting';

const data = await loadBacktestData({
  symbols: ['SPY'],
  period: '5y',
  interval: '1d',
});
// data-layer detects browser environment
// Internally calls: GET /api/proxy/yahoo?url=https://query1.finance.yahoo.com/...
```

**Security Measures:**
- ✅ Provider whitelist (only allowed providers)
- ✅ URL format validation
- ✅ No parameter injection
- ✅ Proper error codes (400, 403, 502)
- ✅ No sensitive data exposure

**Trade-offs Accepted:**
- ❌ No caching at proxy level (but data-layer has caching from Q6)
- ✅ Simple and maintainable
- ✅ Proven in production
- ✅ Zero configuration needed

---

## Question 12: Layout Flexibility (2026-01-02)

**Decision:** Option A - Copy crypto-viz Pattern

**Context:** ThreeColumnLayout in crypto-viz is hardcoded, not reusable as-is.

**Rationale:** Don't over-engineer for MVP. Copy the layout pattern and adapt for backtesting needs.

---

## Question 13: Right Panel Width (2026-01-02)

**Decision:** Option C - Resizable with Drag Handle

**Context:** crypto-viz uses 280px, but backtest has more strategy parameters.

**Rationale:** Flexibility for different strategies. Some need more space, some less. Let users adjust.

---

## Question 14: Mode Switching Behavior (2026-01-02)

**Decision:** Option A - Clear Results on Mode Switch

**Context:** What happens to results when switching modes (backtest → optimize)?

**Rationale:** Simple, no confusion. Clean slate prevents stale data display. Users can re-run if needed.

---

## Question 15: Responsive Design (2026-01-02)

**Decision:** Option A - Desktop-Only for MVP

**Context:** 3-column layout breaks on mobile/tablet.

**Rationale:** Backtesting is analyst tool, typically desktop workflow. Show min-width warning on mobile.

---

## Question 16: Dark Mode (2026-01-02)

**Decision:** Option A - Dark Mode Only

**Context:** Theme strategy.

**Rationale:** Matches crypto-viz. Trading tools typically dark. Add toggle post-MVP if requested.

---

## Question 17: Keyboard Shortcuts (2026-01-02)

**Decision:** Option B - Basic Shortcuts

**Context:** Should there be keyboard shortcuts?

**Implementation:**
- Enter to run backtest (when params valid)
- Esc to close dialogs/cancel operations

**Rationale:** Low effort, high value. Power users appreciate keyboard navigation.

---

## Question 20: Run History (2026-01-02)

**Decision:** Option C - Last 10 Runs in localStorage

**Context:** Should we keep history of past backtest runs?

**Implementation:**
- Store last 10 backtest results in localStorage (compressed)
- Show in "Recent Results" list
- Click to view past result
- Enables manual comparison (no comparison UI from Q11, but users can review history)

**Rationale:** Persistent history enables comparison workflow from Q11 (manual note-taking). Users can review past runs without re-running.

---

## Question 21: localStorage Size Limits (2026-01-02)

**Decision:** Option C - Store Compressed

**Context:** Optimization results can be large (1000+ parameter combinations).

**Implementation:**
- gzip compression before localStorage
- Decompress on read
- Size monitoring and auto-eviction if approaching limits

**Rationale:** Compression gives 5-10x space savings. Enables storing more results without hitting browser limits.

---

## Question 22: Session vs Persistent State (2026-01-02)

**Decision:** Option B - Config Only

**Context:** What state survives browser close?

**Implementation:**
- Persist: symbols, date ranges, interval, gap-fill strategy, initial capital
- Don't persist: selected strategy, params, results

**Rationale:** Config is tedious to re-enter. Strategy selection is quick. Clean slate for analysis each session.

---

## Question 24: Trade Log Scale (2026-01-02)

**Decision:** Option C - No Pagination for MVP

**Context:** Expected max trades? Need virtualization?

**Implementation:**
- Show all trades in scrollable list
- Add pagination/virtualization post-MVP if performance issues

**Rationale:** Simplest implementation. Most strategies generate <500 trades. Modern browsers handle this fine.

---

## Question 25: Core Metrics (2026-01-02)

**Decision:** Option A - Standard Six Metrics

**Context:** Which 6 metrics to show prominently?

**Implementation:**
Core metrics shown in main grid:
1. Total Return (%)
2. Sharpe Ratio
3. Max Drawdown (%)
4. Win Rate (%)
5. Total Trades
6. CAGR (%)

Expandable "Advanced Metrics" section with remaining 19+ metrics.

**Rationale:** Most intuitive mix of return, risk, and trade stats. Covers what 95% of users check first.

---

## Question 26: Heatmap Dimensions (2026-01-02)

**Decision:** Option A - 2D Only

**Context:** 2D only or support N-dimensional parameter visualization?

**Implementation:**
- 2D heatmap (X and Y axis = two parameters)
- Color represents objective (Sharpe, Sortino, or Total Return)
- User selects which two parameters to visualize

**Rationale:** 2D is standard for optimization visualization. Most strategies have 2-3 key parameters anyway.

---

## Question 27: Drawdown Visualization (2026-01-02)

**Decision:** Option C - Both with Toggle

**Context:** How to show drawdowns?

**Implementation:**
- Toggle between two views:
  1. Separate underwater equity chart (below equity curve)
  2. Overlay on equity curve (shaded regions during drawdowns)
- User preference persists in localStorage

**Rationale:** Both have value. Separate is clearer for analysis. Overlay shows context. Let users choose.

---

## Question 28: Optimization Methods (2026-01-02)

**Decision:** Option C - All Three Methods

**Context:** Which optimization methods in MVP?

**Implementation:**
- Grid Search (exhaustive)
- Random Search (sampling)
- Genetic Algorithm (evolutionary)

User selects method in optimization config.

**Rationale:** All three have different strengths. Grid is thorough but slow. Random is fast. Genetic finds global optima. Provide all options.

---

## Question 29: Optimization Objective (2026-01-02)

**Decision:** Option B - Three Common Objectives

**Context:** User-selectable optimization target?

**Implementation:**
User selects objective:
- Sharpe Ratio (default - risk-adjusted return)
- Sortino Ratio (downside risk only)
- Total Return (absolute performance)

**Rationale:** These three cover 95% of optimization use cases. Simple dropdown selector.

---

## Question 30: Walk-Forward in Scope (2026-01-02)

**Decision:** Option B - Yes, in MVP

**Context:** Walk-forward analysis for MVP?

**Implementation:**
- Walk-forward analysis as third mode (backtest, optimize, walk-forward)
- Fixed windows approach: 60% in-sample, 40% out-of-sample
- Rolling windows with configurable step size
- Timeline visualization showing in/out sample periods
- Performance metrics per window + aggregate

**Rationale:** Walk-forward is critical for validating strategy robustness. Differentiates this tool. Worth the effort.

**Note:** This upgrades MVP scope significantly. Consider high priority after basic backtest + optimize work.

---

## Question 31: Monte Carlo Simulations (2026-01-02)

**Decision:** Option A - Not in MVP (Phase 4)

**Context:** Monte Carlo in MVP?

**Rationale:** Phase 4 feature. Focus MVP on backtest, optimize, and walk-forward. Monte Carlo is advanced probabilistic analysis.

---

## Question 32: Validation Scoring (2026-01-02)

**Decision:** Option A - Not in MVP (Phase 4)

**Context:** How to display validation results?

**Rationale:** Phase 4 with Monte Carlo. Walk-forward (Q30) provides validation. Full validation system is Phase 4.

---

## Question 34: Error Handling (2026-01-02)

**Decision:** Option C - Context-Appropriate

**Context:** How to display errors?

**Implementation:**
- **Toast notifications:** Minor errors (network timeout, retry succeeded)
- **Modal dialogs:** Critical errors (API down, invalid data, execution crash)
- **Inline errors:** Validation errors (parameter constraints, form validation)

Use shared-ui Toast, Modal, and validation components.

**Rationale:** Different error severities need different UX. Toast is dismissible, modal demands attention, inline is contextual.

---

## Question 35: Loading States (2026-01-02)

**Decision:** Option C - Both Global + Per-Operation

**Context:** Per-operation or global loading?

**Implementation:**
- Global: Show loading indicator in header when any operation running
- Per-operation: Show specific loader in backtest/optimize/walk-forward panel
- Stores already have per-operation state (Q18)

**Rationale:** Global shows "something is happening". Per-operation shows "what is happening". Both are valuable.

---

## Question 36: Web Worker Progress (2026-01-02)

**Decision:** Option C - Progress Bar + Iteration Count

**Context:** Show progress during optimization?

**Implementation:**
```typescript
// Optimization worker posts progress updates
postMessage({
  type: 'progress',
  current: 45,
  total: 100,
  message: 'Testing parameter combination 45 of 100'
});

// UI shows:
// [████████░░░░░░░░░░] 45%
// Testing combination 45 of 100
```

**Rationale:** Optimization can take 30+ seconds. Users need feedback that progress is happening. Iteration count adds context.

---

## Question 10: Custom Strategies (2026-01-02)

**Decision:** Option B - Code-Based Extension (with Web Worker sandboxing)

See: `/packages/backtesting-ui/src/lib/custom-strategies/`

**Rationale:**
- Maximum flexibility for power users
- Web Worker provides isolation
- Templates lower barrier to entry
- Comprehensive security documentation addresses risks

**Security:**
- Arbitrary code execution in Web Worker
- 30-second timeout protection
- Pattern validation for dangerous APIs
- See SECURITY.md for complete threat model

---

## Question 9: Parameter Presets (2026-01-02)

**Decision:** Option B - Single "Recommended" Preset

See: `/packages/backtesting-ui/src/lib/strategies/types.ts` (PresetInfo interface)

**Rationale:**
- Strategy defaults ARE the recommended preset
- Rich metadata explains rationale and suitability
- Avoids preset proliferation and maintenance
- Clear "Reset to Recommended" action

---

## Question 7: Strategy Descriptions Source (2026-01-02)

**Decision:** Option C - Separate Markdown Files

See: `/packages/backtesting-ui/src/lib/strategies/docs/`

**Rationale:**
- Complete documentation with examples
- YAML frontmatter + structured sections
- Dynamic import with `?raw` suffix
- In-memory caching for performance

---

## Question 6: Data Caching (2026-01-02)

**Decision:** Option C + D - Hybrid Memory + localStorage

See: `/packages/backtesting-ui/src/lib/cache/`

**Rationale:**
- LRU memory cache for fast repeat access
- TTL-based localStorage for persistence
- Promotion pattern: storage hits → memory
- Different TTLs per interval (daily: 24h, weekly: 7d, monthly: 30d)

---

## Question 5: Parameter Validation Timing (2026-01-02)

**Decision:** Option C - Hybrid Validation

See: `/packages/backtesting-ui/src/lib/validation/`

**Rationale:**
- Realtime warnings (300ms debounced) during editing
- Hard errors on submit prevent invalid backtests
- Different severity levels per validation mode
- Doesn't block experimentation, prevents submission of invalid params

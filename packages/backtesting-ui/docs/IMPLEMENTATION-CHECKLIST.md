# Implementation Checklist

**Status:** 71/71 tasks complete (100%)
**Last Updated:** 2026-01-03

---

## Quick Reference

| Phase | Tasks | Est. Hours | Status |
|-------|-------|------------|--------|
| Setup | 3 | 1h | ✅ Complete |
| Phase 1: Backtest | 25 | 25-30h | ✅ Complete |
| Phase 2: Optimize | 18 | 20-25h | ✅ Complete |
| Phase 3: Walk-Forward | 15 | 15-20h | ✅ Complete |
| Phase 4: Polish | 10 | 12-15h | ✅ Complete |
| **TOTAL** | **71** | **73-91h** | **100%** |

---

## Setup (1h)

### S1: Install Dependencies
- [x] `bun add lightweight-charts`
- [x] `bun add d3`
- [x] `bun add -d @types/d3`
- [x] Verify workspace dependencies (@one-love-wealth/backtesting, shared-ui, data-layer)

**Acceptance Criteria:**
- All dependencies resolve without errors
- TypeScript recognizes types

**Files:** `package.json`

---

### S2: Create Root Layout
- [x] Create `src/routes/+layout.svelte`
- [x] Add `<DialogProvider>` from shared-ui
- [x] Add `<Toast position="bottom-right" />` from shared-ui
- [x] Apply dark theme Tailwind classes

**Acceptance Criteria:**
- Layout wraps all routes
- Dialogs work globally
- Toast notifications display correctly

**Files:** `src/routes/+layout.svelte`

---

### S3: Create Main Route
- [x] Create `src/routes/+page.svelte` (main app)
- [x] Import stores from `$lib/stores`
- [x] Add basic "Hello Backtest" placeholder

**Acceptance Criteria:**
- Route loads without errors
- Can access stores

**Files:** `src/routes/+page.svelte`

---

## Phase 1: Core Backtesting (25-30h)

### 1.1: Layout Structure (4h)

#### 1.1.1: Three-Column Layout Component
- [x] Create `src/lib/components/layout/ThreeColumnLayout.svelte`
- [x] Left column: 200px fixed
- [x] Center column: flex-grow
- [x] Right column: resizable (default 320px, min 280px, max 500px)
- [x] Add drag handle with visual feedback
- [x] Persist width to localStorage (Q22)

**Acceptance Criteria:**
- Three columns render correctly
- Right panel resizes smoothly via drag
- Width persists across page reloads
- Responsive: Show warning on <1024px width (Q15)

**Dependencies:** None

**Files:** `src/lib/components/layout/ThreeColumnLayout.svelte`

---

#### 1.1.2: App Header
- [x] Create `src/lib/components/layout/AppHeader.svelte`
- [x] Logo/title: "Backtesting UI"
- [x] Mode tabs: Backtest | Optimize | Walk-Forward
- [x] Global loading indicator (when any operation running - Q35)
- [x] Settings icon button (future)

**Acceptance Criteria:**
- Header spans full width
- Mode tabs switch `ui.mode` store
- Loading indicator shows when `isAnyLoading` derived state true
- Active tab highlighted

**Dependencies:** S2, S3

**Files:** `src/lib/components/layout/AppHeader.svelte`

---

#### 1.1.3: Integrate Layout
- [x] Update `src/routes/+page.svelte` to use ThreeColumnLayout
- [x] Add AppHeader above layout
- [x] Create placeholder panels (left/center/right)

**Acceptance Criteria:**
- Full layout structure visible
- Mode switching works (clears results - Q14)

**Dependencies:** 1.1.1, 1.1.2

**Files:** `src/routes/+page.svelte`

---

### 1.2: Strategy Selector (Left Panel) (5h)

#### 1.2.1: Strategy List Component
- [x] Create `src/lib/components/strategy/StrategyList.svelte`
- [x] Get all strategies from registry (7 strategies from Q3)
- [x] Group by category (trend, momentum, mean-reversion, volatility, multi-symbol)
- [x] Show strategy name + brief description
- [x] Highlight selected strategy
- [x] Click to select (updates `strategy.selectStrategy()`)

**Acceptance Criteria:**
- All 7 strategies listed
- Categories collapsible/expandable
- Selected strategy highlighted
- Clicking updates store and right panel shows params

**Dependencies:** 1.1.3

**Files:** `src/lib/components/strategy/StrategyList.svelte`

---

#### 1.2.2: Strategy Search
- [x] Add search input at top of StrategyList
- [x] Filter strategies by name/description/tags
- [x] Show "No results" when empty

**Acceptance Criteria:**
- Search filters list in real-time
- Case-insensitive
- Searches name, description, and tags

**Dependencies:** 1.2.1

**Files:** `src/lib/components/strategy/StrategyList.svelte`

---

#### 1.2.3: Strategy Description Modal
- [x] Create `src/lib/components/strategy/StrategyDescription.svelte`
- [x] Load docs from `lib/strategies/docs/` (Q7)
- [x] Show: How It Works, When to Use, Strengths, Weaknesses, Examples
- [x] "Info" icon next to each strategy opens modal

**Acceptance Criteria:**
- Modal displays full strategy documentation
- Markdown rendered correctly
- Examples formatted nicely
- Modal closeable (Esc key - Q17)

**Dependencies:** 1.2.1

**Files:** `src/lib/components/strategy/StrategyDescription.svelte`

---

### 1.3: Parameter Form (Right Panel) (6h)

#### 1.3.1: Dynamic Field Renderer
- [x] Create `src/lib/components/params/FieldRenderer.svelte`
- [x] Support field types: symbol, integer, decimal, percentage, boolean
- [x] Render appropriate input (text, number, slider, checkbox)
- [x] Show label, help text (tooltip), default indicator
- [x] Bind to `strategy.params` store

**Acceptance Criteria:**
- All field types render correctly
- Two-way binding works (input → store, store → input)
- Tooltips show on hover
- Defaults applied when strategy selected

**Dependencies:** 1.2.1

**Files:** `src/lib/components/params/FieldRenderer.svelte`

---

#### 1.3.2: Parameter Form Container
- [x] Create `src/lib/components/params/ParameterForm.svelte`
- [x] Loop through `selectedStrategy.fields`
- [x] Render each field using FieldRenderer
- [x] Group fields by section (basic vs advanced)
- [x] Show PresetInfo component (Q9) at top

**Acceptance Criteria:**
- All parameters editable
- Basic fields visible by default
- Advanced fields in expandable section
- PresetInfo shows recommendation

**Dependencies:** 1.3.1, 1.2.1

**Files:** `src/lib/components/params/ParameterForm.svelte`

---

#### 1.3.3: Validation Integration
- [x] Import validation store from `$lib/validation` (Q5)
- [x] Show ValidationMessage component per field
- [x] Show ValidationSummary at form bottom
- [x] Realtime validation (300ms debounced)

**Acceptance Criteria:**
- Warnings show in yellow during editing
- Errors show in red, block submission
- Summary shows all issues at once
- Validation updates on param change

**Dependencies:** 1.3.2

**Files:** `src/lib/components/params/ParameterForm.svelte`

---

#### 1.3.4: Config Section
- [x] Create `src/lib/components/config/BacktestConfig.svelte`
- [x] Symbol selector (with search from Q1)
- [x] Date range picker (presets from Q2)
- [x] Interval selector (1d, 1wk, 1mo)
- [x] Initial capital input
- [x] Gap-fill strategy selector
- [x] "Reset to Defaults" button

**Acceptance Criteria:**
- All config options functional
- Symbol search works (curated + external APIs)
- Date presets: 1y, 3y, 5y, 10y, 20y, max
- Config persists to localStorage (Q22)

**Dependencies:** 1.1.3

**Files:** `src/lib/components/config/BacktestConfig.svelte`

---

#### 1.3.5: Run Button
- [x] Add large "Run Backtest" button at bottom of right panel
- [x] Disable when validation errors present
- [x] Show loading spinner when `backtest.isRunning`
- [x] Trigger backtest execution on click
- [x] Keyboard shortcut: Enter (when focused - Q17)

**Acceptance Criteria:**
- Button disabled when params invalid
- Shows loading state during execution
- Enter key triggers backtest
- Error handling via toast (Q34)

**Dependencies:** 1.3.3, 1.3.4

**Files:** `src/lib/components/params/ParameterForm.svelte`

---

### 1.4: Backtest Execution (4h)

#### 1.4.1: Backtest Service
- [x] Create `src/lib/services/backtest.ts`
- [x] Function: `runBacktest(strategy, params, config)`
- [x] Load data via `loadBacktestDataBySymbols()` from data service
- [x] Check cache first (Q6)
- [x] Create strategy instance from registry
- [x] Execute with BacktestEngine
- [x] Return BacktestResult

**Acceptance Criteria:**
- Data loads correctly (uses proxy Q33)
- Cache hit/miss works
- Strategy executes without errors
- Returns full BacktestResult with metrics

**Dependencies:** S1, 1.3.5

**Files:** `src/lib/services/backtest.ts`

---

#### 1.4.2: Error Handling
- [x] Wrap execution in try/catch
- [x] Handle errors: network failure, invalid data, strategy crash
- [x] Display via toast for minor errors (Q34)
- [x] Display via modal for critical errors (Q34)
- [x] Update `backtest.error` store

**Acceptance Criteria:**
- Network errors show toast with retry option
- Strategy errors show modal with details
- User not left in broken state
- Error clears on next successful run

**Dependencies:** 1.4.1

**Files:** `src/lib/services/backtest.ts`

---

#### 1.4.3: Gap Analysis Display
- [x] Create `src/lib/components/data/GapAnalysisAlert.svelte` (if not exists from Q4)
- [x] Show after data loads, before backtest runs
- [x] Display quality score (0-100)
- [x] Show gap count by category (weekend, holiday, missing)
- [x] "View Details" opens modal with full gap list

**Acceptance Criteria:**
- Alert shows data quality score
- Color-coded: Excellent (green), Good (yellow), Warning (orange), Error (red)
- Modal shows all gaps with dates and reasons
- User can dismiss and proceed

**Dependencies:** 1.4.1

**Files:** `src/lib/components/data/GapAnalysisAlert.svelte`

---

### 1.5: Results Visualization (Center Panel) (10h)

#### 1.5.1: Results Container
- [x] Create `src/lib/components/results/ResultsView.svelte`
- [x] Tabs: Overview | Charts | Trades | Drawdowns
- [x] Show when `backtest.hasResult` is true
- [x] Empty state: "Run a backtest to see results"

**Acceptance Criteria:**
- Tabs switch content
- Shows only when results available
- Empty state is clear and actionable

**Dependencies:** 1.4.1

**Files:** `src/lib/components/results/ResultsView.svelte`

---

#### 1.5.2: Metrics Grid
- [x] Create `src/lib/components/results/MetricsGrid.svelte`
- [x] Display 6 core metrics (Q25): Total Return, Sharpe, Max DD, Win Rate, Total Trades, CAGR
- [x] 2-column grid layout
- [x] Format: percentages, decimals, counts appropriately
- [x] "Show Advanced Metrics" expandable section (remaining 19+ metrics)

**Acceptance Criteria:**
- Core metrics prominent and readable
- Numbers formatted correctly (%, 2 decimals, etc.)
- Advanced section toggles open/closed
- All 25+ metrics available in advanced

**Dependencies:** 1.5.1

**Files:** `src/lib/components/results/MetricsGrid.svelte`

---

#### 1.5.3: Equity Curve Chart
- [x] Create `src/lib/components/charts/EquityCurve.svelte`
- [x] Use lightweight-charts (Q23)
- [x] Line series for equity over time
- [x] Trade markers: green arrows (entries), red arrows (exits)
- [x] X-axis: dates, Y-axis: equity value
- [x] Responsive to container size

**Acceptance Criteria:**
- Equity curve renders smoothly
- Trade markers positioned correctly
- Hovering shows date, equity, trade details
- Chart responsive and performant with 1000+ bars

**Dependencies:** S1, 1.5.1

**Files:** `src/lib/components/charts/EquityCurve.svelte`

---

#### 1.5.4: Price Chart with Trades
- [x] Create `src/lib/components/charts/PriceChart.svelte`
- [x] Use lightweight-charts candlestick or line series
- [x] Show price data for primary symbol
- [x] Overlay trade markers (entries/exits)
- [x] Optional: Show MA lines if strategy uses them

**Acceptance Criteria:**
- Price chart renders correctly
- Trade markers align with entry/exit times
- Tooltips show OHLCV data
- Chart syncs with equity curve (crosshair)

**Dependencies:** S1, 1.5.1

**Files:** `src/lib/components/charts/PriceChart.svelte`

---

#### 1.5.5: Trade Log
- [x] Create `src/lib/components/results/TradeLog.svelte`
- [x] Table: Date, Type (Entry/Exit), Price, Size, P&L
- [x] Color-code: green (profit), red (loss)
- [x] Sortable columns
- [x] No pagination for MVP (Q24) - scrollable list

**Acceptance Criteria:**
- All trades listed chronologically
- Sorting works (date, price, P&L)
- Profit/loss clearly visible
- Scrollable for 500+ trades without performance issues

**Dependencies:** 1.5.1

**Files:** `src/lib/components/results/TradeLog.svelte`

---

#### 1.5.6: Drawdown Chart
- [x] Create `src/lib/components/charts/DrawdownChart.svelte`
- [x] Use lightweight-charts area series (Q23)
- [x] Two modes: Separate (underwater) vs Overlay (Q27)
- [x] Toggle button to switch modes
- [x] Store preference in localStorage

**Acceptance Criteria:**
- Separate mode: Chart below equity showing drawdown depth
- Overlay mode: Shaded regions on equity curve during drawdowns
- Toggle persists across sessions
- Drawdown periods clearly visible

**Dependencies:** S1, 1.5.1

**Files:** `src/lib/components/charts/DrawdownChart.svelte`

---

### 1.6: History & Persistence (2h)

#### 1.6.1: Result History Store
- [x] Add history functions to `backtest.svelte.ts` store
- [x] `saveToHistory(result)` - compress with gzip (Q21)
- [x] `getHistory()` - decompress and return last 10
- [x] `clearHistory()`
- [x] Auto-save after successful backtest

**Acceptance Criteria:**
- Results saved to localStorage compressed
- Max 10 results maintained
- Oldest auto-evicted when limit reached
- Compression/decompression works correctly

**Dependencies:** 1.4.1

**Files:** `src/lib/stores/backtest.svelte.ts`

---

#### 1.6.2: Recent Results List
- [x] Create `src/lib/components/history/RecentResults.svelte`
- [x] Show in left panel below strategy list (collapsible)
- [x] List last 10 runs: strategy name, date, return %
- [x] Click to load result (replaces current)
- [x] "Clear History" button

**Acceptance Criteria:**
- Last 10 runs visible with key info
- Clicking loads full result into view
- History survives page reload (Q20)
- Clear history removes all from localStorage

**Dependencies:** 1.6.1

**Files:** `src/lib/components/history/RecentResults.svelte`

---

### 1.7: Config Persistence (1h)

#### 1.7.1: Config localStorage Integration
- [x] Update `config.svelte.ts` store
- [x] Load config from localStorage on init
- [x] Save config on change (debounced 1s)
- [x] Only persist: symbols, dateRange, interval, gapFillStrategy, initialCapital (Q22)
- [x] Don't persist: strategy selection, params

**Acceptance Criteria:**
- Config loads on page refresh
- Last-used symbols/dates restored
- Strategy selection NOT persisted (clean slate)
- Debouncing prevents excessive writes

**Dependencies:** 1.3.4

**Files:** `src/lib/stores/config.svelte.ts`

---

### 1.8: Keyboard Shortcuts (1h)

#### 1.8.1: Shortcut Handler
- [x] Create `src/lib/utils/shortcuts.ts`
- [x] Global listener for keyboard events
- [x] Enter: Run backtest (when params valid, not already running)
- [x] Esc: Close modals/dialogs, cancel operations (Q17)

**Acceptance Criteria:**
- Enter triggers backtest from anywhere in app
- Esc closes open dialogs
- Shortcuts don't interfere with text inputs
- Visual feedback when shortcut triggered

**Dependencies:** 1.3.5, 1.4.1

**Files:** `src/lib/utils/shortcuts.ts`, `src/routes/+page.svelte`

---

### 1.9: Polish & Testing (2h)

#### 1.9.1: Loading States
- [x] Global loading indicator in header (Q35)
- [x] Per-operation loading in panels (Q35)
- [x] Skeleton loaders for data fetch
- [x] Spinner in results area during execution

**Acceptance Criteria:**
- Global indicator shows "something happening"
- Local indicators show "what is happening"
- Skeleton loaders during data fetch
- No UI jump when content loads

**Dependencies:** 1.4.1, 1.5.1

**Files:** Multiple components

---

#### 1.9.2: Error Boundaries
- [x] Wrap main sections in ErrorBoundary from shared-ui
- [x] Display friendly error message on crash
- [x] "Try Again" button resets state
- [x] Log errors to console

**Acceptance Criteria:**
- App doesn't crash on unexpected errors
- User sees helpful message
- Can recover without page reload
- Errors logged for debugging

**Dependencies:** S2

**Files:** `src/routes/+page.svelte`

---

**Phase 1 Complete:** Working backtest UI with single-strategy workflow, validation, visualization, history

---

## Phase 2: Optimization (20-25h)

### 2.1: Optimization Config (4h)

#### 2.1.1: Optimization Panel
- [x] Create `src/lib/components/optimize/OptimizationConfig.svelte`
- [x] Show when mode = 'optimize'
- [x] Method selector: Grid | Random | Genetic (Q28)
- [x] Objective selector: Sharpe | Sortino | Total Return (Q29)
- [x] Iteration count (for Random/Genetic)

**Acceptance Criteria:**
- Panel replaces backtest config when mode switches
- All 3 methods selectable
- All 3 objectives selectable
- Defaults: Grid Search, Sharpe Ratio

**Dependencies:** 1.1.2

**Files:** `src/lib/components/optimize/OptimizationConfig.svelte`

---

#### 2.1.2: Parameter Range Editor
- [x] Create `src/lib/components/optimize/ParameterRanges.svelte`
- [x] For each numeric param in selected strategy
- [x] Show: min, max, step inputs
- [x] Defaults from strategy metadata
- [x] Calculate total combinations (grid only)

**Acceptance Criteria:**
- All numeric parameters editable
- Min < max validation
- Step size reasonable
- Shows "Testing X combinations" for grid search

**Dependencies:** 2.1.1

**Files:** `src/lib/components/optimize/ParameterRanges.svelte`

---

#### 2.1.3: Run Optimization Button
- [x] Add "Run Optimization" button
- [x] Disable when ranges invalid
- [x] Show progress bar during execution (Q36)
- [x] Cancel button to stop optimization

**Acceptance Criteria:**
- Button triggers optimization
- Progress bar shows percentage + iteration count
- Cancel button stops worker
- Results display after completion

**Dependencies:** 2.1.2

**Files:** `src/lib/components/optimize/OptimizationConfig.svelte`

---

### 2.2: Optimization Execution (6h)

#### 2.2.1: Optimization Worker
- [x] Create `src/lib/workers/optimization.worker.ts`
- [x] Implement grid search algorithm
- [x] Implement random search algorithm
- [x] Implement genetic algorithm
- [x] Post progress updates to main thread
- [x] Return full OptimizationOutput

**Acceptance Criteria:**
- All 3 methods implemented correctly
- Progress messages posted every 5 iterations
- Worker terminates on completion or cancel
- Returns ranked results by objective

**Dependencies:** S1, 2.1.3

**Files:** `src/lib/workers/optimization.worker.ts`

---

#### 2.2.2: Optimization Service
- [x] Create `src/lib/services/optimization.ts`
- [x] Wrapper for optimization worker
- [x] Load data once, share across iterations
- [x] Handle worker lifecycle
- [x] Update `optimization` store with progress

**Acceptance Criteria:**
- Service manages worker creation/termination
- Data loaded once and reused
- Progress updates UI in real-time
- Errors handled gracefully

**Dependencies:** 2.2.1

**Files:** `src/lib/services/optimization.ts`

---

### 2.3: Optimization Results (8h)

#### 2.3.1: Results Table
- [x] Create `src/lib/components/optimize/OptimizationResults.svelte`
- [x] Table: Rank, Parameters, Objective Value, Sharpe, Max DD
- [x] Sortable by any column
- [x] Top 20 results shown by default
- [x] "Show All" expands to full list

**Acceptance Criteria:**
- Results sorted by objective (best first)
- All parameters visible per row
- Sorting works on all columns
- Expandable to show all results

**Dependencies:** 2.2.2

**Files:** `src/lib/components/optimize/OptimizationResults.svelte`

---

#### 2.3.2: Parameter Heatmap
- [x] Create `src/lib/components/optimize/ParameterHeatmap.svelte`
- [x] Use d3 for heatmap rendering (Q26)
- [x] X axis: First parameter
- [x] Y axis: Second parameter
- [x] Color: Objective value (Sharpe/Sortino/Return)
- [x] Dropdown to select which 2 params to visualize

**Acceptance Criteria:**
- Heatmap renders correctly
- Colors indicate performance (green = good, red = bad)
- User can select which parameters to plot
- Hovering shows exact values

**Dependencies:** S1, 2.3.1

**Files:** `src/lib/components/optimize/ParameterHeatmap.svelte`

---

#### 2.3.3: Apply Best Parameters
- [x] "Apply Best" button in results table
- [x] Copies best parameters to strategy.params
- [x] Switches mode back to 'backtest'
- [x] Shows confirmation toast
- [x] User can then run backtest with optimal params

**Acceptance Criteria:**
- Clicking "Apply Best" copies parameters
- Mode switches to backtest
- Parameters pre-filled in form
- Toast confirms "Parameters applied"

**Dependencies:** 2.3.1

**Files:** `src/lib/components/optimize/OptimizationResults.svelte`

---

#### 2.3.4: Optimization History
- [x] Save last 10 optimization runs to localStorage (compressed)
- [x] Show in history panel
- [x] Click to load past optimization results

**Acceptance Criteria:**
- Optimization results persist
- Can review past optimizations
- History separate from backtest history

**Dependencies:** 2.3.1, 1.6.1

**Files:** `src/lib/stores/optimization.svelte.ts`

---

### 2.4: Polish (2h)

#### 2.4.1: Progress Visualization
- [x] Enhanced progress bar with iteration count (Q36)
- [x] Estimated time remaining (based on avg iteration time)
- [x] "Testing parameter combination X of Y"

**Acceptance Criteria:**
- Progress bar fills smoothly
- ETA accurate within 20%
- Current iteration displayed

**Dependencies:** 2.2.2

**Files:** `src/lib/components/optimize/OptimizationConfig.svelte`

---

**Phase 2 Complete:** Full parameter optimization with Grid/Random/Genetic methods, heatmap visualization, apply workflow

---

**Phase 2 Complete:** Full parameter optimization with Grid/Random/Genetic methods, heatmap visualization, apply workflow

---

## Phase 3: Walk-Forward Analysis (15-20h)

### 3.1: Walk-Forward Config (3h)

#### 3.1.1: Walk-Forward Panel
- [x] Create `src/lib/components/walkforward/WalkForwardConfig.svelte`
- [x] Show when mode = 'walk-forward'
- [x] Window configuration: in-sample %, out-of-sample %
- [x] Default: 60% in-sample, 40% out-of-sample (Q30)
- [x] Step size (% to advance each window)
- [x] Anchored vs Rolling toggle

**Acceptance Criteria:**
- Panel shows when WF mode active
- In/out split configurable
- Step size adjustable
- Anchored vs Rolling explained in tooltip

**Dependencies:** 1.1.2

**Files:** `src/lib/components/walkforward/WalkForwardConfig.svelte`

---

#### 3.1.2: Run Walk-Forward Button
- [x] "Run Walk-Forward" button
- [x] Disable when config invalid
- [x] Show progress (window X of Y)
- [x] Cancel button

**Acceptance Criteria:**
- Button triggers WF analysis
- Progress shows current window
- Cancellable mid-execution

**Dependencies:** 3.1.1

**Files:** `src/lib/components/walkforward/WalkForwardConfig.svelte`

---

### 3.2: Walk-Forward Execution (5h)

#### 3.2.1: Walk-Forward Service
- [x] Create `src/lib/services/walkforward.ts`
- [x] Function: `runWalkForward(strategy, params, config, wfConfig)`
- [x] Split data into windows (in-sample, out-of-sample)
- [x] For each window:
  - [x] Optimize on in-sample
  - [x] Test on out-of-sample
  - [x] Record metrics
- [x] Return WalkForwardOutput

**Acceptance Criteria:**
- Data split correctly by window config
- Optimization runs on in-sample data
- Testing runs on out-of-sample data
- All windows processed
- Returns per-window metrics + aggregate

**Dependencies:** S1, 3.1.2, 2.2.2

**Files:** `src/lib/services/walkforward.ts`

---

#### 3.2.2: Progress Updates
- [x] Post progress: "Window X of Y"
- [x] Update store in real-time
- [x] Handle cancellation

**Acceptance Criteria:**
- Progress updates every window completion
- User sees which window is processing
- Cancel stops immediately

**Dependencies:** 3.2.1

**Files:** `src/lib/services/walkforward.ts`

---

### 3.3: Walk-Forward Results (7h)

#### 3.3.1: Timeline Visualization
- [x] Create `src/lib/components/walkforward/WalkForwardTimeline.svelte`
- [x] Use d3 or lightweight-charts
- [x] Show timeline of all windows
- [x] Color-coded: blue (in-sample), green (out-of-sample)
- [x] Hovering shows window dates and metrics

**Acceptance Criteria:**
- Timeline shows all windows chronologically
- In/out sample periods clearly distinguished
- Clicking window shows detailed results
- Responsive to container width

**Dependencies:** S1, 3.2.1

**Files:** `src/lib/components/walkforward/WalkForwardTimeline.svelte`

---

#### 3.3.2: Per-Window Results Table
- [x] Create `src/lib/components/walkforward/WindowResults.svelte`
- [x] Table: Window #, Dates, In-Sample Sharpe, Out-Sample Sharpe, Degradation %
- [x] Sortable columns
- [x] Color-code degradation (green = low, red = high)

**Acceptance Criteria:**
- All windows listed with key metrics
- Degradation calculated (in-sample vs out-sample)
- Sorting works
- Degradation color-coded

**Dependencies:** 3.2.1

**Files:** `src/lib/components/walkforward/WindowResults.svelte`

---

#### 3.3.3: Aggregate Metrics
- [x] Show aggregate performance across all windows
- [x] Average in-sample metrics
- [x] Average out-sample metrics
- [x] Average degradation
- [x] Pass/fail indicator (degradation < 20% = pass)

**Acceptance Criteria:**
- Aggregate metrics calculated correctly
- Pass/fail clear and actionable
- Comparison chart (in vs out performance)

**Dependencies:** 3.3.2

**Files:** `src/lib/components/walkforward/WalkForwardResults.svelte`

---

#### 3.3.4: Equity Curve Overlay
- [x] Show equity curves for all out-of-sample periods stitched together
- [x] Compare with buy-and-hold benchmark
- [x] Highlight window boundaries

**Acceptance Criteria:**
- Stitched equity curve renders correctly
- Benchmark comparison visible
- Window boundaries marked on chart

**Dependencies:** 3.3.3, 1.5.3

**Files:** `src/lib/components/walkforward/WalkForwardResults.svelte`

---

**Phase 3 Complete:** Walk-forward analysis validates strategy robustness over time with rolling windows

---

## Phase 4: Polish & Advanced Features (12-15h)

### 4.1: UI Polish (5h)

#### 4.1.1: Mobile Warning
- [x] Detect screen width < 1024px (Q15)
- [x] Show banner: "This application is optimized for desktop"
- [x] Dismissable but reappears on refresh

**Acceptance Criteria:**
- Warning shows only on narrow screens
- Doesn't block usage (just warns)
- Dismissable

**Dependencies:** S2

**Files:** `src/lib/components/layout/MobileWarning.svelte`

---

#### 4.1.2: Empty States
- [x] Design empty states for all panels
- [x] "Select a strategy to begin"
- [x] "Run a backtest to see results"
- [x] "No history yet"
- [x] Actionable CTAs in each

**Acceptance Criteria:**
- Every empty state has clear message
- CTAs guide user to next action
- Visually appealing

**Dependencies:** None

**Files:** Multiple components

---

#### 4.1.3: Tooltips & Help
- [x] Add tooltips to all icons and buttons
- [x] Help text for complex fields
- [x] "?" icons open help dialogs
- [x] Keyboard shortcuts help (Cmd+? opens modal)

**Acceptance Criteria:**
- Tooltips provide context
- Help accessible everywhere
- Shortcuts documented

**Dependencies:** None

**Files:** Multiple components

---

#### 4.1.4: Animations & Transitions
- [x] Smooth transitions when mode switches
- [x] Fade in/out for results
- [x] Loading animations
- [x] Chart entry animations

**Acceptance Criteria:**
- Transitions smooth (not jarring)
- Performance not impacted
- Animations enhance UX

**Dependencies:** None

**Files:** Multiple components

---

### 4.2: Advanced Features (7h)

#### 4.2.1: Export Results
- [x] "Export" button in results view
- [x] Options: CSV (trades), JSON (full result), PNG (charts)
- [x] Download to user's machine

**Acceptance Criteria:**
- CSV exports all trades
- JSON exports complete result
- PNG exports charts as images
- Files named intelligently (strategy-date.csv)

**Dependencies:** 1.5.1

**Files:** `src/lib/utils/export.ts`

---

#### 4.2.2: Comparison View (from History)
- [x] "Compare" button in history panel
- [x] Select 2-5 results from history
- [x] Side-by-side metrics table
- [x] Overlay equity curves

**Acceptance Criteria:**
- Can select multiple history items
- Metrics compared in table
- Equity curves overlaid on same chart
- Clear which line is which strategy

**Dependencies:** 1.6.2, 1.5.3

**Files:** `src/lib/components/history/ComparisonView.svelte`

---

#### 4.2.3: Settings Panel
- [x] Settings icon in header opens panel
- [x] Theme toggle (future - Q16)
- [x] Cache settings (enable/disable, clear cache)
- [x] Default config presets
- [x] Keyboard shortcuts reference

**Acceptance Criteria:**
- Settings accessible from header
- Cache can be cleared
- Defaults resettable
- Shortcuts listed

**Dependencies:** 1.1.2

**Files:** `src/lib/components/settings/SettingsPanel.svelte`

---

#### 4.2.4: Custom Strategy UI
- [x] Custom strategy list in strategy selector
- [x] "Create New Strategy" button
- [x] Modal with code editor (Monaco or CodeMirror)
- [x] Template selector (MA, RSI, Empty)
- [x] Validation feedback
- [x] Import/Export JSON buttons

**Acceptance Criteria:**
- Custom strategies appear in list (marked as "Custom")
- Editor has syntax highlighting
- Templates load correctly
- Import/export works
- Security warning displayed (Q10)

**Dependencies:** 1.2.1

**Files:** `src/lib/components/strategy/CustomStrategyEditor.svelte`

---

**Phase 4 Complete:** Polished UI with export, comparison, settings, custom strategy editor

---

## Testing & Quality (Deferred)

### T1: Unit Tests
- [ ] Test all services (backtest, optimization, walkforward)
- [ ] Test stores
- [ ] Test utilities (date-range, gap-analysis, etc.)
- [ ] Coverage: 80%+

**Tools:** Vitest

---

### T2: Component Tests
- [ ] Test key components in isolation
- [ ] Test validation components
- [ ] Test chart rendering
- [ ] Coverage: 60%+

**Tools:** Vitest + @testing-library/svelte

---

### T3: E2E Tests
- [ ] Complete backtest flow
- [ ] Complete optimization flow
- [ ] Complete walk-forward flow
- [ ] Error scenarios

**Tools:** Playwright

---

### T4: Accessibility Audit
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (tab order)
- [ ] Screen reader testing
- [ ] Color contrast (WCAG AA)

**Tools:** axe DevTools

---

### T5: Performance Testing
- [ ] Lighthouse audit (desktop)
- [ ] Bundle size analysis
- [ ] Chart performance with 10k+ bars
- [ ] Memory leak testing

**Tools:** Lighthouse, webpack-bundle-analyzer

---

## Summary Checklist

**Phase 1: Core Backtesting** ✅ When complete, users can:
- [x] Select from 7 strategies
- [x] Configure parameters with validation
- [x] Run backtests with cached data
- [x] View equity curves with trade markers
- [x] Analyze 6 core metrics + 19 advanced
- [x] Review trade log
- [x] View drawdown charts
- [x] Access history of last 10 runs

**Phase 2: Optimization** ✅ When complete, users can:
- [x] Optimize parameters with Grid/Random/Genetic methods
- [x] Select objective (Sharpe/Sortino/Return)
- [x] View results in sortable table
- [x] Visualize parameters in 2D heatmap
- [x] Apply best parameters to backtest
- [x] Review optimization history

**Phase 3: Walk-Forward** ✅ When complete, users can:
- [x] Configure rolling/anchored windows
- [x] Run walk-forward analysis
- [x] View timeline of in/out sample periods
- [x] Analyze per-window degradation
- [x] Compare in-sample vs out-sample performance
- [x] Validate strategy robustness

**Phase 4: Polish** ✅ When complete, users have:
- [x] Polished UI with animations
- [x] Export results (CSV/JSON/PNG)
- [x] Comparison view for multiple runs
- [x] Settings panel
- [x] Custom strategy editor

---

## Progress Tracking

Update this section as tasks complete:

```
Phase 1: [█████████████████████████] 25/25 (100%)
Phase 2: [██████████████████] 18/18 (100%)
Phase 3: [███████████████] 15/15 (100%)
Phase 4: [██████████] 10/10 (100%)

Overall: [██████████████████████████████] 71/71 (100%)
```

---

**Ready to begin Phase 1!** 🚀

See `COMPLETE-ARCHITECTURE.md` for architectural decisions.
See `DECISIONS.md` for detailed rationale on all choices.

# Implementation Checklist

**Status:** 0/71 tasks complete (0%)
**Last Updated:** 2026-01-02

---

## Quick Reference

| Phase | Tasks | Est. Hours | Status |
|-------|-------|------------|--------|
| Setup | 3 | 1h | ⬜ Not Started |
| Phase 1: Backtest | 25 | 25-30h | ⬜ Not Started |
| Phase 2: Optimize | 18 | 20-25h | ⬜ Not Started |
| Phase 3: Walk-Forward | 15 | 15-20h | ⬜ Not Started |
| Phase 4: Polish | 10 | 12-15h | ⬜ Not Started |
| **TOTAL** | **71** | **73-91h** | **0%** |

---

## Setup (1h)

### S1: Install Dependencies
- [ ] `bun add lightweight-charts`
- [ ] `bun add d3`
- [ ] `bun add -d @types/d3`
- [ ] Verify workspace dependencies (@one-love-wealth/backtesting, shared-ui, data-layer)

**Acceptance Criteria:**
- All dependencies resolve without errors
- TypeScript recognizes types

**Files:** `package.json`

---

### S2: Create Root Layout
- [ ] Create `src/routes/+layout.svelte`
- [ ] Add `<DialogProvider>` from shared-ui
- [ ] Add `<Toast position="bottom-right" />` from shared-ui
- [ ] Apply dark theme Tailwind classes

**Acceptance Criteria:**
- Layout wraps all routes
- Dialogs work globally
- Toast notifications display correctly

**Files:** `src/routes/+layout.svelte`

---

### S3: Create Main Route
- [ ] Create `src/routes/+page.svelte` (main app)
- [ ] Import stores from `$lib/stores`
- [ ] Add basic "Hello Backtest" placeholder

**Acceptance Criteria:**
- Route loads without errors
- Can access stores

**Files:** `src/routes/+page.svelte`

---

## Phase 1: Core Backtesting (25-30h)

### 1.1: Layout Structure (4h)

#### 1.1.1: Three-Column Layout Component
- [ ] Create `src/lib/components/layout/ThreeColumnLayout.svelte`
- [ ] Left column: 200px fixed
- [ ] Center column: flex-grow
- [ ] Right column: resizable (default 320px, min 280px, max 500px)
- [ ] Add drag handle with visual feedback
- [ ] Persist width to localStorage (Q22)

**Acceptance Criteria:**
- Three columns render correctly
- Right panel resizes smoothly via drag
- Width persists across page reloads
- Responsive: Show warning on <1024px width (Q15)

**Dependencies:** None

**Files:** `src/lib/components/layout/ThreeColumnLayout.svelte`

---

#### 1.1.2: App Header
- [ ] Create `src/lib/components/layout/AppHeader.svelte`
- [ ] Logo/title: "Backtesting UI"
- [ ] Mode tabs: Backtest | Optimize | Walk-Forward
- [ ] Global loading indicator (when any operation running - Q35)
- [ ] Settings icon button (future)

**Acceptance Criteria:**
- Header spans full width
- Mode tabs switch `ui.mode` store
- Loading indicator shows when `isAnyLoading` derived state true
- Active tab highlighted

**Dependencies:** S2, S3

**Files:** `src/lib/components/layout/AppHeader.svelte`

---

#### 1.1.3: Integrate Layout
- [ ] Update `src/routes/+page.svelte` to use ThreeColumnLayout
- [ ] Add AppHeader above layout
- [ ] Create placeholder panels (left/center/right)

**Acceptance Criteria:**
- Full layout structure visible
- Mode switching works (clears results - Q14)

**Dependencies:** 1.1.1, 1.1.2

**Files:** `src/routes/+page.svelte`

---

### 1.2: Strategy Selector (Left Panel) (5h)

#### 1.2.1: Strategy List Component
- [ ] Create `src/lib/components/strategy/StrategyList.svelte`
- [ ] Get all strategies from registry (7 strategies from Q3)
- [ ] Group by category (trend, momentum, mean-reversion, volatility, multi-symbol)
- [ ] Show strategy name + brief description
- [ ] Highlight selected strategy
- [ ] Click to select (updates `strategy.selectStrategy()`)

**Acceptance Criteria:**
- All 7 strategies listed
- Categories collapsible/expandable
- Selected strategy highlighted
- Clicking updates store and right panel shows params

**Dependencies:** 1.1.3

**Files:** `src/lib/components/strategy/StrategyList.svelte`

---

#### 1.2.2: Strategy Search
- [ ] Add search input at top of StrategyList
- [ ] Filter strategies by name/description/tags
- [ ] Show "No results" when empty

**Acceptance Criteria:**
- Search filters list in real-time
- Case-insensitive
- Searches name, description, and tags

**Dependencies:** 1.2.1

**Files:** `src/lib/components/strategy/StrategyList.svelte`

---

#### 1.2.3: Strategy Description Modal
- [ ] Create `src/lib/components/strategy/StrategyDescription.svelte`
- [ ] Load docs from `lib/strategies/docs/` (Q7)
- [ ] Show: How It Works, When to Use, Strengths, Weaknesses, Examples
- [ ] "Info" icon next to each strategy opens modal

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
- [ ] Create `src/lib/components/params/FieldRenderer.svelte`
- [ ] Support field types: symbol, integer, decimal, percentage, boolean
- [ ] Render appropriate input (text, number, slider, checkbox)
- [ ] Show label, help text (tooltip), default indicator
- [ ] Bind to `strategy.params` store

**Acceptance Criteria:**
- All field types render correctly
- Two-way binding works (input → store, store → input)
- Tooltips show on hover
- Defaults applied when strategy selected

**Dependencies:** 1.2.1

**Files:** `src/lib/components/params/FieldRenderer.svelte`

---

#### 1.3.2: Parameter Form Container
- [ ] Create `src/lib/components/params/ParameterForm.svelte`
- [ ] Loop through `selectedStrategy.fields`
- [ ] Render each field using FieldRenderer
- [ ] Group fields by section (basic vs advanced)
- [ ] Show PresetInfo component (Q9) at top

**Acceptance Criteria:**
- All parameters editable
- Basic fields visible by default
- Advanced fields in expandable section
- PresetInfo shows recommendation

**Dependencies:** 1.3.1, 1.2.1

**Files:** `src/lib/components/params/ParameterForm.svelte`

---

#### 1.3.3: Validation Integration
- [ ] Import validation store from `$lib/validation` (Q5)
- [ ] Show ValidationMessage component per field
- [ ] Show ValidationSummary at form bottom
- [ ] Realtime validation (300ms debounced)

**Acceptance Criteria:**
- Warnings show in yellow during editing
- Errors show in red, block submission
- Summary shows all issues at once
- Validation updates on param change

**Dependencies:** 1.3.2

**Files:** `src/lib/components/params/ParameterForm.svelte`

---

#### 1.3.4: Config Section
- [ ] Create `src/lib/components/config/BacktestConfig.svelte`
- [ ] Symbol selector (with search from Q1)
- [ ] Date range picker (presets from Q2)
- [ ] Interval selector (1d, 1wk, 1mo)
- [ ] Initial capital input
- [ ] Gap-fill strategy selector
- [ ] "Reset to Defaults" button

**Acceptance Criteria:**
- All config options functional
- Symbol search works (curated + external APIs)
- Date presets: 1y, 3y, 5y, 10y, 20y, max
- Config persists to localStorage (Q22)

**Dependencies:** 1.1.3

**Files:** `src/lib/components/config/BacktestConfig.svelte`

---

#### 1.3.5: Run Button
- [ ] Add large "Run Backtest" button at bottom of right panel
- [ ] Disable when validation errors present
- [ ] Show loading spinner when `backtest.isRunning`
- [ ] Trigger backtest execution on click
- [ ] Keyboard shortcut: Enter (when focused - Q17)

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
- [ ] Create `src/lib/services/backtest.ts`
- [ ] Function: `runBacktest(strategy, params, config)`
- [ ] Load data via `loadBacktestDataBySymbols()` from data service
- [ ] Check cache first (Q6)
- [ ] Create strategy instance from registry
- [ ] Execute with BacktestEngine
- [ ] Return BacktestResult

**Acceptance Criteria:**
- Data loads correctly (uses proxy Q33)
- Cache hit/miss works
- Strategy executes without errors
- Returns full BacktestResult with metrics

**Dependencies:** S1, 1.3.5

**Files:** `src/lib/services/backtest.ts`

---

#### 1.4.2: Error Handling
- [ ] Wrap execution in try/catch
- [ ] Handle errors: network failure, invalid data, strategy crash
- [ ] Display via toast for minor errors (Q34)
- [ ] Display via modal for critical errors (Q34)
- [ ] Update `backtest.error` store

**Acceptance Criteria:**
- Network errors show toast with retry option
- Strategy errors show modal with details
- User not left in broken state
- Error clears on next successful run

**Dependencies:** 1.4.1

**Files:** `src/lib/services/backtest.ts`

---

#### 1.4.3: Gap Analysis Display
- [ ] Create `src/lib/components/data/GapAnalysisAlert.svelte` (if not exists from Q4)
- [ ] Show after data loads, before backtest runs
- [ ] Display quality score (0-100)
- [ ] Show gap count by category (weekend, holiday, missing)
- [ ] "View Details" opens modal with full gap list

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
- [ ] Create `src/lib/components/results/ResultsView.svelte`
- [ ] Tabs: Overview | Charts | Trades | Drawdowns
- [ ] Show when `backtest.hasResult` is true
- [ ] Empty state: "Run a backtest to see results"

**Acceptance Criteria:**
- Tabs switch content
- Shows only when results available
- Empty state is clear and actionable

**Dependencies:** 1.4.1

**Files:** `src/lib/components/results/ResultsView.svelte`

---

#### 1.5.2: Metrics Grid
- [ ] Create `src/lib/components/results/MetricsGrid.svelte`
- [ ] Display 6 core metrics (Q25): Total Return, Sharpe, Max DD, Win Rate, Total Trades, CAGR
- [ ] 2-column grid layout
- [ ] Format: percentages, decimals, counts appropriately
- [ ] "Show Advanced Metrics" expandable section (remaining 19+ metrics)

**Acceptance Criteria:**
- Core metrics prominent and readable
- Numbers formatted correctly (%, 2 decimals, etc.)
- Advanced section toggles open/closed
- All 25+ metrics available in advanced

**Dependencies:** 1.5.1

**Files:** `src/lib/components/results/MetricsGrid.svelte`

---

#### 1.5.3: Equity Curve Chart
- [ ] Create `src/lib/components/charts/EquityCurve.svelte`
- [ ] Use lightweight-charts (Q23)
- [ ] Line series for equity over time
- [ ] Trade markers: green arrows (entries), red arrows (exits)
- [ ] X-axis: dates, Y-axis: equity value
- [ ] Responsive to container size

**Acceptance Criteria:**
- Equity curve renders smoothly
- Trade markers positioned correctly
- Hovering shows date, equity, trade details
- Chart responsive and performant with 1000+ bars

**Dependencies:** S1, 1.5.1

**Files:** `src/lib/components/charts/EquityCurve.svelte`

---

#### 1.5.4: Price Chart with Trades
- [ ] Create `src/lib/components/charts/PriceChart.svelte`
- [ ] Use lightweight-charts candlestick or line series
- [ ] Show price data for primary symbol
- [ ] Overlay trade markers (entries/exits)
- [ ] Optional: Show MA lines if strategy uses them

**Acceptance Criteria:**
- Price chart renders correctly
- Trade markers align with entry/exit times
- Tooltips show OHLCV data
- Chart syncs with equity curve (crosshair)

**Dependencies:** S1, 1.5.1

**Files:** `src/lib/components/charts/PriceChart.svelte`

---

#### 1.5.5: Trade Log
- [ ] Create `src/lib/components/results/TradeLog.svelte`
- [ ] Table: Date, Type (Entry/Exit), Price, Size, P&L
- [ ] Color-code: green (profit), red (loss)
- [ ] Sortable columns
- [ ] No pagination for MVP (Q24) - scrollable list

**Acceptance Criteria:**
- All trades listed chronologically
- Sorting works (date, price, P&L)
- Profit/loss clearly visible
- Scrollable for 500+ trades without performance issues

**Dependencies:** 1.5.1

**Files:** `src/lib/components/results/TradeLog.svelte`

---

#### 1.5.6: Drawdown Chart
- [ ] Create `src/lib/components/charts/DrawdownChart.svelte`
- [ ] Use lightweight-charts area series (Q23)
- [ ] Two modes: Separate (underwater) vs Overlay (Q27)
- [ ] Toggle button to switch modes
- [ ] Store preference in localStorage

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
- [ ] Add history functions to `backtest.svelte.ts` store
- [ ] `saveToHistory(result)` - compress with gzip (Q21)
- [ ] `getHistory()` - decompress and return last 10
- [ ] `clearHistory()`
- [ ] Auto-save after successful backtest

**Acceptance Criteria:**
- Results saved to localStorage compressed
- Max 10 results maintained
- Oldest auto-evicted when limit reached
- Compression/decompression works correctly

**Dependencies:** 1.4.1

**Files:** `src/lib/stores/backtest.svelte.ts`

---

#### 1.6.2: Recent Results List
- [ ] Create `src/lib/components/history/RecentResults.svelte`
- [ ] Show in left panel below strategy list (collapsible)
- [ ] List last 10 runs: strategy name, date, return %
- [ ] Click to load result (replaces current)
- [ ] "Clear History" button

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
- [ ] Update `config.svelte.ts` store
- [ ] Load config from localStorage on init
- [ ] Save config on change (debounced 1s)
- [ ] Only persist: symbols, dateRange, interval, gapFillStrategy, initialCapital (Q22)
- [ ] Don't persist: strategy selection, params

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
- [ ] Create `src/lib/utils/shortcuts.ts`
- [ ] Global listener for keyboard events
- [ ] Enter: Run backtest (when params valid, not already running)
- [ ] Esc: Close modals/dialogs, cancel operations (Q17)

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
- [ ] Global loading indicator in header (Q35)
- [ ] Per-operation loading in panels (Q35)
- [ ] Skeleton loaders for data fetch
- [ ] Spinner in results area during execution

**Acceptance Criteria:**
- Global indicator shows "something happening"
- Local indicators show "what is happening"
- Skeleton loaders during data fetch
- No UI jump when content loads

**Dependencies:** 1.4.1, 1.5.1

**Files:** Multiple components

---

#### 1.9.2: Error Boundaries
- [ ] Wrap main sections in ErrorBoundary from shared-ui
- [ ] Display friendly error message on crash
- [ ] "Try Again" button resets state
- [ ] Log errors to console

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
- [ ] Create `src/lib/components/optimize/OptimizationConfig.svelte`
- [ ] Show when mode = 'optimize'
- [ ] Method selector: Grid | Random | Genetic (Q28)
- [ ] Objective selector: Sharpe | Sortino | Total Return (Q29)
- [ ] Iteration count (for Random/Genetic)

**Acceptance Criteria:**
- Panel replaces backtest config when mode switches
- All 3 methods selectable
- All 3 objectives selectable
- Defaults: Grid Search, Sharpe Ratio

**Dependencies:** 1.1.2

**Files:** `src/lib/components/optimize/OptimizationConfig.svelte`

---

#### 2.1.2: Parameter Range Editor
- [ ] Create `src/lib/components/optimize/ParameterRanges.svelte`
- [ ] For each numeric param in selected strategy
- [ ] Show: min, max, step inputs
- [ ] Defaults from strategy metadata
- [ ] Calculate total combinations (grid only)

**Acceptance Criteria:**
- All numeric parameters editable
- Min < max validation
- Step size reasonable
- Shows "Testing X combinations" for grid search

**Dependencies:** 2.1.1

**Files:** `src/lib/components/optimize/ParameterRanges.svelte`

---

#### 2.1.3: Run Optimization Button
- [ ] Add "Run Optimization" button
- [ ] Disable when ranges invalid
- [ ] Show progress bar during execution (Q36)
- [ ] Cancel button to stop optimization

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
- [ ] Create `src/lib/workers/optimization.worker.ts`
- [ ] Implement grid search algorithm
- [ ] Implement random search algorithm
- [ ] Implement genetic algorithm
- [ ] Post progress updates to main thread
- [ ] Return full OptimizationOutput

**Acceptance Criteria:**
- All 3 methods implemented correctly
- Progress messages posted every 5 iterations
- Worker terminates on completion or cancel
- Returns ranked results by objective

**Dependencies:** S1, 2.1.3

**Files:** `src/lib/workers/optimization.worker.ts`

---

#### 2.2.2: Optimization Service
- [ ] Create `src/lib/services/optimization.ts`
- [ ] Wrapper for optimization worker
- [ ] Load data once, share across iterations
- [ ] Handle worker lifecycle
- [ ] Update `optimization` store with progress

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
- [ ] Create `src/lib/components/optimize/OptimizationResults.svelte`
- [ ] Table: Rank, Parameters, Objective Value, Sharpe, Max DD
- [ ] Sortable by any column
- [ ] Top 20 results shown by default
- [ ] "Show All" expands to full list

**Acceptance Criteria:**
- Results sorted by objective (best first)
- All parameters visible per row
- Sorting works on all columns
- Expandable to show all results

**Dependencies:** 2.2.2

**Files:** `src/lib/components/optimize/OptimizationResults.svelte`

---

#### 2.3.2: Parameter Heatmap
- [ ] Create `src/lib/components/optimize/ParameterHeatmap.svelte`
- [ ] Use d3 for heatmap rendering (Q26)
- [ ] X axis: First parameter
- [ ] Y axis: Second parameter
- [ ] Color: Objective value (Sharpe/Sortino/Return)
- [ ] Dropdown to select which 2 params to visualize

**Acceptance Criteria:**
- Heatmap renders correctly
- Colors indicate performance (green = good, red = bad)
- User can select which parameters to plot
- Hovering shows exact values

**Dependencies:** S1, 2.3.1

**Files:** `src/lib/components/optimize/ParameterHeatmap.svelte`

---

#### 2.3.3: Apply Best Parameters
- [ ] "Apply Best" button in results table
- [ ] Copies best parameters to strategy.params
- [ ] Switches mode back to 'backtest'
- [ ] Shows confirmation toast
- [ ] User can then run backtest with optimal params

**Acceptance Criteria:**
- Clicking "Apply Best" copies parameters
- Mode switches to backtest
- Parameters pre-filled in form
- Toast confirms "Parameters applied"

**Dependencies:** 2.3.1

**Files:** `src/lib/components/optimize/OptimizationResults.svelte`

---

#### 2.3.4: Optimization History
- [ ] Save last 10 optimization runs to localStorage (compressed)
- [ ] Show in history panel
- [ ] Click to load past optimization results

**Acceptance Criteria:**
- Optimization results persist
- Can review past optimizations
- History separate from backtest history

**Dependencies:** 2.3.1, 1.6.1

**Files:** `src/lib/stores/optimization.svelte.ts`

---

### 2.4: Polish (2h)

#### 2.4.1: Progress Visualization
- [ ] Enhanced progress bar with iteration count (Q36)
- [ ] Estimated time remaining (based on avg iteration time)
- [ ] "Testing parameter combination X of Y"

**Acceptance Criteria:**
- Progress bar fills smoothly
- ETA accurate within 20%
- Current iteration displayed

**Dependencies:** 2.2.2

**Files:** `src/lib/components/optimize/OptimizationConfig.svelte`

---

**Phase 2 Complete:** Full parameter optimization with Grid/Random/Genetic methods, heatmap visualization, apply workflow

---

## Phase 3: Walk-Forward Analysis (15-20h)

### 3.1: Walk-Forward Config (3h)

#### 3.1.1: Walk-Forward Panel
- [ ] Create `src/lib/components/walkforward/WalkForwardConfig.svelte`
- [ ] Show when mode = 'walk-forward'
- [ ] Window configuration: in-sample %, out-of-sample %
- [ ] Default: 60% in-sample, 40% out-of-sample (Q30)
- [ ] Step size (% to advance each window)
- [ ] Anchored vs Rolling toggle

**Acceptance Criteria:**
- Panel shows when WF mode active
- In/out split configurable
- Step size adjustable
- Anchored vs Rolling explained in tooltip

**Dependencies:** 1.1.2

**Files:** `src/lib/components/walkforward/WalkForwardConfig.svelte`

---

#### 3.1.2: Run Walk-Forward Button
- [ ] "Run Walk-Forward" button
- [ ] Disable when config invalid
- [ ] Show progress (window X of Y)
- [ ] Cancel button

**Acceptance Criteria:**
- Button triggers WF analysis
- Progress shows current window
- Cancellable mid-execution

**Dependencies:** 3.1.1

**Files:** `src/lib/components/walkforward/WalkForwardConfig.svelte`

---

### 3.2: Walk-Forward Execution (5h)

#### 3.2.1: Walk-Forward Service
- [ ] Create `src/lib/services/walkforward.ts`
- [ ] Function: `runWalkForward(strategy, params, config, wfConfig)`
- [ ] Split data into windows (in-sample, out-of-sample)
- [ ] For each window:
  - Optimize on in-sample
  - Test on out-of-sample
  - Record metrics
- [ ] Return WalkForwardOutput

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
- [ ] Post progress: "Window X of Y"
- [ ] Update store in real-time
- [ ] Handle cancellation

**Acceptance Criteria:**
- Progress updates every window completion
- User sees which window is processing
- Cancel stops immediately

**Dependencies:** 3.2.1

**Files:** `src/lib/services/walkforward.ts`

---

### 3.3: Walk-Forward Results (7h)

#### 3.3.1: Timeline Visualization
- [ ] Create `src/lib/components/walkforward/WalkForwardTimeline.svelte`
- [ ] Use d3 or lightweight-charts
- [ ] Show timeline of all windows
- [ ] Color-coded: blue (in-sample), green (out-of-sample)
- [ ] Hovering shows window dates and metrics

**Acceptance Criteria:**
- Timeline shows all windows chronologically
- In/out sample periods clearly distinguished
- Clicking window shows detailed results
- Responsive to container width

**Dependencies:** S1, 3.2.1

**Files:** `src/lib/components/walkforward/WalkForwardTimeline.svelte`

---

#### 3.3.2: Per-Window Results Table
- [ ] Create `src/lib/components/walkforward/WindowResults.svelte`
- [ ] Table: Window #, Dates, In-Sample Sharpe, Out-Sample Sharpe, Degradation %
- [ ] Sortable columns
- [ ] Color-code degradation (green = low, red = high)

**Acceptance Criteria:**
- All windows listed with key metrics
- Degradation calculated (in-sample vs out-sample)
- Sorting works
- Degradation color-coded

**Dependencies:** 3.2.1

**Files:** `src/lib/components/walkforward/WindowResults.svelte`

---

#### 3.3.3: Aggregate Metrics
- [ ] Show aggregate performance across all windows
- [ ] Average in-sample metrics
- [ ] Average out-sample metrics
- [ ] Average degradation
- [ ] Pass/fail indicator (degradation < 20% = pass)

**Acceptance Criteria:**
- Aggregate metrics calculated correctly
- Pass/fail clear and actionable
- Comparison chart (in vs out performance)

**Dependencies:** 3.3.2

**Files:** `src/lib/components/walkforward/WalkForwardResults.svelte`

---

#### 3.3.4: Equity Curve Overlay
- [ ] Show equity curves for all out-of-sample periods stitched together
- [ ] Compare with buy-and-hold benchmark
- [ ] Highlight window boundaries

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
- [ ] Detect screen width < 1024px (Q15)
- [ ] Show banner: "This application is optimized for desktop"
- [ ] Dismissable but reappears on refresh

**Acceptance Criteria:**
- Warning shows only on narrow screens
- Doesn't block usage (just warns)
- Dismissable

**Dependencies:** S2

**Files:** `src/lib/components/layout/MobileWarning.svelte`

---

#### 4.1.2: Empty States
- [ ] Design empty states for all panels
- [ ] "Select a strategy to begin"
- [ ] "Run a backtest to see results"
- [ ] "No history yet"
- [ ] Actionable CTAs in each

**Acceptance Criteria:**
- Every empty state has clear message
- CTAs guide user to next action
- Visually appealing

**Dependencies:** None

**Files:** Multiple components

---

#### 4.1.3: Tooltips & Help
- [ ] Add tooltips to all icons and buttons
- [ ] Help text for complex fields
- [ ] "?" icons open help dialogs
- [ ] Keyboard shortcuts help (Cmd+? opens modal)

**Acceptance Criteria:**
- Tooltips provide context
- Help accessible everywhere
- Shortcuts documented

**Dependencies:** None

**Files:** Multiple components

---

#### 4.1.4: Animations & Transitions
- [ ] Smooth transitions when mode switches
- [ ] Fade in/out for results
- [ ] Loading animations
- [ ] Chart entry animations

**Acceptance Criteria:**
- Transitions smooth (not jarring)
- Performance not impacted
- Animations enhance UX

**Dependencies:** None

**Files:** Multiple components

---

### 4.2: Advanced Features (7h)

#### 4.2.1: Export Results
- [ ] "Export" button in results view
- [ ] Options: CSV (trades), JSON (full result), PNG (charts)
- [ ] Download to user's machine

**Acceptance Criteria:**
- CSV exports all trades
- JSON exports complete result
- PNG exports charts as images
- Files named intelligently (strategy-date.csv)

**Dependencies:** 1.5.1

**Files:** `src/lib/utils/export.ts`

---

#### 4.2.2: Comparison View (from History)
- [ ] "Compare" button in history panel
- [ ] Select 2-5 results from history
- [ ] Side-by-side metrics table
- [ ] Overlay equity curves

**Acceptance Criteria:**
- Can select multiple history items
- Metrics compared in table
- Equity curves overlaid on same chart
- Clear which line is which strategy

**Dependencies:** 1.6.2, 1.5.3

**Files:** `src/lib/components/history/ComparisonView.svelte`

---

#### 4.2.3: Settings Panel
- [ ] Settings icon in header opens panel
- [ ] Theme toggle (future - Q16)
- [ ] Cache settings (enable/disable, clear cache)
- [ ] Default config presets
- [ ] Keyboard shortcuts reference

**Acceptance Criteria:**
- Settings accessible from header
- Cache can be cleared
- Defaults resettable
- Shortcuts listed

**Dependencies:** 1.1.2

**Files:** `src/lib/components/settings/SettingsPanel.svelte`

---

#### 4.2.4: Custom Strategy UI
- [ ] Custom strategy list in strategy selector
- [ ] "Create New Strategy" button
- [ ] Modal with code editor (Monaco or CodeMirror)
- [ ] Template selector (MA, RSI, Empty)
- [ ] Validation feedback
- [ ] Import/Export JSON buttons

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
Phase 1: [░░░░░░░░░░░░░░░░░░░░░░░░░] 0/25 (0%)
Phase 2: [░░░░░░░░░░░░░░░░░░] 0/18 (0%)
Phase 3: [░░░░░░░░░░░░░░░] 0/15 (0%)
Phase 4: [░░░░░░░░░░] 0/10 (0%)

Overall: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/71 (0%)
```

---

**Ready to begin Phase 1!** 🚀

See `COMPLETE-ARCHITECTURE.md` for architectural decisions.
See `DECISIONS.md` for detailed rationale on all choices.

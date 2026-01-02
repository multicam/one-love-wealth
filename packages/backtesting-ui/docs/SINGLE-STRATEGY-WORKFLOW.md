# Single Strategy Workflow

The backtesting UI follows a focused single-strategy workflow. Users run **one strategy at a time** for clear, focused analysis.

## Workflow Steps

```
┌─────────────────────────────────────────────────────────┐
│  1. SELECT STRATEGY                                     │
│     - Browse by category                                │
│     - Search by name/tag                                │
│     - View description                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  2. CONFIGURE PARAMETERS                                │
│     - View recommended preset (defaults)                │
│     - Adjust parameters with realtime validation        │
│     - See warnings before submitting                    │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  3. SET DATA OPTIONS                                    │
│     - Select symbol(s)                                  │
│     - Choose date range or period                       │
│     - Select interval (daily/weekly/monthly)            │
│     - Configure gap-fill strategy                       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  4. RUN BACKTEST                                        │
│     - Validate all parameters (blocking errors)         │
│     - Load data (with caching)                          │
│     - Execute strategy                                  │
│     - Calculate metrics                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  5. ANALYZE RESULTS                                     │
│     - View equity curve                                 │
│     - Review performance metrics                        │
│     - Examine trade list                                │
│     - Analyze drawdowns                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │   Iterate:     │
          │  - Adjust      │
          │  - Re-run      │
          │  - Compare     │
          │    (manually)  │
          └────────────────┘
```

## Key Features

### Single Focus
- One strategy active at a time
- Clear mental model: one backtest = one result
- No comparison table/overlay complexity
- Easy to understand cause and effect

### Efficient Iteration
- **Data caching** - repeat backtests with different params use cached data
- **Recommended presets** - start with optimized defaults
- **Realtime validation** - catch issues before running
- **Fast execution** - no parallel overhead

### Manual Comparison
Users can compare strategies by:
1. **Note-taking** - screenshot or write down metrics
2. **Browser tabs** - open multiple instances
3. **Sequential runs** - run strategy A, note results, run strategy B
4. **Spreadsheet** - export metrics for side-by-side analysis

## Example: Comparing MA Crossover Periods

**Goal:** Find optimal MA periods for SPY (50/200 vs 20/50 vs 10/30)

**Steps:**
1. Run MA Crossover with 50/200 (recommended)
   - Note: Sharpe 1.1, Max DD -28%, 45 trades
2. Run MA Crossover with 20/50
   - Note: Sharpe 0.9, Max DD -35%, 120 trades
3. Run MA Crossover with 10/30
   - Note: Sharpe 0.7, Max DD -42%, 280 trades
4. Compare notes - 50/200 wins on risk-adjusted return

**Benefits:**
- ✅ Data only loaded once (cached)
- ✅ Full attention on each configuration
- ✅ Clear before/after comparison in notes

**Drawbacks:**
- ❌ Manual note-taking required
- ❌ No side-by-side metrics table
- ❌ No chart overlay

## Why No Comparison?

**Architectural Decision (Question 11):**
- Option A selected: No comparison, single strategy focus
- See: [DECISIONS.md](./DECISIONS.md#question-11-strategy-comparison)

**Rationale:**
1. **Simplicity** - Clear UX without comparison complexity
2. **MVP Speed** - Ship faster without comparison infrastructure
3. **Focus** - Users analyze one strategy deeply before moving on
4. **Future-Proof** - Can add comparison later without breaking changes

**Trade-offs:**
- ✅ Simpler codebase
- ✅ Faster development
- ✅ Lower cognitive load
- ✅ Easier debugging
- ❌ No side-by-side comparison
- ❌ Manual note-taking for comparisons

## Future: Adding Comparison

If comparison is needed later, evolution path:

### Phase 1: Result History
- Save last N backtest results
- "Recent Results" list
- Click to view past result

### Phase 2: Comparison Table
- Select 2-5 results from history
- Side-by-side metrics table
- Highlight winner per metric

### Phase 3: Chart Overlays
- Overlay equity curves
- Toggle strategy visibility
- Color-coded by strategy

### Phase 4: Parallel Execution
- Run multiple strategies simultaneously
- Progress indicator per strategy
- Results populate as they complete

**This evolution doesn't break single-strategy workflow** - it adds to it.

## Related Documentation

- **Parameter Validation:** [lib/validation/README.md](./src/lib/validation/README.md)
- **Data Caching:** [lib/cache/README.md](./src/lib/cache/README.md)
- **Parameter Presets:** [lib/strategies/PRESETS.md](./src/lib/strategies/PRESETS.md)
- **Strategy Documentation:** [lib/strategies/docs/README.md](./src/lib/strategies/docs/README.md)
- **Custom Strategies:** [lib/custom-strategies/README.md](./src/lib/custom-strategies/README.md)

## Tips for Effective Single-Strategy Analysis

1. **Start with Recommended** - Use preset defaults first
2. **One Change at a Time** - Adjust one parameter, see effect
3. **Use Data Cache** - Same symbol/period loads instantly
4. **Take Notes** - Screenshot or write key metrics
5. **Focus on Risk** - Sharpe and Max DD matter more than total return
6. **Test Robustness** - Try different time periods, symbols
7. **Document Winners** - Save configs that work well
8. **Don't Over-Optimize** - 3-4 test runs enough, avoid curve fitting

## Questions?

- **"Can I run two strategies at once?"** - No, one at a time
- **"How do I compare strategies?"** - Manual note-taking or browser tabs
- **"Will data reload each time?"** - No, data is cached (Question 6)
- **"Can I save backtest results?"** - Not yet, focus is on iteration
- **"Will comparison be added later?"** - Possibly, see Future section above

---

**Last Updated:** 2026-01-02
**Decision Reference:** DECISIONS.md Question 11

# Backtesting UI - Code Review Issues

> **Date:** 2026-01-03
> **Reviewer:** Cascade & Antigravity
> **Scope:** Full codebase review of `packages/backtesting-ui`
>
> **✅ STATUS: COMPLETED - All critical/high/medium issues resolved**
> **📊 Resolution Rate: 100% (16/16 issues fixed, excluding 2 N/A)**
> **✓ Test Status: 100% passing (Vitest unit tests)**
>
> See [CODE-REVIEW-RESOLUTIONS.md](./CODE-REVIEW-RESOLUTIONS.md) for complete fix details

---

## Critical Issues

### 1. Data Fetching Not Implemented

**Files:**
- `src/lib/services/backtest.service.ts:79-99`
- `src/lib/services/optimization.service.ts:114-133`

**Issue:** `fetchHistoricalData()` throws an error - data fetching is not implemented.

```typescript
// backtest.service.ts:87-89
throw new Error(
  `Data fetching not yet implemented. Need to fetch ${symbols.join(', ')} from ${dateRange.start} to ${dateRange.end} at ${interval} interval.`
);
```

**Impact:** Backtests and optimizations cannot run.

**Fix:** Integrate with `loadStrategyData` from `data.ts` service which already has full implementation with caching.

---

### 2. Duplicate Data Services

**Files:**
- `src/lib/services/data.ts` (349 lines, full implementation)
- `src/lib/services/backtest.service.ts` (196 lines, stub implementation)

**Issue:** Two separate data loading implementations exist. `data.ts` has full implementation with caching and gap analysis, while `backtest.service.ts` has a stub that throws.

**Impact:** Confusion, code duplication, potential inconsistency.

**Fix:** Remove `fetchHistoricalData` from `backtest.service.ts`, import and use `loadStrategyData` from `data.ts`.

---

### 3. Cache Type Mismatch

**Files:**
- `src/lib/cache/types.ts:52-63`
- `src/lib/services/backtest.service.ts:43-55`

**Issue:** `CacheKey` in `types.ts` expects:
```typescript
interface CacheKey {
  symbols: string[];
  startDate: string;
  endDate: string;
  interval: '1d' | '1wk' | '1mo';
  gapFillStrategy: 'forward-fill' | 'backward-fill' | 'drop';
}
```

But `backtest.service.ts` creates a different shape:
```typescript
{
  type: 'backtest',
  strategyId: strategy.id,
  params: strategyParams,
  symbols: [...],
  dateRange: dateRange,  // Object, not strings
  interval: interval,
  config: { initialCapital, gapFillStrategy },
}
```

**Impact:** Cache lookups will never match, defeating caching entirely.

**Fix:** Standardize cache key format across all services. Use the `CacheKey` type from `types.ts`.

---

## High Priority Issues

### 4. Memory Leak in Cache Manager

**File:** `src/lib/cache/manager.ts:273-280`

**Issue:** `setInterval` for cleanup is never cleared - no cleanup on destroy.

```typescript
private scheduleCleanup(): void {
  setInterval(() => {
    this.cleanExpired();
  }, 60 * 60 * 1000); // 1 hour - NEVER CLEARED
}
```

**Impact:** Memory leak if CacheManager is recreated (e.g., during HMR in development).

**Fix:** Store interval ID and clear in a `destroy()` method:
```typescript
private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

private scheduleCleanup(): void {
  this.cleanupIntervalId = setInterval(() => {
    this.cleanExpired();
  }, 60 * 60 * 1000);
}

destroy(): void {
  if (this.cleanupIntervalId) {
    clearInterval(this.cleanupIntervalId);
  }
}
```

---

### 5. Missing Strategy Implementations

**File:** `src/lib/strategies/registry.ts:13-17`

**Issue:** Only 3 of 7 strategies implemented:
- ✅ MA Crossover
- ✅ RSI Reversion
- ✅ Buy & Hold
- ❌ VIXHedge
- ❌ BollingerBreakout
- ❌ MACDDivergence
- ❌ PairsTrading

**Impact:** Limited strategy options for users.

**Fix:** Add remaining strategies when available in backtesting package. The TODO comments are already in place.

---

### 6. Duplicate GapAnalysisAlert Components

**Files:**
- `src/lib/components/backtest/GapAnalysisAlert.svelte`
- `src/lib/components/data/GapAnalysisAlert.svelte`

**Issue:** Two components with same name in different folders.

**Impact:** Confusion, potential wrong import, maintenance burden.

**Fix:** Remove one, keep single source of truth in `components/data/`.

---

### 7. Duplicate EquityCurve Components

**Files:**
- `src/lib/components/charts/EquityCurve.svelte`
- `src/lib/components/results/EquityCurve.svelte`

**Issue:** Two equity curve implementations.

**Impact:** Inconsistent behavior, maintenance burden.

**Fix:** Consolidate into single component in `components/charts/`, re-export from `components/results/` if needed.

---

## Medium Priority Issues

### 8. Async Cache Methods Inconsistency

**File:** `src/lib/cache/manager.ts`

**Issue:** `get()` is async (returns Promise) but `set()`, `has()`, `delete()` are sync.

```typescript
async get(key: CacheKey): Promise<CachedData | null>  // async
set(key: CacheKey, ...): void                          // sync
has(key: CacheKey): boolean                            // sync
delete(key: CacheKey): void                            // sync
```

**Impact:** Confusing API, potential bugs when mixing sync/async.

**Fix:** Make all methods sync (both memory and storage caches are synchronous operations).

---

### 9. BacktestResult Type Assumptions

**File:** `src/lib/stores/backtest.svelte.ts:97-106`

**Issue:** Assumes `BacktestResult` has specific properties:
```typescript
symbols: newResult.config.symbols,
dateRange: {
  start: newResult.startDate.toISOString(),
  end: newResult.endDate.toISOString(),
},
```

**Impact:** Runtime errors if actual type doesn't match these assumptions.

**Fix:** Verify against `@one-love-wealth/backtesting` types, add null checks.

---

### 10. Worker Import Path

**File:** `src/lib/services/optimization.service.ts:17`

**Issue:** `import OptimizationWorker from '$lib/workers/optimization.worker?worker'`

**Impact:** Build/runtime error if worker file doesn't exist.

**Fix:** Verify worker file exists at `src/lib/workers/optimization.worker.ts`.

---

### 11. Effect Running on Every Render

**File:** `src/routes/+page.svelte:15-25`

**Issue:** `$effect` with `browser` check may run on every render:
```typescript
$effect(() => {
  if (browser) {
    config.load();
    strategy.load();
    backtest.loadHistory();
    // ...
  }
});
```

**Impact:** Performance issues, potential state problems.

**Fix:** Use `onMount` instead for one-time initialization:
```typescript
import { onMount } from 'svelte';

onMount(() => {
  config.load();
  strategy.load();
  backtest.loadHistory();
  // ...
});
```

---

### 12. Deprecated String Method

**Files:**
- `src/lib/stores/backtest.svelte.ts:93`
- `src/lib/stores/optimization.svelte.ts:112`

**Issue:** Using deprecated `substr()`:
```typescript
id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
```

**Impact:** Future compatibility warnings.

**Fix:** Use `substring()` instead:
```typescript
id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
```

---

### 13. Type Import Path Error

**File:** `src/lib/services/optimization.service.ts:14`

**Issue:** Imports `DateRange` from `$lib/types` which may not exist.

```typescript
import type { DateRange } from '$lib/types';
```

**Fix:** Import from correct location:
```typescript
import type { DateRange } from '$lib/utils/date-range';
```

---

## Low Priority Issues

### 14. Hardcoded Colors in Charts

**File:** `src/lib/components/results/EquityCurve.svelte:26-30`

**Issue:** Chart colors hardcoded instead of using CSS variables:
```typescript
layout: {
  background: { type: ColorType.Solid, color: 'transparent' },
  textColor: '#9ca3af',
},
grid: {
  vertLines: { color: '#2a2e39' },
  horzLines: { color: '#2a2e39' },
},
```

**Impact:** Won't adapt to theme changes.

**Fix:** Use CSS variables or pass colors as props.

---

### 15. Missing Error Boundary in Layout

**File:** `src/lib/components/layout/ThreeColumnLayout.svelte`

**Issue:** No error boundary wrapping slot content.

**Impact:** Errors in one panel could crash entire layout.

**Fix:** Wrap each column in ErrorBoundary:
```svelte
<div class="w-[200px] ...">
  <ErrorBoundary name="Left Panel">
    {@render left?.()}
  </ErrorBoundary>
</div>
```

---

### 16. Custom Strategy Security Note

**File:** `src/lib/custom-strategies/executor.ts:77-78`

**Issue:** `new Function(code)` is essentially `eval` - security risk.

```typescript
new Function(code);
```

**Impact:** XSS if user code is shared between users.

**Note:** This is documented in `SECURITY.md` but worth flagging. The Web Worker sandbox provides some isolation, but arbitrary code execution is inherently risky.

---

## Architecture Observations

### 17. Store Pattern Inconsistency

**Observation:** Mixed patterns across stores:
- Some use Svelte 5 runes (`$state`, `$effect`) in `.svelte.ts` files
- Others use traditional `writable` stores from `svelte/store`

**Recommendation:** Standardize on one pattern. The current stores use `writable` which is correct for Svelte 5 compatibility.

---

### 18. Missing Index Exports

**Observation:**
- `src/lib/strategies/index.ts` exists but may not export all needed items
- `src/lib/services/index.ts` doesn't exist

**Recommendation:** Add barrel exports for cleaner imports:
```typescript
// src/lib/services/index.ts
export * from './data';
export * from './backtest.service';
export * from './optimization.service';
export * from './walkforward.service';
```

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| Critical | 3 | 🔴 Blocking |
| High | 4 | 🟠 Should fix before release |
| Medium | 6 | 🟡 Fix when convenient |
| Low | 3 | 🟢 Nice to have |

**Recommended Fix Order:**
1. Fix data fetching (Critical #1, #2)
2. Fix cache type mismatch (Critical #3)
3. Remove duplicate components (High #6, #7)
4. Fix memory leak (High #4)
5. Fix `$effect` → `onMount` (Medium #11)
6. Fix type imports (Medium #13)

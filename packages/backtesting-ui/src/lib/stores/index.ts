/**
 * Stores Index
 * Re-exports all stores for convenient imports
 */

// Strategy store
export * as strategy from './strategy.svelte';

// Config store
export * as config from './config.svelte';

// Backtest store
export * as backtest from './backtest.svelte';

// Optimization store
export * as optimization from './optimization.svelte';

// Validation store (from Q5 validation system)
// Note: validation.svelte.ts is created by the validation system
// This export will work once validation is integrated

// UI store
export * as ui from './ui.svelte';

/**
 * Usage Examples:
 *
 * // Import entire store namespace
 * import { strategy, backtest, ui } from '$lib/stores';
 * strategy.selectStrategy('ma-crossover');
 * backtest.startBacktest();
 * ui.setMode('optimize');
 *
 * // Import specific exports
 * import { selectedStrategy, params } from '$lib/stores/strategy.svelte';
 * import { result, isRunning } from '$lib/stores/backtest.svelte';
 * import { mode } from '$lib/stores/ui.svelte';
 *
 * // Use in components
 * {#if isRunning}
 *   <Spinner />
 * {:else if result}
 *   <ResultsView {result} />
 * {/if}
 */

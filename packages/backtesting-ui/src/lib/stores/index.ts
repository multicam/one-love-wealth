/**
 * Stores Index
 * Re-exports all stores for convenient imports
 */

// Strategy store
export { strategy } from './strategy.svelte';

// Config store
export { config } from './config.svelte';

// Backtest store
export { backtest } from './backtest.svelte';

// Optimization store
export { optimization } from './optimization.svelte';

// UI store
export { ui } from './ui.svelte';
export type { AppMode } from './ui.svelte';

/**
 * Usage Examples:
 *
 * // Import stores
 * import { strategy, backtest, ui } from '$lib/stores';
 * strategy.selectStrategy('ma-crossover');
 * backtest.startBacktest();
 * ui.setMode('optimize');
 *
 * // Import specific stores
 * import { strategy } from '$lib/stores/strategy.svelte';
 * import { backtest } from '$lib/stores/backtest.svelte';
 * import { ui, type AppMode } from '$lib/stores/ui.svelte';
 *
 * // Use in components
 * {#if backtest.isRunning}
 *   <Spinner />
 * {:else if backtest.result}
 *   <ResultsView result={backtest.result} />
 * {/if}
 */

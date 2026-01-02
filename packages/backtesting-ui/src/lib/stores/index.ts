/**
 * Stores Index
 * Re-exports all stores for convenient imports
 */

// Strategy store
export { strategy } from './strategy';

// Config store
export { config } from './config';

// Backtest store
export { backtest } from './backtest';

// Optimization store
export { optimization } from './optimization';

// UI store
export { ui } from './ui';
export type { AppMode } from './ui';

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
 * import { strategy } from '$lib/stores/strategy';
 * import { backtest } from '$lib/stores/backtest';
 * import { ui, type AppMode } from '$lib/stores/ui';
 *
 * // Use in components
 * {#if backtest.isRunning}
 *   <Spinner />
 * {:else if backtest.result}
 *   <ResultsView result={backtest.result} />
 * {/if}
 */

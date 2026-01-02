/**
 * Backtest Service
 * Handles backtest execution with caching and progress tracking
 */

import type { BacktestResult } from '@one-love-wealth/backtesting';
import { runBacktest } from '@one-love-wealth/backtesting';
import type { StrategyDefinition } from '$lib/strategies/types';
import type { DateRange } from '$lib/utils/date-range';
import { loadBacktestDataBySymbols } from './data';

/**
 * Backtest execution parameters
 */
export interface BacktestParams {
	strategy: StrategyDefinition;
	strategyParams: Record<string, any>;
	dateRange: DateRange;
	interval: '1d' | '1wk' | '1mo';
	initialCapital: number;
	gapFillStrategy: 'forward-fill' | 'backward-fill' | 'drop';
}

/**
 * Progress callback function
 */
export type ProgressCallback = (progress: number, message?: string) => void;

/**
 * Extract symbols from strategy parameters
 */
function getSymbolsFromParams(
	strategy: StrategyDefinition,
	params: Record<string, any>
): string[] {
	const symbols: string[] = [];

	// Extract all symbol fields from strategy
	for (const field of strategy.fields) {
		if (field.type === 'symbol' && params[field.key]) {
			symbols.push(params[field.key]);
		}
	}

	return symbols;
}


/**
 * Execute backtest
 */
export async function executeBacktest(
	params: BacktestParams,
	onProgress?: ProgressCallback
): Promise<BacktestResult> {
	try {
		// Extract symbols from strategy parameters
		const symbols = getSymbolsFromParams(params.strategy, params.strategyParams);

		// Fetch historical data (with automatic caching)
		onProgress?.(20, `Fetching data for ${symbols.join(', ')}...`);
		const dataResult = await loadBacktestDataBySymbols({
			symbols,
			dateRange: params.dateRange,
			interval: params.interval,
			gapFillStrategy: params.gapFillStrategy,
		});
		const data = dataResult.data;

		// Create strategy instance
		onProgress?.(40, 'Initializing strategy...');
		const strategyInstance = params.strategy.create(params.strategyParams);

		// Prepare backtest config
		const backtestConfig = {
			initialCapital: params.initialCapital,
			// TODO: Add more config options as needed
		};

		// Run backtest
		onProgress?.(60, 'Running backtest...');
		const result = await runBacktest(strategyInstance, data, backtestConfig);

		onProgress?.(100, 'Complete');
		return result;
	} catch (error) {
		// Enhance error message
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`Backtest failed: ${errorMessage}`);
	}
}


/**
 * Backtest Service
 * Handles backtest execution with caching and progress tracking
 */

import type { BacktestResult } from '@one-love-wealth/backtesting';
import { runBacktest } from '@one-love-wealth/backtesting';
import type { StrategyDefinition } from '$lib/strategies/types';
import type { DateRange } from '$lib/utils/date-range';
import { getCacheManager } from '$lib/cache';
import type { CacheKey } from '$lib/cache/types';

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
 * Generate cache key for backtest
 */
function generateCacheKey(params: BacktestParams): CacheKey {
	const {
		strategy,
		strategyParams,
		dateRange,
		interval,
		initialCapital,
		gapFillStrategy,
	} = params;

	return {
		type: 'backtest',
		strategyId: strategy.id,
		params: strategyParams,
		symbols: getSymbolsFromParams(strategy, strategyParams),
		dateRange: dateRange,
		interval: interval,
		config: {
			initialCapital,
			gapFillStrategy,
		},
	};
}

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
 * Fetch historical data for symbols
 * TODO: Implement actual data fetching from data-layer package
 */
async function fetchHistoricalData(
	symbols: string[],
	dateRange: DateRange,
	interval: '1d' | '1wk' | '1mo'
): Promise<any> {
	// TODO: Replace with actual data-layer API call
	// For now, throw error to indicate not implemented
	throw new Error(
		`Data fetching not yet implemented. Need to fetch ${symbols.join(', ')} from ${dateRange.start} to ${dateRange.end} at ${interval} interval.`
	);

	// Expected implementation:
	// import { fetchMarketData } from '@one-love-wealth/data-layer';
	// return await fetchMarketData({
	//   symbols,
	//   start: dateRange.start,
	//   end: dateRange.end,
	//   interval,
	// });
}

/**
 * Execute backtest
 */
export async function executeBacktest(
	params: BacktestParams,
	onProgress?: ProgressCallback
): Promise<BacktestResult> {
	const cacheManager = getCacheManager();

	// Generate cache key
	const cacheKey = generateCacheKey(params);

	try {
		// Report initial progress
		onProgress?.(5, 'Checking cache...');

		// Check cache first
		const cached = await cacheManager.get(cacheKey);
		if (cached && cached.data) {
			onProgress?.(100, 'Loaded from cache');
			return cached.data as BacktestResult;
		}

		// Extract symbols from strategy parameters
		const symbols = getSymbolsFromParams(params.strategy, params.strategyParams);

		// Fetch historical data
		onProgress?.(20, `Fetching data for ${symbols.join(', ')}...`);
		const data = await fetchHistoricalData(symbols, params.dateRange, params.interval);

		// Create strategy instance
		onProgress?.(40, 'Initializing strategy...');
		const strategyInstance = params.strategy.create(params.strategyParams);

		// Prepare backtest config
		const backtestConfig = {
			initialCapital: params.initialCapital,
			// TODO: Add more config options as needed
		};

		// Run backtest
		onProgress?.(50, 'Running backtest...');
		const result = await runBacktest(strategyInstance, data, backtestConfig);

		// Cache result
		onProgress?.(90, 'Caching results...');
		await cacheManager.set(cacheKey, {
			data: result,
			metadata: {
				timestamp: Date.now(),
				ttl:
					params.interval === '1d'
						? 24 * 60 * 60 * 1000
						: params.interval === '1wk'
							? 7 * 24 * 60 * 60 * 1000
							: 30 * 24 * 60 * 60 * 1000,
				size: JSON.stringify(result).length,
			},
		});

		onProgress?.(100, 'Complete');
		return result;
	} catch (error) {
		// Enhance error message
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`Backtest failed: ${errorMessage}`);
	}
}

/**
 * Invalidate cached backtest
 */
export async function invalidateBacktest(params: BacktestParams): Promise<void> {
	const cacheManager = getCacheManager();
	const cacheKey = generateCacheKey(params);
	const keyStr = JSON.stringify(cacheKey);
	await cacheManager.delete(keyStr);
}

/**
 * Clear all backtest caches
 */
export async function clearAllBacktests(): Promise<void> {
	const cacheManager = getCacheManager();
	await cacheManager.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
	const cacheManager = getCacheManager();
	return cacheManager.getStats();
}

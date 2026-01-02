/**
 * Optimization Service
 * Manages optimization worker lifecycle and data loading
 */

import type {
	Strategy,
	BacktestConfig,
	OptimizationMethod,
	OptimizationObjective,
	OptimizationOutput
} from '@one-love-wealth/backtesting';
// import { loadBacktestDataBySymbols } from '@one-love-wealth/data-layer'; // TODO: uncomment when data-layer exports this
import type { DateRange } from '$lib/types';

// Import worker (Vite handles this specially)
import OptimizationWorker from '$lib/workers/optimization.worker?worker';

export interface OptimizationParams {
	method: OptimizationMethod;
	objective: OptimizationObjective;
	paramRanges: Record<string, { min: number; max: number; step: number }>;
	iterations?: number; // For random/genetic
	strategy: Strategy;
	strategyParams: Record<string, any>;
	dateRange: DateRange;
	interval: '1d' | '1wk' | '1mo';
	initialCapital: number;
	gapFillStrategy: 'forward-fill' | 'drop' | 'interpolate';
	symbols: string[];
}

export type ProgressCallback = (iteration: number, total: number) => void;

let currentWorker: Worker | null = null;

export async function executeOptimization(
	params: OptimizationParams,
	onProgress?: ProgressCallback
): Promise<OptimizationOutput> {
	// Load historical data once
	const historicalData = await fetchHistoricalData(
		params.symbols,
		params.dateRange,
		params.interval
	);

	// Create backtest config
	const backtestConfig: BacktestConfig = {
		symbols: params.symbols,
		startDate: new Date(params.dateRange.start),
		endDate: new Date(params.dateRange.end),
		initialCapital: params.initialCapital,
		gapFillStrategy: params.gapFillStrategy
	};

	// Create and start worker
	return new Promise<OptimizationOutput>((resolve, reject) => {
		currentWorker = new OptimizationWorker();

		currentWorker.onmessage = (event: MessageEvent) => {
			const { type, data } = event.data;

			switch (type) {
				case 'progress':
					if (onProgress) {
						onProgress(data.iteration, data.total);
					}
					break;

				case 'result':
					currentWorker?.terminate();
					currentWorker = null;
					resolve(data as OptimizationOutput);
					break;

				case 'error':
					currentWorker?.terminate();
					currentWorker = null;
					reject(new Error(data));
					break;
			}
		};

		currentWorker.onerror = (error) => {
			currentWorker?.terminate();
			currentWorker = null;
			reject(new Error(`Worker error: ${error.message}`));
		};

		// Start optimization
		currentWorker.postMessage({
			type: 'start',
			data: {
				method: params.method,
				objective: params.objective,
				paramRanges: params.paramRanges,
				iterations: params.iterations,
				strategy: params.strategy,
				backtestConfig,
				historicalData
			}
		});
	});
}

export function cancelOptimization(): void {
	if (currentWorker) {
		currentWorker.terminate();
		currentWorker = null;
	}
}

// Placeholder for data fetching (TODO: implement actual data-layer integration)
async function fetchHistoricalData(
	symbols: string[],
	dateRange: DateRange,
	interval: string
): Promise<any> {
	// TODO: Replace with actual data-layer API call
	// For now, throw descriptive error
	throw new Error(
		`Data fetching not yet implemented. Need to fetch ${symbols.join(', ')} from ${dateRange.start} to ${dateRange.end} at ${interval} interval for optimization.`
	);

	// Expected implementation:
	// return await loadBacktestDataBySymbols({
	//   symbols,
	//   startDate: new Date(dateRange.start),
	//   endDate: new Date(dateRange.end),
	//   interval,
	// });
}

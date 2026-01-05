/**
 * Optimization Service
 * Manages optimization worker lifecycle and data loading
 * 
 * ## Worker Communication
 * Data sent to web workers via postMessage must be serializable using the
 * structured clone algorithm. This service handles serialization of:
 * - Date objects → timestamps (numbers)
 * - Svelte 5 reactive proxies ($state) → plain objects
 * - Functions → removed
 * 
 * The worker reconstructs Date objects from timestamps on its end.
 */

import type {
	BacktestConfig,
	OptimizationMethod,
	OptimizationObjective,
	OptimizationOutput
} from '@one-love-wealth/backtesting';
import type { DateRange } from '$lib/utils/date-range';
import { loadBacktestDataBySymbols } from './data';

// Import worker (Vite handles this specially)
import OptimizationWorker from '$lib/workers/optimization.worker?worker';

export interface OptimizationParams {
	method: OptimizationMethod;
	objective: OptimizationObjective;
	paramRanges: Record<string, { min: number; max: number; step: number }>;
	iterations?: number; // For random/genetic
	strategyId: string;
	strategyParams: Record<string, any>;
	dateRange: DateRange;
	interval: '1d' | '1wk' | '1mo';
	initialCapital: number;
	gapFillStrategy: 'forward-fill' | 'drop' | 'interpolate';
	symbols: string[];
}

export interface CurrentBest {
	value: number;
	params: Record<string, number>;
}

export type ProgressCallback = (iteration: number, total: number, currentBest?: CurrentBest) => void;

let currentWorker: Worker | null = null;

/**
 * Deep clone and serialize an object to plain JSON-safe data.
 * Required for postMessage to web workers.
 * 
 * Handles:
 * - Date objects → converted to timestamps
 * - Svelte 5 proxies → stripped via JSON round-trip
 * - Functions → removed
 */
function deepSerialize(obj: any): any {
	return JSON.parse(JSON.stringify(obj, (key, value) => {
		if (value instanceof Date) return value.getTime();
		if (typeof value === 'function') return undefined;
		return value;
	}));
}

export async function executeOptimization(
	params: OptimizationParams,
	onProgress?: ProgressCallback
): Promise<OptimizationOutput> {
	// Load historical data once
	const dataResult = await loadBacktestDataBySymbols({
		symbols: params.symbols,
		dateRange: params.dateRange,
		interval: params.interval,
		gapFillStrategy: params.gapFillStrategy,
	});
	const historicalData = dataResult.data;

	// Create backtest config
	const backtestConfig: BacktestConfig = {
		initialCapital: params.initialCapital
	};

	// Create and start worker
	return new Promise<OptimizationOutput>((resolve, reject) => {
		currentWorker = new OptimizationWorker();

		currentWorker.onmessage = (event: MessageEvent) => {
			const { type, data } = event.data;

			switch (type) {
				case 'progress':
					if (onProgress) {
						const currentBest = data.currentBest ? {
							value: data.currentBest.value,
							params: data.currentBest.params
						} : undefined;
						onProgress(data.iteration, data.total, currentBest);
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

		// Build message with serialized data (use deepSerialize to strip Svelte proxies)
		const messageData = {
			method: params.method,
			objective: params.objective,
			paramRanges: deepSerialize(params.paramRanges),
			iterations: params.iterations,
			strategyId: params.strategyId,
			strategyParams: deepSerialize(params.strategyParams),
			backtestConfig: deepSerialize(backtestConfig),
			historicalData: {
				symbols: deepSerialize(historicalData.symbols),
				bars: deepSerialize(historicalData.bars),
				startDate: historicalData.startDate.getTime(),
				endDate: historicalData.endDate.getTime(),
			}
		};

		// Start optimization - pass strategyId and params (serializable), not Strategy object
		currentWorker.postMessage({ type: 'start', data: messageData });
	});
}

export function cancelOptimization(): void {
	if (currentWorker) {
		currentWorker.terminate();
		currentWorker = null;
	}
}


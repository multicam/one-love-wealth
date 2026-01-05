/**
 * Optimization Worker
 * Runs parameter optimization algorithms in a separate thread
 * Supports: Grid Search, Random Search, Genetic Algorithm
 * 
 * ## Serialization
 * Data received from main thread has Date objects serialized as timestamps.
 * Results sent back also serialize Date objects to avoid postMessage errors.
 * See: optimization.service.ts for the main thread serialization logic.
 */

import {
	BacktestEngine,
	type Strategy,
	type BacktestConfig,
	type OptimizationMethod,
	type OptimizationObjective,
	type OptimizationOutput,
	type OptimizationResult,
	MACrossoverStrategy,
	RSIReversionStrategy,
	BuyAndHoldStrategy
} from '@one-love-wealth/backtesting';

// Serialized data format (Date objects converted to timestamps for worker transfer)
interface SerializedBacktestData {
	symbols: string[];
	bars: any[];
	startDate: number; // timestamp
	endDate: number;   // timestamp
}

interface WorkerMessage {
	type: 'start';
	data: {
		method: OptimizationMethod;
		objective: OptimizationObjective;
		paramRanges: Record<string, { min: number; max: number; step: number }>;
		iterations?: number; // For random/genetic
		strategyId: string;
		strategyParams: Record<string, any>;
		backtestConfig: BacktestConfig;
		historicalData: SerializedBacktestData; // Serialized data with timestamps
	};
}

// Strategy factory - creates strategy instances from ID and params
function createStrategy(strategyId: string, params: Record<string, any>): Strategy {
	switch (strategyId) {
		case 'ma-crossover':
			return new MACrossoverStrategy(params);
		case 'rsi-reversion':
			return new RSIReversionStrategy(params);
		case 'buy-and-hold':
			return new BuyAndHoldStrategy(params);
		default:
			throw new Error(`Unknown strategy: ${strategyId}`);
	}
}

interface WorkerResponse {
	type: 'progress' | 'result' | 'error';
	data: any;
}

interface CurrentBest {
	value: number;
	params: Record<string, number>;
}

// Helper to create a plain serializable copy of params
function serializeParams(params: Record<string, any>): Record<string, number> {
	const result: Record<string, number> = {};
	for (const key in params) {
		const val = params[key];
		if (typeof val === 'number') {
			result[key] = val;
		}
	}
	return result;
}

/**
 * Serialize optimization output for postMessage.
 * Converts Date objects in BacktestResult to timestamps.
 */
function serializeOutput(output: OptimizationOutput): any {
	const serializeResult = (r: OptimizationResult) => ({
		...r,
		result: {
			...r.result,
			startDate: r.result.startDate instanceof Date ? r.result.startDate.getTime() : r.result.startDate,
			endDate: r.result.endDate instanceof Date ? r.result.endDate.getTime() : r.result.endDate,
		}
	});

	return {
		...output,
		bestResult: output.bestResult ? serializeResult(output.bestResult) : undefined,
		topResults: output.topResults?.map(serializeResult),
		allResults: output.allResults?.map(serializeResult),
	};
}

// Listen for messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { type, data } = event.data;

	if (type === 'start') {
		try {
			const result = await runOptimization(data);
			postMessage({ type: 'result', data: serializeOutput(result) } as WorkerResponse);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown optimization error';
			postMessage({ type: 'error', data: errorMessage } as WorkerResponse);
		}
	}
};

async function runOptimization(data: WorkerMessage['data']): Promise<OptimizationOutput> {
	const { method, objective, paramRanges, iterations, strategyId, strategyParams, backtestConfig, historicalData: serializedData } =
		data;

	// Reconstruct Date objects from timestamps
	const historicalData = {
		symbols: serializedData.symbols,
		bars: serializedData.bars,
		startDate: new Date(serializedData.startDate),
		endDate: new Date(serializedData.endDate),
	};

	switch (method) {
		case 'grid':
			return await gridSearch(paramRanges, objective, strategyId, strategyParams, backtestConfig, historicalData);
		case 'random':
			return await randomSearch(
				paramRanges,
				objective,
				iterations ?? 100,
				strategyId,
				strategyParams,
				backtestConfig,
				historicalData
			);
		case 'genetic':
			return await geneticAlgorithm(
				paramRanges,
				objective,
				iterations ?? 50,
				strategyId,
				strategyParams,
				backtestConfig,
				historicalData
			);
		default:
			throw new Error(`Unknown optimization method: ${method}`);
	}
}

// Grid Search Implementation
async function gridSearch(
	paramRanges: Record<string, { min: number; max: number; step: number }>,
	objective: OptimizationObjective,
	strategyId: string,
	baseParams: Record<string, any>,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const paramNames = Object.keys(paramRanges);
	const allResults: OptimizationResult[] = [];
	let currentBest: CurrentBest | null = null;

	// Generate all combinations
	const combinations = generateGridCombinations(paramRanges);
	const total = combinations.length;

	for (let i = 0; i < combinations.length; i++) {
		const params = combinations[i];

		// Run backtest with these parameters
		const result = await runBacktestWithParams(params, strategyId, baseParams, backtestConfig, historicalData);

		// Extract objective value
		const objectiveValue = getObjectiveValue(result.metrics, objective);

		allResults.push({
			params,
			result,
			objectiveValue,
			rank: 0
		});

		// Track current best
		if (currentBest === null || objectiveValue > currentBest.value) {
			currentBest = { value: objectiveValue, params: serializeParams(params) };
		}

		// Post progress every 5 iterations
		if (i % 5 === 0 || i === combinations.length - 1) {
			postMessage({
				type: 'progress',
				data: { 
					iteration: i + 1, 
					total, 
					currentBest: currentBest ? { value: currentBest.value, params: { ...currentBest.params } } : null 
				}
			} as WorkerResponse);
		}
	}

	// Sort by objective value (descending - higher is better)
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	return {
		method: 'grid',
		objective,
		totalCombinations: total,
		testedCombinations: allResults.length,
		bestResult: allResults[0],
		topResults: allResults.slice(0, 10),
		allResults,
		duration: 0 // Duration tracked by caller
	};
}

// Random Search Implementation
async function randomSearch(
	paramRanges: Record<string, { min: number; max: number; step: number }>,
	objective: OptimizationObjective,
	iterations: number,
	strategyId: string,
	baseParams: Record<string, any>,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const allResults: OptimizationResult[] = [];
	let currentBest: CurrentBest | null = null;

	for (let i = 0; i < iterations; i++) {
		// Generate random parameters
		const params = generateRandomParams(paramRanges);

		// Run backtest
		const result = await runBacktestWithParams(params, strategyId, baseParams, backtestConfig, historicalData);

		// Extract objective value
		const objectiveValue = getObjectiveValue(result.metrics, objective);

		allResults.push({
			params,
			result,
			objectiveValue,
			rank: 0
		});

		// Track current best
		if (currentBest === null || objectiveValue > currentBest.value) {
			currentBest = { value: objectiveValue, params: serializeParams(params) };
		}

		// Post progress every 5 iterations
		if (i % 5 === 0 || i === iterations - 1) {
			postMessage({
				type: 'progress',
				data: { 
					iteration: i + 1, 
					total: iterations, 
					currentBest: currentBest ? { value: currentBest.value, params: { ...currentBest.params } } : null 
				}
			} as WorkerResponse);
		}
	}

	// Sort by objective value
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	return {
		method: 'random',
		objective,
		totalCombinations: iterations,
		testedCombinations: allResults.length,
		bestResult: allResults[0],
		topResults: allResults.slice(0, 10),
		allResults,
		duration: 0 // Duration tracked by caller
	};
}

// Genetic Algorithm Implementation (Simplified)
async function geneticAlgorithm(
	paramRanges: Record<string, { min: number; max: number; step: number }>,
	objective: OptimizationObjective,
	generations: number,
	strategyId: string,
	baseParams: Record<string, any>,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const populationSize = 20;
	const eliteSize = 4;
	const mutationRate = 0.2;
	let currentBest: CurrentBest | null = null;

	// Initialize population
	let population: OptimizationResult[] = [];
	for (let i = 0; i < populationSize; i++) {
		const params = generateRandomParams(paramRanges);
		const result = await runBacktestWithParams(params, strategyId, baseParams, backtestConfig, historicalData);
		const objectiveValue = getObjectiveValue(result.metrics, objective);
		population.push({ params, result, objectiveValue, rank: 0 });
		
		// Track current best
		if (currentBest === null || objectiveValue > currentBest.value) {
			currentBest = { value: objectiveValue, params: serializeParams(params) };
		}
	}

	const allResults: OptimizationResult[] = [...population];
	let iterationCount = populationSize;

	// Evolve for N generations
	for (let gen = 0; gen < generations; gen++) {
		// Sort by fitness
		population.sort((a, b) => b.objectiveValue - a.objectiveValue);

		// Keep elite
		const nextGeneration: OptimizationResult[] = population.slice(0, eliteSize);

		// Generate offspring
		while (nextGeneration.length < populationSize) {
			// Select parents (tournament selection)
			const parent1 = tournamentSelect(population, 3);
			const parent2 = tournamentSelect(population, 3);

			// Crossover (extract only numeric params for genetic operations)
			let childParams = crossover(serializeParams(parent1.params), serializeParams(parent2.params), paramRanges);

			// Mutate
			if (Math.random() < mutationRate) {
				childParams = mutate(childParams, paramRanges);
			}

			// Evaluate child
			const result = await runBacktestWithParams(
				childParams,
				strategyId,
				baseParams,
				backtestConfig,
				historicalData
			);
			const objectiveValue = getObjectiveValue(result.metrics, objective);

			const child: OptimizationResult = {
				params: childParams,
				result,
				objectiveValue,
				rank: 0
			};

			nextGeneration.push(child);
			allResults.push(child);
			iterationCount++;

			// Track current best
			if (currentBest === null || objectiveValue > currentBest.value) {
				currentBest = { value: objectiveValue, params: serializeParams(childParams) };
			}

			// Post progress
			if (iterationCount % 5 === 0) {
				postMessage({
					type: 'progress',
					data: { 
						iteration: iterationCount, 
						total: generations * populationSize, 
						currentBest: currentBest ? { value: currentBest.value, params: { ...currentBest.params } } : null 
					}
				} as WorkerResponse);
			}
		}

		population = nextGeneration;
	}

	// Sort all results
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	const totalCombinations = generations * populationSize;
	return {
		method: 'genetic',
		objective,
		totalCombinations,
		testedCombinations: allResults.length,
		bestResult: allResults[0],
		topResults: allResults.slice(0, 10),
		allResults: allResults.slice(0, 100), // Keep top 100
		duration: 0 // Duration tracked by caller
	};
}

// Helper: Generate all grid combinations
function generateGridCombinations(
	paramRanges: Record<string, { min: number; max: number; step: number }>
): Record<string, number>[] {
	const paramNames = Object.keys(paramRanges);
	if (paramNames.length === 0) return [];

	const combinations: Record<string, number>[] = [];

	function recurse(index: number, current: Record<string, number>) {
		if (index === paramNames.length) {
			combinations.push({ ...current });
			return;
		}

		const paramName = paramNames[index];
		const range = paramRanges[paramName];

		for (let val = range.min; val <= range.max; val += range.step) {
			current[paramName] = val;
			recurse(index + 1, current);
		}
	}

	recurse(0, {});
	return combinations;
}

// Helper: Generate random parameters
function generateRandomParams(
	paramRanges: Record<string, { min: number; max: number; step: number }>
): Record<string, number> {
	const params: Record<string, number> = {};

	for (const key in paramRanges) {
		const range = paramRanges[key];
		const steps = Math.floor((range.max - range.min) / range.step);
		const randomStep = Math.floor(Math.random() * (steps + 1));
		params[key] = range.min + randomStep * range.step;
	}

	return params;
}

// Helper: Tournament selection for genetic algorithm
function tournamentSelect(
	population: OptimizationResult[],
	tournamentSize: number
): OptimizationResult {
	let best = population[Math.floor(Math.random() * population.length)];

	for (let i = 1; i < tournamentSize; i++) {
		const candidate = population[Math.floor(Math.random() * population.length)];
		if (candidate.objectiveValue > best.objectiveValue) {
			best = candidate;
		}
	}

	return best;
}

// Helper: Crossover two parameter sets
function crossover(
	params1: Record<string, number>,
	params2: Record<string, number>,
	paramRanges: Record<string, { min: number; max: number; step: number }>
): Record<string, number> {
	const child: Record<string, number> = {};

	for (const key in params1) {
		// Uniform crossover
		child[key] = Math.random() < 0.5 ? params1[key] : params2[key];
	}

	return child;
}

// Helper: Mutate parameters
function mutate(
	params: Record<string, number>,
	paramRanges: Record<string, { min: number; max: number; step: number }>
): Record<string, number> {
	const mutated = { ...params };
	const keys = Object.keys(mutated);
	const keyToMutate = keys[Math.floor(Math.random() * keys.length)];

	// Add random offset within range
	const range = paramRanges[keyToMutate];
	const steps = Math.floor((range.max - range.min) / range.step);
	const randomStep = Math.floor(Math.random() * (steps + 1));
	mutated[keyToMutate] = range.min + randomStep * range.step;

	return mutated;
}

// Helper: Run backtest with specific parameters
async function runBacktestWithParams(
	optimizedParams: Record<string, number>,
	strategyId: string,
	baseParams: Record<string, any>,
	backtestConfig: BacktestConfig,
	historicalData: any
) {
	// Merge base params with optimized params
	const mergedParams = { ...baseParams, ...optimizedParams };
	
	// Create strategy instance with merged params
	const strategyInstance = createStrategy(strategyId, mergedParams);

	// Run backtest
	const engine = new BacktestEngine(backtestConfig);
	const result = engine.run(strategyInstance, historicalData);

	return result;
}

// Helper: Extract objective value from metrics
function getObjectiveValue(
	metrics: any,
	objective: OptimizationObjective
): number {
	switch (objective) {
		case 'sharpeRatio':
			return metrics.sharpeRatio ?? 0;
		case 'sortinoRatio':
			return metrics.sortinoRatio ?? 0;
		case 'totalReturn':
			return metrics.totalReturnPercent ?? 0;
		case 'calmarRatio':
			return metrics.calmarRatio ?? 0;
		case 'cagr':
			return metrics.cagr ?? 0;
		case 'profitFactor':
			return metrics.profitFactor ?? 0;
		case 'winRate':
			return metrics.winRate ?? 0;
		case 'maxDrawdownPercent':
			return metrics.maxDrawdownPercent ?? 0;
		default:
			return 0;
	}
}

export {};

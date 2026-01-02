/**
 * Optimization Worker
 * Runs parameter optimization algorithms in a separate thread
 * Supports: Grid Search, Random Search, Genetic Algorithm
 */

import { BacktestEngine, type Strategy, type BacktestConfig } from '@one-love-wealth/backtesting';
import type {
	OptimizationMethod,
	OptimizationObjective,
	OptimizationOutput,
	OptimizationResult
} from '@one-love-wealth/backtesting';

interface WorkerMessage {
	type: 'start';
	data: {
		method: OptimizationMethod;
		objective: OptimizationObjective;
		paramRanges: Record<string, { min: number; max: number; step: number }>;
		iterations?: number; // For random/genetic
		strategy: Strategy;
		backtestConfig: BacktestConfig;
		historicalData: any; // Preloaded data
	};
}

interface WorkerResponse {
	type: 'progress' | 'result' | 'error';
	data: any;
}

// Listen for messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { type, data } = event.message;

	if (type === 'start') {
		try {
			const result = await runOptimization(data);
			postMessage({ type: 'result', data: result } as WorkerResponse);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown optimization error';
			postMessage({ type: 'error', data: errorMessage } as WorkerResponse);
		}
	}
};

async function runOptimization(data: WorkerMessage['data']): Promise<OptimizationOutput> {
	const { method, objective, paramRanges, iterations, strategy, backtestConfig, historicalData } =
		data;

	switch (method) {
		case 'grid':
			return await gridSearch(paramRanges, objective, strategy, backtestConfig, historicalData);
		case 'random':
			return await randomSearch(
				paramRanges,
				objective,
				iterations ?? 100,
				strategy,
				backtestConfig,
				historicalData
			);
		case 'genetic':
			return await geneticAlgorithm(
				paramRanges,
				objective,
				iterations ?? 50,
				strategy,
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
	strategy: Strategy,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const paramNames = Object.keys(paramRanges);
	const allResults: OptimizationResult[] = [];

	// Generate all combinations
	const combinations = generateGridCombinations(paramRanges);
	const total = combinations.length;

	for (let i = 0; i < combinations.length; i++) {
		const params = combinations[i];

		// Run backtest with these parameters
		const result = await runBacktestWithParams(params, strategy, backtestConfig, historicalData);

		// Extract objective value
		const objectiveValue = getObjectiveValue(result.metrics, objective);

		allResults.push({
			params,
			objectiveValue,
			metrics: result.metrics
		});

		// Post progress every 5 iterations
		if (i % 5 === 0 || i === combinations.length - 1) {
			postMessage({
				type: 'progress',
				data: { iteration: i + 1, total }
			} as WorkerResponse);
		}
	}

	// Sort by objective value (descending - higher is better)
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	return {
		method: 'grid',
		objective,
		bestParams: allResults[0].params,
		bestObjectiveValue: allResults[0].objectiveValue,
		allResults
	};
}

// Random Search Implementation
async function randomSearch(
	paramRanges: Record<string, { min: number; max: number; step: number }>,
	objective: OptimizationObjective,
	iterations: number,
	strategy: Strategy,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const allResults: OptimizationResult[] = [];

	for (let i = 0; i < iterations; i++) {
		// Generate random parameters
		const params = generateRandomParams(paramRanges);

		// Run backtest
		const result = await runBacktestWithParams(params, strategy, backtestConfig, historicalData);

		// Extract objective value
		const objectiveValue = getObjectiveValue(result.metrics, objective);

		allResults.push({
			params,
			objectiveValue,
			metrics: result.metrics
		});

		// Post progress every 5 iterations
		if (i % 5 === 0 || i === iterations - 1) {
			postMessage({
				type: 'progress',
				data: { iteration: i + 1, total: iterations }
			} as WorkerResponse);
		}
	}

	// Sort by objective value
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	return {
		method: 'random',
		objective,
		bestParams: allResults[0].params,
		bestObjectiveValue: allResults[0].objectiveValue,
		allResults
	};
}

// Genetic Algorithm Implementation (Simplified)
async function geneticAlgorithm(
	paramRanges: Record<string, { min: number; max: number; step: number }>,
	objective: OptimizationObjective,
	generations: number,
	strategy: Strategy,
	backtestConfig: BacktestConfig,
	historicalData: any
): Promise<OptimizationOutput> {
	const populationSize = 20;
	const eliteSize = 4;
	const mutationRate = 0.2;

	// Initialize population
	let population: OptimizationResult[] = [];
	for (let i = 0; i < populationSize; i++) {
		const params = generateRandomParams(paramRanges);
		const result = await runBacktestWithParams(params, strategy, backtestConfig, historicalData);
		const objectiveValue = getObjectiveValue(result.metrics, objective);
		population.push({ params, objectiveValue, metrics: result.metrics });
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

			// Crossover
			let childParams = crossover(parent1.params, parent2.params, paramRanges);

			// Mutate
			if (Math.random() < mutationRate) {
				childParams = mutate(childParams, paramRanges);
			}

			// Evaluate child
			const result = await runBacktestWithParams(
				childParams,
				strategy,
				backtestConfig,
				historicalData
			);
			const objectiveValue = getObjectiveValue(result.metrics, objective);

			const child: OptimizationResult = {
				params: childParams,
				objectiveValue,
				metrics: result.metrics
			};

			nextGeneration.push(child);
			allResults.push(child);
			iterationCount++;

			// Post progress
			if (iterationCount % 5 === 0) {
				postMessage({
					type: 'progress',
					data: { iteration: iterationCount, total: generations * populationSize }
				} as WorkerResponse);
			}
		}

		population = nextGeneration;
	}

	// Sort all results
	allResults.sort((a, b) => b.objectiveValue - a.objectiveValue);

	return {
		method: 'genetic',
		objective,
		bestParams: allResults[0].params,
		bestObjectiveValue: allResults[0].objectiveValue,
		allResults: allResults.slice(0, 100) // Keep top 100
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
	params: Record<string, number>,
	strategy: Strategy,
	backtestConfig: BacktestConfig,
	historicalData: any
) {
	// Create strategy instance with params
	const strategyInstance = new (strategy as any)(params);

	// Run backtest
	const engine = new BacktestEngine(strategyInstance, backtestConfig);
	const result = await engine.run(historicalData);

	return result;
}

// Helper: Extract objective value from metrics
function getObjectiveValue(
	metrics: any,
	objective: OptimizationObjective
): number {
	switch (objective) {
		case 'sharpe':
			return metrics.sharpeRatio ?? 0;
		case 'sortino':
			return metrics.sortinoRatio ?? 0;
		case 'return':
			return metrics.totalReturnPercent ?? 0;
		default:
			return 0;
	}
}

export {};

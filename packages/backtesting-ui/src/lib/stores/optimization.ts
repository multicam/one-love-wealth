/**
 * Optimization Store
 * Manages optimization execution state and results
 * Migrated to Svelte 5 Runes for better reactivity and performance
 */

import { browser } from '$app/environment';
import type { OptimizationOutput } from '@one-love-wealth/backtesting';

const STORAGE_KEY = 'optimization-history';
const MAX_HISTORY = 10;

interface CompressedOptimization {
	id: string;
	timestamp: number;
	strategyId: string;
	strategyName: string;
	method: string;
	objective: string;
	bestObjectiveValue: number;
	bestParams: Record<string, number>;
	totalResults: number;
}

class OptimizationStore {
	#result = $state<OptimizationOutput | null>(null);
	#isRunning = $state<boolean>(false);
	#error = $state<string | null>(null);
	#progress = $state<number>(0);
	#currentIteration = $state<number>(0);
	#totalIterations = $state<number>(0);
	#paramRanges = $state<Record<string, { min: number; max: number; step: number }>>({});
	#history = $state<CompressedOptimization[]>([]);

	constructor() {
		this.loadHistory();
	}

	// Getters
	get result() { return this.#result; }
	get isRunning() { return this.#isRunning; }
	get error() { return this.#error; }
	get progress() { return this.#progress; }
	get currentIteration() { return this.#currentIteration; }
	get totalIterations() { return this.#totalIterations; }
	get paramRanges() { return this.#paramRanges; }
	get history() { return this.#history; }

	// Derived state
	get hasResult() { return this.#result !== null; }
	get hasError() { return this.#error !== null; }
	get bestParams() { return this.#result?.bestResult?.params ?? null; }
	get allResults() { return this.#result?.allResults ?? []; }
	get progressPercent() {
		return this.#totalIterations > 0
			? Math.round((this.#currentIteration / this.#totalIterations) * 100)
			: 0;
	}

	// Actions
	startOptimization(
		ranges: Record<string, { min: number; max: number; step: number }>,
		iterations: number
	) {
		this.#isRunning = true;
		this.#error = null;
		this.#progress = 0;
		this.#currentIteration = 0;
		this.#totalIterations = iterations;
		this.#paramRanges = ranges;
	}

	updateProgress(iteration: number) {
		this.#currentIteration = iteration;
		this.#progress = this.#totalIterations > 0
			? Math.round((iteration / this.#totalIterations) * 100)
			: 0;
	}

	setResult(
		newResult: OptimizationOutput,
		strategyId?: string,
		strategyName?: string
	) {
		this.#result = newResult;
		this.#isRunning = false;
		this.#error = null;
		this.#progress = 100;

		// Add to history if strategy info provided
		if (strategyId && strategyName) {
			const compressed: CompressedOptimization = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
				timestamp: Date.now(),
				strategyId,
				strategyName,
				method: newResult.method,
				objective: newResult.objective,
				bestObjectiveValue: newResult.bestResult.objectiveValue,
				bestParams: newResult.bestResult.params as Record<string, number>,
				totalResults: newResult.allResults.length,
			};

			this.#history = [compressed, ...this.#history.slice(0, MAX_HISTORY - 1)];
			this.saveHistory();
		}
	}

	setError(errorMessage: string) {
		this.#error = errorMessage;
		this.#isRunning = false;
		this.#progress = 0;
	}

	clearResult() {
		this.#result = null;
		this.#error = null;
		this.#progress = 0;
		this.#currentIteration = 0;
		this.#totalIterations = 0;
		this.#paramRanges = {};
	}

	clearError() {
		this.#error = null;
	}

	cancelOptimization() {
		this.#isRunning = false;
		this.#progress = 0;
	}

	updateParamRanges(ranges: Record<string, { min: number; max: number; step: number }>) {
		this.#paramRanges = ranges;
	}

	// History Management
	removeFromHistory(id: string) {
		this.#history = this.#history.filter((h) => h.id !== id);
		this.saveHistory();
	}

	clearHistory() {
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
		this.#history = [];
	}

	private saveHistory(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#history));
		} catch (error) {
			console.error('Failed to save optimization history to localStorage:', error);
		}
	}

	loadHistory(): void {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;

			const history = JSON.parse(stored);
			if (Array.isArray(history)) {
				this.#history = history.slice(0, MAX_HISTORY);
			}
		} catch (error) {
			console.error('Failed to load optimization history from localStorage:', error);
		}
	}
}

export const optimization = new OptimizationStore();

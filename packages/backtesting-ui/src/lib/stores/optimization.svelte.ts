/**
 * Optimization Store
 * Manages optimization execution state and results
 * Uses Svelte 5 runes with proper module state pattern
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

class OptimizationState {
	result = $state<OptimizationOutput | null>(null);
	isRunning = $state(false);
	error = $state<string | null>(null);
	progress = $state<number>(0); // 0-100
	currentIteration = $state<number>(0);
	totalIterations = $state<number>(0);
	paramRanges = $state<Record<string, { min: number; max: number; step: number }>>({});
	history = $state<CompressedOptimization[]>([]);

	// Derived properties
	get hasResult() {
		return this.result !== null;
	}

	get hasError() {
		return this.error !== null;
	}

	get bestParams() {
		return this.result?.bestParams ?? null;
	}

	get allResults() {
		return this.result?.allResults ?? [];
	}

	get progressPercent() {
		return this.totalIterations > 0
			? Math.round((this.currentIteration / this.totalIterations) * 100)
			: 0;
	}

	// Actions
	startOptimization(
		ranges: Record<string, { min: number; max: number; step: number }>,
		iterations: number
	): void {
		this.isRunning = true;
		this.error = null;
		this.progress = 0;
		this.currentIteration = 0;
		this.totalIterations = iterations;
		this.paramRanges = ranges;
	}

	updateProgress(iteration: number): void {
		this.currentIteration = iteration;
		this.progress = this.progressPercent;
	}

	setResult(
		newResult: OptimizationOutput,
		strategyId?: string,
		strategyName?: string
	): void {
		this.result = newResult;
		this.isRunning = false;
		this.error = null;
		this.progress = 100;

		// Add to history if strategy info provided
		if (strategyId && strategyName) {
			this.addToHistory(newResult, strategyId, strategyName);
		}
	}

	setError(errorMessage: string): void {
		this.error = errorMessage;
		this.isRunning = false;
		this.progress = 0;
	}

	clearResult(): void {
		this.result = null;
		this.error = null;
		this.progress = 0;
		this.currentIteration = 0;
		this.totalIterations = 0;
		this.paramRanges = {};
	}

	clearError(): void {
		this.error = null;
	}

	cancelOptimization(): void {
		this.isRunning = false;
		this.progress = 0;
	}

	// History Management
	private addToHistory(
		result: OptimizationOutput,
		strategyId: string,
		strategyName: string
	): void {
		const compressed: CompressedOptimization = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			strategyId,
			strategyName,
			method: result.method,
			objective: result.objective,
			bestObjectiveValue: result.bestObjectiveValue,
			bestParams: result.bestParams,
			totalResults: result.allResults.length
		};

		this.history = [compressed, ...this.history.slice(0, MAX_HISTORY - 1)];
		this.saveHistory();
	}

	private saveHistory(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
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
				this.history = history.slice(0, MAX_HISTORY);
			}
		} catch (error) {
			console.error('Failed to load optimization history from localStorage:', error);
		}
	}

	removeFromHistory(id: string): void {
		this.history = this.history.filter((h) => h.id !== id);
		this.saveHistory();
	}

	clearHistory(): void {
		this.history = [];
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}
}

// Export a single instance
export const optimization = new OptimizationState();

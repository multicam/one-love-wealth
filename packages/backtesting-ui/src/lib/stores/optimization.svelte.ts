/**
 * Optimization Store
 * Manages optimization execution state and results
 * Uses Svelte 5 runes with proper module state pattern
 */

import type { OptimizationOutput } from '@one-love-wealth/backtesting';

class OptimizationState {
	result = $state<OptimizationOutput | null>(null);
	isRunning = $state(false);
	error = $state<string | null>(null);
	progress = $state<number>(0); // 0-100
	currentIteration = $state<number>(0);
	totalIterations = $state<number>(0);
	paramRanges = $state<Record<string, { min: number; max: number; step: number }>>({});

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

	setResult(newResult: OptimizationOutput): void {
		this.result = newResult;
		this.isRunning = false;
		this.error = null;
		this.progress = 100;
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
}

// Export a single instance
export const optimization = new OptimizationState();

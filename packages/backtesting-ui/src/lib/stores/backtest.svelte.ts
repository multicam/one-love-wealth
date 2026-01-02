/**
 * Backtest Store
 * Manages backtest execution state and results
 * Uses Svelte 5 runes with proper module state pattern
 */

import type { BacktestResult } from '@one-love-wealth/backtesting';

class BacktestState {
	result = $state<BacktestResult | null>(null);
	isRunning = $state(false);
	error = $state<string | null>(null);
	progress = $state<number>(0); // 0-100

	// Derived properties
	get hasResult() {
		return this.result !== null;
	}

	get hasError() {
		return this.error !== null;
	}

	get metrics() {
		return this.result?.metrics ?? null;
	}

	get trades() {
		return this.result?.trades ?? [];
	}

	get equity() {
		return this.result?.equity ?? [];
	}

	// Actions
	startBacktest(): void {
		this.isRunning = true;
		this.error = null;
		this.progress = 0;
	}

	setProgress(value: number): void {
		this.progress = Math.min(100, Math.max(0, value));
	}

	setResult(newResult: BacktestResult): void {
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
	}

	clearError(): void {
		this.error = null;
	}

	cancelBacktest(): void {
		this.isRunning = false;
		this.progress = 0;
	}
}

// Export a single instance
export const backtest = new BacktestState();

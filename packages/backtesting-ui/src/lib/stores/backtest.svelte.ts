/**
 * Backtest Store
 * Manages backtest execution state and results
 * Uses Svelte 5 runes with proper module state pattern
 * Stores result history in compressed format
 */

import { browser } from '$app/environment';
import type { BacktestResult } from '@one-love-wealth/backtesting';

const STORAGE_KEY = 'backtest-history';
const MAX_HISTORY = 10;

interface CompressedResult {
	id: string;
	timestamp: number;
	strategyId: string;
	strategyName: string;
	symbols: string[];
	dateRange: { start: string; end: string };
	totalReturn: number;
	sharpeRatio: number;
	maxDrawdown: number;
	totalTrades: number;
	finalValue: number;
}

class BacktestState {
	result = $state<BacktestResult | null>(null);
	isRunning = $state(false);
	error = $state<string | null>(null);
	progress = $state<number>(0); // 0-100
	history = $state<CompressedResult[]>([]);

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

	setResult(newResult: BacktestResult, strategyId?: string, strategyName?: string): void {
		this.result = newResult;
		this.isRunning = false;
		this.error = null;
		this.progress = 100;

		// Add to history
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
	}

	clearError(): void {
		this.error = null;
	}

	cancelBacktest(): void {
		this.isRunning = false;
		this.progress = 0;
	}

	// History management
	private addToHistory(result: BacktestResult, strategyId: string, strategyName: string): void {
		const compressed: CompressedResult = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			strategyId,
			strategyName,
			symbols: result.config.symbols,
			dateRange: {
				start: result.startDate.toISOString(),
				end: result.endDate.toISOString(),
			},
			totalReturn: result.metrics.totalReturnPercent,
			sharpeRatio: result.metrics.sharpeRatio,
			maxDrawdown: result.metrics.maxDrawdownPercent,
			totalTrades: result.metrics.totalTrades,
			finalValue: result.metrics.finalValue,
		};

		// Add to beginning, limit to MAX_HISTORY
		this.history = [compressed, ...this.history.slice(0, MAX_HISTORY - 1)];
		this.saveHistory();
	}

	clearHistory(): void {
		this.history = [];
		this.saveHistory();
	}

	removeFromHistory(id: string): void {
		this.history = this.history.filter((h) => h.id !== id);
		this.saveHistory();
	}

	// Persistence
	private saveHistory(): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
		} catch (error) {
			console.error('Failed to save backtest history to localStorage:', error);
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
			console.error('Failed to load backtest history from localStorage:', error);
		}
	}
}

// Export a single instance
export const backtest = new BacktestState();

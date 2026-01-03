/**
 * Backtest Store
 * Manages backtest execution state and results
 * Migrated to Svelte 5 Runes for better reactivity and performance
 * Stores result history in compressed format
 */

import { browser } from '$app/environment';
import type { BacktestResult } from '@one-love-wealth/backtesting';
import { config } from './config.svelte';
import { strategy } from './strategy.svelte';

const STORAGE_KEY = 'backtest-history';
const MAX_HISTORY = 10;

export interface CompressedResult {
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

class BacktestStore {
	#result = $state<BacktestResult | null>(null);
	#isRunning = $state(false);
	#error = $state<string | null>(null);
	#progress = $state(0); // 0-100
	#history = $state<CompressedResult[]>([]);

	constructor() {
		this.loadHistory();
	}

	// Getters
	get result() { return this.#result; }
	get isRunning() { return this.#isRunning; }
	get error() { return this.#error; }
	get progress() { return this.#progress; }
	get history() { return this.#history; }

	// Derived state
	get hasResult() { return this.#result !== null; }
	get hasError() { return this.#error !== null; }
	get metrics() { return this.#result?.metrics ?? null; }
	get trades() { return this.#result?.trades ?? []; }
	get equity() { return this.#result?.equityCurve ?? []; }

	// Actions
	startBacktest() {
		this.#isRunning = true;
		this.#error = null;
		this.#progress = 0;
	}

	setProgress(value: number) {
		this.#progress = Math.min(100, Math.max(0, value));
	}

	setResult(newResult: BacktestResult, strategyId?: string, strategyName?: string) {
		this.#result = newResult;
		this.#isRunning = false;
		this.#error = null;
		this.#progress = 100;

		// Add to history
		if (strategyId && strategyName) {
			const compressed: CompressedResult = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
				timestamp: Date.now(),
				strategyId,
				strategyName,
				symbols: (newResult.config as any).symbols || config.symbols,
				dateRange: {
					start: newResult.startDate.toISOString(),
					end: newResult.endDate.toISOString(),
				},
				totalReturn: newResult.metrics.totalReturnPercent,
				sharpeRatio: newResult.metrics.sharpeRatio,
				maxDrawdown: newResult.metrics.maxDrawdownPercent,
				totalTrades: newResult.metrics.totalTrades,
				finalValue: newResult.finalPortfolio.totalValue,
			};

			// Add to beginning, limit to MAX_HISTORY
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
	}

	clearError() {
		this.#error = null;
	}

	cancelBacktest() {
		this.#isRunning = false;
		this.#progress = 0;
	}

	// History management
	clearHistory() {
		this.#history = [];
		this.saveHistory();
	}

	removeFromHistory(id: string) {
		this.#history = this.#history.filter((h) => h.id !== id);
		this.saveHistory();
	}

	// Persistence
	private saveHistory(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#history));
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
				this.#history = history.slice(0, MAX_HISTORY);
			}
		} catch (error) {
			console.error('Failed to load backtest history from localStorage:', error);
		}
	}
}

export const backtest = new BacktestStore();

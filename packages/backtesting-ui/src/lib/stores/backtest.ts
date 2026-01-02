/**
 * Backtest Store
 * Manages backtest execution state and results
 * Uses traditional writable store pattern for reliable reactivity
 * Stores result history in compressed format
 */

import { writable, derived } from 'svelte/store';
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

interface BacktestState {
	result: BacktestResult | null;
	isRunning: boolean;
	error: string | null;
	progress: number; // 0-100
	history: CompressedResult[];
}

// Initial state
const initialState: BacktestState = {
	result: null,
	isRunning: false,
	error: null,
	progress: 0,
	history: [],
};

function createBacktestStore() {
	const { subscribe, set, update } = writable<BacktestState>(initialState);

	// Helper functions for history persistence
	function saveHistory(history: CompressedResult[]): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save backtest history to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Actions
		startBacktest: () => {
			update((state) => ({
				...state,
				isRunning: true,
				error: null,
				progress: 0,
			}));
		},

		setProgress: (value: number) => {
			update((state) => ({
				...state,
				progress: Math.min(100, Math.max(0, value)),
			}));
		},

		setResult: (newResult: BacktestResult, strategyId?: string, strategyName?: string) => {
			update((state) => {
				const newState = {
					...state,
					result: newResult,
					isRunning: false,
					error: null,
					progress: 100,
				};

				// Add to history
				if (strategyId && strategyName) {
					const compressed: CompressedResult = {
						id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
						timestamp: Date.now(),
						strategyId,
						strategyName,
						symbols: newResult.config.symbols,
						dateRange: {
							start: newResult.startDate.toISOString(),
							end: newResult.endDate.toISOString(),
						},
						totalReturn: newResult.metrics.totalReturnPercent,
						sharpeRatio: newResult.metrics.sharpeRatio,
						maxDrawdown: newResult.metrics.maxDrawdownPercent,
						totalTrades: newResult.metrics.totalTrades,
						finalValue: newResult.metrics.finalValue,
					};

					// Add to beginning, limit to MAX_HISTORY
					newState.history = [compressed, ...state.history.slice(0, MAX_HISTORY - 1)];
					saveHistory(newState.history);
				}

				return newState;
			});
		},

		setError: (errorMessage: string) => {
			update((state) => ({
				...state,
				error: errorMessage,
				isRunning: false,
				progress: 0,
			}));
		},

		clearResult: () => {
			update((state) => ({
				...state,
				result: null,
				error: null,
				progress: 0,
			}));
		},

		clearError: () => {
			update((state) => ({
				...state,
				error: null,
			}));
		},

		cancelBacktest: () => {
			update((state) => ({
				...state,
				isRunning: false,
				progress: 0,
			}));
		},

		// History management
		clearHistory: () => {
			update((state) => {
				const newState = { ...state, history: [] };
				saveHistory(newState.history);
				return newState;
			});
		},

		removeFromHistory: (id: string) => {
			update((state) => {
				const newState = {
					...state,
					history: state.history.filter((h) => h.id !== id),
				};
				saveHistory(newState.history);
				return newState;
			});
		},

		// Persistence
		loadHistory: () => {
			if (!browser) return;

			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (!stored) return;

				const history = JSON.parse(stored);
				if (Array.isArray(history)) {
					update((state) => ({
						...state,
						history: history.slice(0, MAX_HISTORY),
					}));
				}
			} catch (error) {
				console.error('Failed to load backtest history from localStorage:', error);
			}
		},
	};
}

// Export store instance
export const backtest = createBacktestStore();

// Derived stores for convenient access
export const hasResult = derived(backtest, ($backtest) => $backtest.result !== null);
export const hasError = derived(backtest, ($backtest) => $backtest.error !== null);
export const metrics = derived(backtest, ($backtest) => $backtest.result?.metrics ?? null);
export const trades = derived(backtest, ($backtest) => $backtest.result?.trades ?? []);
export const equity = derived(backtest, ($backtest) => $backtest.result?.equity ?? []);

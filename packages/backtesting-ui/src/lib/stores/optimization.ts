/**
 * Optimization Store
 * Manages optimization execution state and results
 * Uses traditional writable store pattern for reliable reactivity
 */

import { writable, derived } from 'svelte/store';
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

interface OptimizationState {
	result: OptimizationOutput | null;
	isRunning: boolean;
	error: string | null;
	progress: number; // 0-100
	currentIteration: number;
	totalIterations: number;
	paramRanges: Record<string, { min: number; max: number; step: number }>;
	history: CompressedOptimization[];
}

// Initial state
const initialState: OptimizationState = {
	result: null,
	isRunning: false,
	error: null,
	progress: 0,
	currentIteration: 0,
	totalIterations: 0,
	paramRanges: {},
	history: [],
};

function createOptimizationStore() {
	const { subscribe, set, update } = writable<OptimizationState>(initialState);

	// Helper functions for history persistence
	function saveHistory(history: CompressedOptimization[]): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save optimization history to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Actions
		startOptimization: (
			ranges: Record<string, { min: number; max: number; step: number }>,
			iterations: number
		) => {
			update((state) => ({
				...state,
				isRunning: true,
				error: null,
				progress: 0,
				currentIteration: 0,
				totalIterations: iterations,
				paramRanges: ranges,
			}));
		},

		updateProgress: (iteration: number) => {
			update((state) => {
				const progress =
					state.totalIterations > 0
						? Math.round((iteration / state.totalIterations) * 100)
						: 0;
				return {
					...state,
					currentIteration: iteration,
					progress,
				};
			});
		},

		setResult: (
			newResult: OptimizationOutput,
			strategyId?: string,
			strategyName?: string
		) => {
			update((state) => {
				const newState = {
					...state,
					result: newResult,
					isRunning: false,
					error: null,
					progress: 100,
				};

				// Add to history if strategy info provided
				if (strategyId && strategyName) {
					const compressed: CompressedOptimization = {
						id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
						timestamp: Date.now(),
						strategyId,
						strategyName,
						method: newResult.method,
						objective: newResult.objective,
						bestObjectiveValue: newResult.bestObjectiveValue,
						bestParams: newResult.bestParams,
						totalResults: newResult.allResults.length,
					};

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
				currentIteration: 0,
				totalIterations: 0,
				paramRanges: {},
			}));
		},

		clearError: () => {
			update((state) => ({
				...state,
				error: null,
			}));
		},

		cancelOptimization: () => {
			update((state) => ({
				...state,
				isRunning: false,
				progress: 0,
			}));
		},

		updateParamRanges: (ranges: Record<string, { min: number; max: number; step: number }>) => {
			update((state) => ({
				...state,
				paramRanges: ranges,
			}));
		},

		// History Management
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

		clearHistory: () => {
			update((state) => {
				if (browser) {
					localStorage.removeItem(STORAGE_KEY);
				}
				return { ...state, history: [] };
			});
		},

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
				console.error('Failed to load optimization history from localStorage:', error);
			}
		},
	};
}

// Export store instance
export const optimization = createOptimizationStore();

// Derived stores for convenient access
export const hasResult = derived(optimization, ($optimization) => $optimization.result !== null);
export const hasError = derived(optimization, ($optimization) => $optimization.error !== null);
export const bestParams = derived(optimization, ($optimization) => $optimization.result?.bestParams ?? null);
export const allResults = derived(optimization, ($optimization) => $optimization.result?.allResults ?? []);
export const progressPercent = derived(optimization, ($optimization) =>
	$optimization.totalIterations > 0
		? Math.round(($optimization.currentIteration / $optimization.totalIterations) * 100)
		: 0
);

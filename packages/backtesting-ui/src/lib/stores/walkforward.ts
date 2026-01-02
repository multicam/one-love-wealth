/**
 * Walk-Forward Analysis Store
 *
 * Manages state for walk-forward analysis including:
 * - Window configuration (in-sample %, out-sample %, step size)
 * - Anchored vs Rolling mode
 * - Analysis execution state
 * - Results and history
 *
 * Uses traditional writable store pattern for reliable reactivity
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface WalkForwardConfig {
	inSamplePercent: number; // 60 = 60%
	outSamplePercent: number; // 40 = 40%
	stepSizePercent: number; // 20 = 20%
	anchored: boolean; // true = anchored, false = rolling
}

export interface WindowMetrics {
	sharpe: number;
	sortino: number;
	totalReturn: number;
	maxDrawdown: number;
	winRate: number;
	cagr: number;
}

export interface WalkForwardWindow {
	windowNumber: number;
	inSampleStart: string; // ISO date
	inSampleEnd: string;
	outSampleStart: string;
	outSampleEnd: string;
	bestParams: Record<string, number>; // Optimized on in-sample
	inSampleMetrics: WindowMetrics;
	outSampleMetrics: WindowMetrics;
	degradationPercent: number; // (in-sample - out-sample) / in-sample * 100
}

export interface WalkForwardOutput {
	config: WalkForwardConfig;
	strategyId: string;
	strategyName: string;
	symbols?: string[]; // Optional symbols array
	windows: WalkForwardWindow[];
	aggregateInSample: WindowMetrics;
	aggregateOutSample: WindowMetrics;
	averageDegradation: number;
	passFailStatus: 'pass' | 'fail'; // pass if degradation < 20%
	equityCurveStitched: Array<{ date: string; value: number }>; // Out-of-sample only
}

interface CompressedWalkForward {
	id: string;
	timestamp: number;
	strategyId: string;
	strategyName: string;
	windowCount: number;
	averageDegradation: number;
	passFailStatus: 'pass' | 'fail';
	aggregateOutSample: WindowMetrics;
}

interface WalkForwardState {
	config: WalkForwardConfig;
	isRunning: boolean;
	currentWindow: number;
	totalWindows: number;
	result: WalkForwardOutput | null;
	error: string | null;
	history: CompressedWalkForward[];
}

// Initial state
const initialState: WalkForwardState = {
	config: {
		inSamplePercent: 60,
		outSamplePercent: 40,
		stepSizePercent: 20,
		anchored: false,
	},
	isRunning: false,
	currentWindow: 0,
	totalWindows: 0,
	result: null,
	error: null,
	history: [],
};

function createWalkForwardStore() {
	const { subscribe, set, update } = writable<WalkForwardState>(initialState);

	// Helper functions for history persistence
	function saveHistory(history: CompressedWalkForward[]): void {
		if (!browser) return;
		try {
			localStorage.setItem('walkforward-history', JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save walk-forward history to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Configuration methods
		updateConfig: (updates: Partial<WalkForwardConfig>) => {
			update((state) => ({
				...state,
				config: { ...state.config, ...updates },
			}));
		},

		resetConfig: () => {
			update((state) => ({
				...state,
				config: {
					inSamplePercent: 60,
					outSamplePercent: 40,
					stepSizePercent: 20,
					anchored: false,
				},
			}));
		},

		// Execution methods
		startAnalysis: (totalWindows: number) => {
			update((state) => ({
				...state,
				isRunning: true,
				currentWindow: 0,
				totalWindows,
				error: null,
			}));
		},

		updateProgress: (windowNumber: number) => {
			update((state) => ({
				...state,
				currentWindow: windowNumber,
			}));
		},

		setResult: (newResult: WalkForwardOutput, strategyId?: string, strategyName?: string) => {
			update((state) => {
				const newState = {
					...state,
					isRunning: false,
					result: newResult,
					currentWindow: 0,
					totalWindows: 0,
				};

				if (strategyId && strategyName) {
					const compressed: CompressedWalkForward = {
						id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
						timestamp: Date.now(),
						strategyId,
						strategyName,
						windowCount: newResult.windows.length,
						averageDegradation: newResult.averageDegradation,
						passFailStatus: newResult.passFailStatus,
						aggregateOutSample: newResult.aggregateOutSample,
					};

					newState.history = [compressed, ...state.history.slice(0, 9)]; // Keep last 10
					saveHistory(newState.history);
				}

				return newState;
			});
		},

		setError: (errorMessage: string) => {
			update((state) => ({
				...state,
				isRunning: false,
				error: errorMessage,
				currentWindow: 0,
				totalWindows: 0,
			}));
		},

		stopAnalysis: () => {
			update((state) => ({
				...state,
				isRunning: false,
				currentWindow: 0,
				totalWindows: 0,
			}));
		},

		clearResult: () => {
			update((state) => ({
				...state,
				result: null,
				error: null,
				currentWindow: 0,
				totalWindows: 0,
			}));
		},

		// History methods
		loadHistoryItem: (id: string) => {
			// TODO: Implement full result loading from localStorage
			// For now, this is a placeholder
			console.log(`Loading walk-forward history item: ${id}`);
		},

		clearHistory: () => {
			update((state) => {
				const newState = { ...state, history: [] };
				saveHistory(newState.history);
				return newState;
			});
		},

		loadHistory: () => {
			if (!browser) return;
			try {
				const stored = localStorage.getItem('walkforward-history');
				if (stored) {
					const history = JSON.parse(stored);
					if (Array.isArray(history)) {
						update((state) => ({
							...state,
							history,
						}));
					}
				}
			} catch (error) {
				console.error('Failed to load walk-forward history from localStorage:', error);
			}
		},
	};
}

// Export store instance
export const walkforward = createWalkForwardStore();

// Derived stores for convenient access
export const hasResult = derived(walkforward, ($walkforward) => $walkforward.result !== null);
export const progress = derived(walkforward, ($walkforward) =>
	$walkforward.totalWindows === 0
		? 0
		: ($walkforward.currentWindow / $walkforward.totalWindows) * 100
);

/**
 * Walk-Forward Analysis Store
 * Manages state for walk-forward analysis
 * Migrated to Svelte 5 Runes for better reactivity and performance
 */

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

class WalkForwardStore {
	#config = $state<WalkForwardConfig>({
		inSamplePercent: 60,
		outSamplePercent: 40,
		stepSizePercent: 20,
		anchored: false,
	});
	#isRunning = $state<boolean>(false);
	#currentWindow = $state<number>(0);
	#totalWindows = $state<number>(0);
	#result = $state<WalkForwardOutput | null>(null);
	#error = $state<string | null>(null);
	#history = $state<CompressedWalkForward[]>([]);

	constructor() {
		this.loadHistory();
	}

	// Getters
	get config() { return this.#config; }
	get isRunning() { return this.#isRunning; }
	get currentWindow() { return this.#currentWindow; }
	get totalWindows() { return this.#totalWindows; }
	get result() { return this.#result; }
	get error() { return this.#error; }
	get history() { return this.#history; }

	// Derived state
	get hasResult() { return this.#result !== null; }
	get progress() {
		return this.#totalWindows === 0
			? 0
			: (this.#currentWindow / this.#totalWindows) * 100;
	}

	// Actions
	updateConfig(updates: Partial<WalkForwardConfig>) {
		this.#config = { ...this.#config, ...updates };
	}

	resetConfig() {
		this.#config = {
			inSamplePercent: 60,
			outSamplePercent: 40,
			stepSizePercent: 20,
			anchored: false,
		};
	}

	startAnalysis(totalWindows: number) {
		this.#isRunning = true;
		this.#currentWindow = 0;
		this.#totalWindows = totalWindows;
		this.#error = null;
	}

	updateProgress(windowNumber: number) {
		this.#currentWindow = windowNumber;
	}

	setResult(newResult: WalkForwardOutput, strategyId?: string, strategyName?: string) {
		this.#isRunning = false;
		this.#result = newResult;
		this.#currentWindow = 0;
		this.#totalWindows = 0;

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

			this.#history = [compressed, ...this.#history.slice(0, 9)];
			this.saveHistory();
		}
	}

	setError(errorMessage: string) {
		this.#isRunning = false;
		this.#error = errorMessage;
		this.#currentWindow = 0;
		this.#totalWindows = 0;
	}

	stopAnalysis() {
		this.#isRunning = false;
		this.#currentWindow = 0;
		this.#totalWindows = 0;
	}

	clearResult() {
		this.#result = null;
		this.#error = null;
		this.#currentWindow = 0;
		this.#totalWindows = 0;
	}

	// History methods
	clearHistory() {
		this.#history = [];
		this.saveHistory();
	}

	private saveHistory(): void {
		if (!browser) return;
		try {
			localStorage.setItem('walkforward-history', JSON.stringify(this.#history));
		} catch (error) {
			console.error('Failed to save walk-forward history to localStorage:', error);
		}
	}

	loadHistory(): void {
		if (!browser) return;
		try {
			const stored = localStorage.getItem('walkforward-history');
			if (stored) {
				const history = JSON.parse(stored);
				if (Array.isArray(history)) {
					this.#history = history;
				}
			}
		} catch (error) {
			console.error('Failed to load walk-forward history from localStorage:', error);
		}
	}
}

export const walkforward = new WalkForwardStore();

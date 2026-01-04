/**
 * Optimization Store
 * Manages optimization execution state and results
 * Migrated to Svelte 5 Runes for better reactivity and performance
 */

import { browser } from '$app/environment';
import type { OptimizationOutput } from '@one-love-wealth/backtesting';

const STORAGE_KEY = 'optimization-history';
const MAX_HISTORY = 10;

export type OptimizationPhase = 'idle' | 'loading-data' | 'optimizing' | 'finalizing' | 'complete' | 'error' | 'cancelled';

export interface ProgressStats {
	startTime: number;
	currentIteration: number;
	totalIterations: number;
	iterationTimes: number[]; // Last N iteration durations for averaging
	currentBestValue: number | null;
	currentBestParams: Record<string, number> | null;
	phase: OptimizationPhase;
	phaseMessage: string;
}

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
	
	// Enhanced progress tracking
	#phase = $state<OptimizationPhase>('idle');
	#phaseMessage = $state<string>('');
	#startTime = $state<number>(0);
	#lastIterationTime = $state<number>(0);
	#iterationTimes = $state<number[]>([]);
	#currentBestValue = $state<number | null>(null);
	#currentBestParams = $state<Record<string, number> | null>(null);
	#method = $state<string>('');
	#objective = $state<string>('');

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
	
	// Enhanced progress getters
	get phase() { return this.#phase; }
	get phaseMessage() { return this.#phaseMessage; }
	get startTime() { return this.#startTime; }
	get currentBestValue() { return this.#currentBestValue; }
	get currentBestParams() { return this.#currentBestParams; }
	get method() { return this.#method; }
	get objective() { return this.#objective; }

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
	
	// Enhanced derived state
	get elapsedTime() {
		if (this.#startTime === 0) return 0;
		return Date.now() - this.#startTime;
	}
	
	get estimatedTimeRemaining() {
		if (this.#currentIteration === 0 || this.#iterationTimes.length === 0) return null;
		const avgTime = this.#iterationTimes.reduce((a, b) => a + b, 0) / this.#iterationTimes.length;
		const remaining = this.#totalIterations - this.#currentIteration;
		return avgTime * remaining;
	}
	
	get iterationsPerSecond() {
		if (this.#iterationTimes.length === 0) return 0;
		const avgTime = this.#iterationTimes.reduce((a, b) => a + b, 0) / this.#iterationTimes.length;
		return avgTime > 0 ? 1000 / avgTime : 0;
	}
	
	get progressStats(): ProgressStats {
		return {
			startTime: this.#startTime,
			currentIteration: this.#currentIteration,
			totalIterations: this.#totalIterations,
			iterationTimes: [...this.#iterationTimes],
			currentBestValue: this.#currentBestValue,
			currentBestParams: this.#currentBestParams,
			phase: this.#phase,
			phaseMessage: this.#phaseMessage
		};
	}

	// Actions
	startOptimization(
		ranges: Record<string, { min: number; max: number; step: number }>,
		iterations: number,
		method: string = '',
		objective: string = ''
	) {
		this.#isRunning = true;
		this.#error = null;
		this.#progress = 0;
		this.#currentIteration = 0;
		this.#totalIterations = iterations;
		this.#paramRanges = ranges;
		
		// Enhanced tracking
		this.#phase = 'loading-data';
		this.#phaseMessage = 'Loading historical data...';
		this.#startTime = Date.now();
		this.#lastIterationTime = Date.now();
		this.#iterationTimes = [];
		this.#currentBestValue = null;
		this.#currentBestParams = null;
		this.#method = method;
		this.#objective = objective;
	}
	
	setPhase(phase: OptimizationPhase, message: string = '') {
		this.#phase = phase;
		this.#phaseMessage = message || this.getDefaultPhaseMessage(phase);
	}
	
	private getDefaultPhaseMessage(phase: OptimizationPhase): string {
		switch (phase) {
			case 'idle': return '';
			case 'loading-data': return 'Loading historical data...';
			case 'optimizing': return 'Running optimization...';
			case 'finalizing': return 'Finalizing results...';
			case 'complete': return 'Optimization complete!';
			case 'error': return 'Optimization failed';
			case 'cancelled': return 'Optimization cancelled';
			default: return '';
		}
	}

	updateProgress(
		iteration: number,
		currentBest?: { value: number; params: Record<string, number> }
	) {
		// Track iteration timing (keep last 20 for averaging)
		const now = Date.now();
		if (this.#lastIterationTime > 0 && iteration > 1) {
			const iterationTime = now - this.#lastIterationTime;
			this.#iterationTimes = [...this.#iterationTimes.slice(-19), iterationTime];
		}
		this.#lastIterationTime = now;
		
		this.#currentIteration = iteration;
		this.#progress = this.#totalIterations > 0
			? Math.round((iteration / this.#totalIterations) * 100)
			: 0;
		
		// Update current best if provided
		if (currentBest) {
			if (this.#currentBestValue === null || currentBest.value > this.#currentBestValue) {
				this.#currentBestValue = currentBest.value;
				this.#currentBestParams = currentBest.params;
			}
		}
		
		// Update phase if needed
		if (this.#phase === 'loading-data' && iteration > 0) {
			this.#phase = 'optimizing';
			this.#phaseMessage = `Testing parameter combinations...`;
		}
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
		this.#phase = 'complete';
		this.#phaseMessage = `Found best ${this.#objective}: ${newResult.bestResult.objectiveValue.toFixed(2)}`;

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
		this.#phase = 'error';
		this.#phaseMessage = errorMessage;
	}

	clearResult() {
		this.#result = null;
		this.#error = null;
		this.#progress = 0;
		this.#currentIteration = 0;
		this.#totalIterations = 0;
		this.#paramRanges = {};
		this.#phase = 'idle';
		this.#phaseMessage = '';
		this.#currentBestValue = null;
		this.#currentBestParams = null;
	}

	clearError() {
		this.#error = null;
	}

	cancelOptimization() {
		this.#isRunning = false;
		this.#progress = 0;
		this.#phase = 'cancelled';
		this.#phaseMessage = 'Optimization cancelled by user';
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

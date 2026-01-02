/**
 * Optimization Store
 * Manages optimization execution state and results
 */

import type { OptimizationOutput } from '@one-love-wealth/backtesting';

// State
export let result = $state<OptimizationOutput | null>(null);
export let isRunning = $state(false);
export let error = $state<string | null>(null);
export let progress = $state<number>(0); // 0-100
export let currentIteration = $state<number>(0);
export let totalIterations = $state<number>(0);

// Parameter ranges being optimized
export let paramRanges = $state<Record<string, { min: number; max: number; step: number }>>({});

// Derived
export const hasResult = $derived(result !== null);
export const hasError = $derived(error !== null);
export const bestParams = $derived(result?.bestParams ?? null);
export const allResults = $derived(result?.allResults ?? []);
export const progressPercent = $derived(
	totalIterations > 0 ? Math.round((currentIteration / totalIterations) * 100) : 0
);

// Actions
export function startOptimization(
	ranges: Record<string, { min: number; max: number; step: number }>,
	iterations: number
): void {
	isRunning = true;
	error = null;
	progress = 0;
	currentIteration = 0;
	totalIterations = iterations;
	paramRanges = ranges;
}

export function updateProgress(iteration: number): void {
	currentIteration = iteration;
	progress = progressPercent;
}

export function setResult(newResult: OptimizationOutput): void {
	result = newResult;
	isRunning = false;
	error = null;
	progress = 100;
}

export function setError(errorMessage: string): void {
	error = errorMessage;
	isRunning = false;
	progress = 0;
}

export function clearResult(): void {
	result = null;
	error = null;
	progress = 0;
	currentIteration = 0;
	totalIterations = 0;
	paramRanges = {};
}

export function clearError(): void {
	error = null;
}

export function cancelOptimization(): void {
	isRunning = false;
	progress = 0;
}

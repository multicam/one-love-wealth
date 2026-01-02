/**
 * Backtest Store
 * Manages backtest execution state and results
 */

import type { BacktestResult } from '@one-love-wealth/backtesting';

// State
export let result = $state<BacktestResult | null>(null);
export let isRunning = $state(false);
export let error = $state<string | null>(null);
export let progress = $state<number>(0); // 0-100

// Derived
export const hasResult = $derived(result !== null);
export const hasError = $derived(error !== null);
export const metrics = $derived(result?.metrics ?? null);
export const trades = $derived(result?.trades ?? []);
export const equity = $derived(result?.equity ?? []);

// Actions
export function startBacktest(): void {
	isRunning = true;
	error = null;
	progress = 0;
}

export function setProgress(value: number): void {
	progress = Math.min(100, Math.max(0, value));
}

export function setResult(newResult: BacktestResult): void {
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
}

export function clearError(): void {
	error = null;
}

export function cancelBacktest(): void {
	isRunning = false;
	progress = 0;
}

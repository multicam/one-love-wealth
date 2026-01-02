/**
 * Config Store
 * Manages backtest configuration (symbols, dates, intervals)
 */

import { DEFAULT_CONFIG } from '$lib/config/defaults';
import type { DateRange } from '$lib/utils/date-range';

// State
export let symbols = $state<string[]>([DEFAULT_CONFIG.defaultSymbol]);
export let dateRange = $state<DateRange>({
	start: DEFAULT_CONFIG.dateRange.start,
	end: DEFAULT_CONFIG.dateRange.end,
});
export let interval = $state<'1d' | '1wk' | '1mo'>(DEFAULT_CONFIG.interval);
export let gapFillStrategy = $state<'forward-fill' | 'backward-fill' | 'drop'>(
	DEFAULT_CONFIG.gapFillStrategy
);
export let initialCapital = $state<number>(DEFAULT_CONFIG.initialCapital);

// Derived
export const isSingleSymbol = $derived(symbols.length === 1);
export const isMultiSymbol = $derived(symbols.length > 1);
export const primarySymbol = $derived(symbols[0] ?? null);

// Actions
export function setSymbols(newSymbols: string[]): void {
	symbols = newSymbols;
}

export function addSymbol(symbol: string): void {
	if (!symbols.includes(symbol)) {
		symbols = [...symbols, symbol];
	}
}

export function removeSymbol(symbol: string): void {
	symbols = symbols.filter((s) => s !== symbol);
}

export function setDateRange(range: DateRange): void {
	dateRange = range;
}

export function setInterval(newInterval: '1d' | '1wk' | '1mo'): void {
	interval = newInterval;
}

export function setGapFillStrategy(strategy: 'forward-fill' | 'backward-fill' | 'drop'): void {
	gapFillStrategy = strategy;
}

export function setInitialCapital(capital: number): void {
	initialCapital = capital;
}

export function resetToDefaults(): void {
	symbols = [DEFAULT_CONFIG.defaultSymbol];
	dateRange = {
		start: DEFAULT_CONFIG.dateRange.start,
		end: DEFAULT_CONFIG.dateRange.end,
	};
	interval = DEFAULT_CONFIG.interval;
	gapFillStrategy = DEFAULT_CONFIG.gapFillStrategy;
	initialCapital = DEFAULT_CONFIG.initialCapital;
}

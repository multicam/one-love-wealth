/**
 * Config Store
 * Manages backtest configuration (symbols, dates, intervals)
 * Uses Svelte 5 runes with proper module state pattern
 */

import { DEFAULT_CONFIG } from '$lib/config/defaults';
import type { DateRange } from '$lib/utils/date-range';

class ConfigState {
	symbols = $state<string[]>([DEFAULT_CONFIG.defaultSymbol]);
	dateRange = $state<DateRange>({
		start: DEFAULT_CONFIG.dateRange.start,
		end: DEFAULT_CONFIG.dateRange.end,
	});
	interval = $state<'1d' | '1wk' | '1mo'>(DEFAULT_CONFIG.interval);
	gapFillStrategy = $state<'forward-fill' | 'backward-fill' | 'drop'>(
		DEFAULT_CONFIG.gapFillStrategy
	);
	initialCapital = $state<number>(DEFAULT_CONFIG.initialCapital);

	// Derived properties
	get isSingleSymbol() {
		return this.symbols.length === 1;
	}

	get isMultiSymbol() {
		return this.symbols.length > 1;
	}

	get primarySymbol() {
		return this.symbols[0] ?? null;
	}

	// Actions
	setSymbols(newSymbols: string[]): void {
		this.symbols = newSymbols;
	}

	addSymbol(symbol: string): void {
		if (!this.symbols.includes(symbol)) {
			this.symbols = [...this.symbols, symbol];
		}
	}

	removeSymbol(symbol: string): void {
		this.symbols = this.symbols.filter((s) => s !== symbol);
	}

	setDateRange(range: DateRange): void {
		this.dateRange = range;
	}

	setInterval(newInterval: '1d' | '1wk' | '1mo'): void {
		this.interval = newInterval;
	}

	setGapFillStrategy(strategy: 'forward-fill' | 'backward-fill' | 'drop'): void {
		this.gapFillStrategy = strategy;
	}

	setInitialCapital(capital: number): void {
		this.initialCapital = capital;
	}

	resetToDefaults(): void {
		this.symbols = [DEFAULT_CONFIG.defaultSymbol];
		this.dateRange = {
			start: DEFAULT_CONFIG.dateRange.start,
			end: DEFAULT_CONFIG.dateRange.end,
		};
		this.interval = DEFAULT_CONFIG.interval;
		this.gapFillStrategy = DEFAULT_CONFIG.gapFillStrategy;
		this.initialCapital = DEFAULT_CONFIG.initialCapital;
	}
}

// Export a single instance
export const config = new ConfigState();

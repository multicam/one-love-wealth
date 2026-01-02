/**
 * Config Store
 * Manages backtest configuration (symbols, dates, intervals)
 * Uses Svelte 5 runes with proper module state pattern
 * Persists to localStorage automatically
 */

import { browser } from '$app/environment';
import { DEFAULT_CONFIG } from '$lib/config/defaults';
import type { DateRange } from '$lib/utils/date-range';

const STORAGE_KEY = 'backtest-config';

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
		this.save();
	}

	addSymbol(symbol: string): void {
		if (!this.symbols.includes(symbol)) {
			this.symbols = [...this.symbols, symbol];
			this.save();
		}
	}

	removeSymbol(symbol: string): void {
		this.symbols = this.symbols.filter((s) => s !== symbol);
		this.save();
	}

	setDateRange(range: DateRange): void {
		this.dateRange = range;
		this.save();
	}

	setInterval(newInterval: '1d' | '1wk' | '1mo'): void {
		this.interval = newInterval;
		this.save();
	}

	setGapFillStrategy(strategy: 'forward-fill' | 'backward-fill' | 'drop'): void {
		this.gapFillStrategy = strategy;
		this.save();
	}

	setInitialCapital(capital: number): void {
		this.initialCapital = capital;
		this.save();
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
		this.save();
	}

	// Persistence
	save(): void {
		if (!browser) return;

		try {
			const state = {
				symbols: this.symbols,
				dateRange: this.dateRange,
				interval: this.interval,
				gapFillStrategy: this.gapFillStrategy,
				initialCapital: this.initialCapital,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.error('Failed to save config to localStorage:', error);
		}
	}

	load(): void {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;

			const state = JSON.parse(stored);

			// Validate and restore state
			if (Array.isArray(state.symbols) && state.symbols.length > 0) {
				this.symbols = state.symbols;
			}
			if (state.dateRange?.start && state.dateRange?.end) {
				this.dateRange = {
					start: new Date(state.dateRange.start),
					end: new Date(state.dateRange.end),
				};
			}
			if (state.interval) {
				this.interval = state.interval;
			}
			if (state.gapFillStrategy) {
				this.gapFillStrategy = state.gapFillStrategy;
			}
			if (typeof state.initialCapital === 'number') {
				this.initialCapital = state.initialCapital;
			}
		} catch (error) {
			console.error('Failed to load config from localStorage:', error);
		}
	}
}

// Export a single instance
export const config = new ConfigState();

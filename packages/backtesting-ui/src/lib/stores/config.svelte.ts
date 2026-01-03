/**
 * Config Store
 * Manages backtest configuration (symbols, dates, intervals)
 * Migrated to Svelte 5 Runes for better reactivity and performance
 * Persists to localStorage automatically
 */

import { browser } from '$app/environment';
import { DEFAULT_CONFIG } from '$lib/config/defaults';
import type { DateRange } from '$lib/utils/date-range';

const STORAGE_KEY = 'backtest-config';

class ConfigStore {
	#symbols = $state<string[]>([DEFAULT_CONFIG.strategy.defaultSymbol]);
	#dateRange = $state<DateRange>({
		start: DEFAULT_CONFIG.dateRange.startDate ? new Date(DEFAULT_CONFIG.dateRange.startDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
		end: DEFAULT_CONFIG.dateRange.endDate ? new Date(DEFAULT_CONFIG.dateRange.endDate) : new Date(),
	});
	#interval = $state<'1d' | '1wk' | '1mo'>(DEFAULT_CONFIG.data.interval);
	#gapFillStrategy = $state<'forward-fill' | 'backward-fill' | 'drop'>(DEFAULT_CONFIG.data.gapFillStrategy);
	#initialCapital = $state<number>(DEFAULT_CONFIG.backtest.initialCapital);

	constructor() {
		this.load();
	}

	// Getters
	get symbols() { return this.#symbols; }
	get dateRange() { return this.#dateRange; }
	get interval() { return this.#interval; }
	get gapFillStrategy() { return this.#gapFillStrategy; }
	get initialCapital() { return this.#initialCapital; }

	// Derived state
	get isSingleSymbol() { return this.#symbols.length === 1; }
	get isMultiSymbol() { return this.#symbols.length > 1; }
	get primarySymbol() { return this.#symbols[0] ?? null; }

	// Actions
	setSymbols(newSymbols: string[]) {
		this.#symbols = newSymbols;
		this.save();
	}

	addSymbol(symbol: string) {
		if (this.#symbols.includes(symbol)) return;
		this.#symbols = [...this.#symbols, symbol];
		this.save();
	}

	removeSymbol(symbol: string) {
		this.#symbols = this.#symbols.filter((s) => s !== symbol);
		this.save();
	}

	setDateRange(range: DateRange) {
		this.#dateRange = range;
		this.save();
	}

	setInterval(newInterval: '1d' | '1wk' | '1mo') {
		this.#interval = newInterval;
		this.save();
	}

	setGapFillStrategy(strategy: 'forward-fill' | 'backward-fill' | 'drop') {
		this.#gapFillStrategy = strategy;
		this.save();
	}

	setInitialCapital(capital: number) {
		this.#initialCapital = capital;
		this.save();
	}

	resetToDefaults() {
		this.#symbols = [DEFAULT_CONFIG.strategy.defaultSymbol];
		this.#dateRange = {
			start: DEFAULT_CONFIG.dateRange.startDate ? new Date(DEFAULT_CONFIG.dateRange.startDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
			end: DEFAULT_CONFIG.dateRange.endDate ? new Date(DEFAULT_CONFIG.dateRange.endDate) : new Date(),
		};
		this.#interval = DEFAULT_CONFIG.data.interval;
		this.#gapFillStrategy = DEFAULT_CONFIG.data.gapFillStrategy;
		this.#initialCapital = DEFAULT_CONFIG.backtest.initialCapital;
		this.save();
	}

	// Persistence
	private save(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				symbols: this.#symbols,
				dateRange: this.#dateRange,
				interval: this.#interval,
				gapFillStrategy: this.#gapFillStrategy,
				initialCapital: this.#initialCapital,
			}));
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

			if (Array.isArray(state.symbols) && state.symbols.length > 0) {
				this.#symbols = state.symbols;
			}
			if (state.dateRange?.start && state.dateRange?.end) {
				this.#dateRange = {
					start: new Date(state.dateRange.start),
					end: new Date(state.dateRange.end),
				};
			}
			if (state.interval) {
				this.#interval = state.interval;
			}
			if (state.gapFillStrategy) {
				this.#gapFillStrategy = state.gapFillStrategy;
			}
			if (typeof state.initialCapital === 'number') {
				this.#initialCapital = state.initialCapital;
			}
		} catch (error) {
			console.error('Failed to load config from localStorage:', error);
		}
	}
}

export const config = new ConfigStore();

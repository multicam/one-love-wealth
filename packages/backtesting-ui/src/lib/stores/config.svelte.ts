/**
 * Config Store
 * Manages backtest configuration (symbols, dates, intervals)
 * Uses traditional writable store pattern for reliable reactivity
 * Persists to localStorage automatically
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_CONFIG } from '$lib/config/defaults';
import type { DateRange } from '$lib/utils/date-range';

const STORAGE_KEY = 'backtest-config';

interface ConfigState {
	symbols: string[];
	dateRange: DateRange;
	interval: '1d' | '1wk' | '1mo';
	gapFillStrategy: 'forward-fill' | 'backward-fill' | 'drop';
	initialCapital: number;
}

// Initial state
const initialState: ConfigState = {
	symbols: [DEFAULT_CONFIG.defaultSymbol],
	dateRange: {
		start: DEFAULT_CONFIG.dateRange.start,
		end: DEFAULT_CONFIG.dateRange.end,
	},
	interval: DEFAULT_CONFIG.interval,
	gapFillStrategy: DEFAULT_CONFIG.gapFillStrategy,
	initialCapital: DEFAULT_CONFIG.initialCapital,
};

function createConfigStore() {
	const { subscribe, set, update } = writable<ConfigState>(initialState);

	// Helper function for persistence
	function save(state: ConfigState): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.error('Failed to save config to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Actions
		setSymbols: (newSymbols: string[]) => {
			update((state) => {
				const newState = { ...state, symbols: newSymbols };
				save(newState);
				return newState;
			});
		},

		addSymbol: (symbol: string) => {
			update((state) => {
				if (state.symbols.includes(symbol)) return state;
				const newState = { ...state, symbols: [...state.symbols, symbol] };
				save(newState);
				return newState;
			});
		},

		removeSymbol: (symbol: string) => {
			update((state) => {
				const newState = {
					...state,
					symbols: state.symbols.filter((s) => s !== symbol),
				};
				save(newState);
				return newState;
			});
		},

		setDateRange: (range: DateRange) => {
			update((state) => {
				const newState = { ...state, dateRange: range };
				save(newState);
				return newState;
			});
		},

		setInterval: (newInterval: '1d' | '1wk' | '1mo') => {
			update((state) => {
				const newState = { ...state, interval: newInterval };
				save(newState);
				return newState;
			});
		},

		setGapFillStrategy: (strategy: 'forward-fill' | 'backward-fill' | 'drop') => {
			update((state) => {
				const newState = { ...state, gapFillStrategy: strategy };
				save(newState);
				return newState;
			});
		},

		setInitialCapital: (capital: number) => {
			update((state) => {
				const newState = { ...state, initialCapital: capital };
				save(newState);
				return newState;
			});
		},

		resetToDefaults: () => {
			const newState = {
				symbols: [DEFAULT_CONFIG.defaultSymbol],
				dateRange: {
					start: DEFAULT_CONFIG.dateRange.start,
					end: DEFAULT_CONFIG.dateRange.end,
				},
				interval: DEFAULT_CONFIG.interval,
				gapFillStrategy: DEFAULT_CONFIG.gapFillStrategy,
				initialCapital: DEFAULT_CONFIG.initialCapital,
			};
			save(newState);
			set(newState);
		},

		// Persistence
		load: () => {
			if (!browser) return;

			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (!stored) return;

				const state = JSON.parse(stored);

				update((current) => {
					const newState = { ...current };

					// Validate and restore state
					if (Array.isArray(state.symbols) && state.symbols.length > 0) {
						newState.symbols = state.symbols;
					}
					if (state.dateRange?.start && state.dateRange?.end) {
						newState.dateRange = {
							start: new Date(state.dateRange.start),
							end: new Date(state.dateRange.end),
						};
					}
					if (state.interval) {
						newState.interval = state.interval;
					}
					if (state.gapFillStrategy) {
						newState.gapFillStrategy = state.gapFillStrategy;
					}
					if (typeof state.initialCapital === 'number') {
						newState.initialCapital = state.initialCapital;
					}

					return newState;
				});
			} catch (error) {
				console.error('Failed to load config from localStorage:', error);
			}
		},
	};
}

// Export store instance
export const config = createConfigStore();

// Derived stores for convenient access
export const isSingleSymbol = derived(config, ($config) => $config.symbols.length === 1);
export const isMultiSymbol = derived(config, ($config) => $config.symbols.length > 1);
export const primarySymbol = derived(config, ($config) => $config.symbols[0] ?? null);

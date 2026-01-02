/**
 * Strategy Store
 * Manages selected strategy and its parameters
 * Uses traditional writable store pattern for reliable reactivity
 * Persists to localStorage automatically
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { StrategyDefinition } from '$lib/strategies/types';
import { getStrategy } from '$lib/strategies';

const STORAGE_KEY = 'backtest-strategy';

interface StrategyState {
	selectedStrategyId: string | null;
	params: Record<string, any>;
}

// Initial state
const initialState: StrategyState = {
	selectedStrategyId: null,
	params: {},
};

function createStrategyStore() {
	const { subscribe, set, update } = writable<StrategyState>(initialState);

	// Helper function for persistence
	function save(state: StrategyState): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.error('Failed to save strategy to localStorage:', error);
		}
	}

	return {
		subscribe,

		// Actions
		selectStrategy: (strategyId: string) => {
			update((state) => {
				const strategy = getStrategy(strategyId);
				const newState = {
					selectedStrategyId: strategyId,
					params: strategy ? { ...strategy.defaults } : {},
				};
				save(newState);
				return newState;
			});
		},

		updateParam: (key: string, value: any) => {
			update((state) => {
				const newState = {
					...state,
					params: { ...state.params, [key]: value },
				};
				save(newState);
				return newState;
			});
		},

		updateParams: (newParams: Record<string, any>) => {
			update((state) => {
				const newState = {
					...state,
					params: { ...state.params, ...newParams },
				};
				save(newState);
				return newState;
			});
		},

		resetParams: () => {
			update((state) => {
				const strategy = state.selectedStrategyId ? getStrategy(state.selectedStrategyId) : null;
				const newState = {
					...state,
					params: strategy ? { ...strategy.defaults } : {},
				};
				save(newState);
				return newState;
			});
		},

		clearStrategy: () => {
			const newState = {
				selectedStrategyId: null,
				params: {},
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

				// Validate and restore state
				if (state.selectedStrategyId) {
					// Verify strategy still exists
					const strategy = getStrategy(state.selectedStrategyId);
					if (strategy) {
						const newState = {
							selectedStrategyId: state.selectedStrategyId,
							params:
								state.params && Object.keys(state.params).length > 0
									? state.params
									: { ...strategy.defaults },
						};
						set(newState);
					}
				}
			} catch (error) {
				console.error('Failed to load strategy from localStorage:', error);
			}
		},
	};
}

// Export store instance
export const strategy = createStrategyStore();

// Derived stores for convenient access
export const selectedStrategy = derived(strategy, ($strategy) =>
	$strategy.selectedStrategyId ? getStrategy($strategy.selectedStrategyId) : null
);
export const hasStrategy = derived(strategy, ($strategy) => $strategy.selectedStrategyId !== null);
export const isReady = derived(
	strategy,
	($strategy) => $strategy.selectedStrategyId !== null && Object.keys($strategy.params).length > 0
);

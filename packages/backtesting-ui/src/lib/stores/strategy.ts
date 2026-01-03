/**
 * Strategy Store
 * Manages selected strategy and its parameters
 * Migrated to Svelte 5 Runes for better reactivity and performance
 */

import { browser } from '$app/environment';
import type { StrategyDefinition } from '$lib/strategies/types';
import { getStrategy } from '$lib/strategies';

const STORAGE_KEY = 'backtest-strategy';

// Initial state
const initialSelectedId = null;
const initialParams = {};

class StrategyStore {
	#selectedStrategyId = $state<string | null>(initialSelectedId);
	#params = $state<Record<string, any>>(initialParams);

	constructor() {
		this.load();
	}

	// Getters
	get selectedStrategyId() {
		return this.#selectedStrategyId;
	}

	get params() {
		return this.#params;
	}

	// Derived state
	get selectedStrategy() {
		return this.#selectedStrategyId ? getStrategy(this.#selectedStrategyId) : null;
	}

	get hasStrategy() {
		return this.#selectedStrategyId !== null;
	}

	get isReady() {
		return this.#selectedStrategyId !== null && Object.keys(this.#params).length > 0;
	}

	// Actions
	selectStrategy(strategyId: string) {
		const strategyDef = getStrategy(strategyId);
		this.#selectedStrategyId = strategyId;
		this.#params = strategyDef ? { ...strategyDef.defaults } : {};
		this.save();
	}

	updateParam(key: string, value: any) {
		this.#params[key] = value;
		this.save();
	}

	updateParams(newParams: Record<string, any>) {
		this.#params = { ...this.#params, ...newParams };
		this.save();
	}

	resetParams() {
		const strategyDef = this.#selectedStrategyId ? getStrategy(this.#selectedStrategyId) : null;
		this.#params = strategyDef ? { ...strategyDef.defaults } : {};
		this.save();
	}

	clearStrategy() {
		this.#selectedStrategyId = null;
		this.#params = {};
		this.save();
	}

	// Persistence
	private save(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				selectedStrategyId: this.#selectedStrategyId,
				params: this.#params
			}));
		} catch (error) {
			console.error('Failed to save strategy to localStorage:', error);
		}
	}

	public load(): void {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return;

			const state = JSON.parse(stored);
			if (state.selectedStrategyId) {
				const strategyDef = getStrategy(state.selectedStrategyId);
				if (strategyDef) {
					this.#selectedStrategyId = state.selectedStrategyId;
					this.#params = (state.params && Object.keys(state.params).length > 0)
						? state.params
						: { ...strategyDef.defaults };
				}
			}
		} catch (error) {
			console.error('Failed to load strategy from localStorage:', error);
		}
	}
}

// Export a single instance of the store
export const strategy = new StrategyStore();

// Compatibility exports
export const selectedStrategyId = { get value() { return strategy.selectedStrategyId; } };
export const params = { get value() { return strategy.params; } };
export const selectedStrategy = { get value() { return strategy.selectedStrategy; } };

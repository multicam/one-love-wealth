/**
 * Strategy Store
 * Manages selected strategy and its parameters
 * Uses Svelte 5 runes with proper module state pattern
 * Persists to localStorage automatically
 */

import { browser } from '$app/environment';
import type { StrategyDefinition } from '$lib/strategies/types';
import { getStrategy } from '$lib/strategies';

const STORAGE_KEY = 'backtest-strategy';

class StrategyState {
	selectedStrategyId = $state<string | null>(null);
	params = $state<Record<string, any>>({});

	// Derived properties
	get selectedStrategy(): StrategyDefinition | null {
		if (!this.selectedStrategyId) return null;
		return getStrategy(this.selectedStrategyId);
	}

	get hasStrategy() {
		return this.selectedStrategyId !== null;
	}

	get isReady() {
		return this.hasStrategy && Object.keys(this.params).length > 0;
	}

	// Actions
	selectStrategy(strategyId: string): void {
		this.selectedStrategyId = strategyId;
		const strategy = getStrategy(strategyId);
		if (strategy) {
			this.params = { ...strategy.defaults };
		}
		this.save();
	}

	updateParam(key: string, value: any): void {
		this.params = { ...this.params, [key]: value };
		this.save();
	}

	updateParams(newParams: Record<string, any>): void {
		this.params = { ...this.params, ...newParams };
		this.save();
	}

	resetParams(): void {
		if (this.selectedStrategy) {
			this.params = { ...this.selectedStrategy.defaults };
		}
		this.save();
	}

	clearStrategy(): void {
		this.selectedStrategyId = null;
		this.params = {};
		this.save();
	}

	// Persistence
	save(): void {
		if (!browser) return;

		try {
			const state = {
				selectedStrategyId: this.selectedStrategyId,
				params: this.params,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.error('Failed to save strategy to localStorage:', error);
		}
	}

	load(): void {
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
					this.selectedStrategyId = state.selectedStrategyId;
					// Restore params if they exist, otherwise use defaults
					this.params = state.params && Object.keys(state.params).length > 0
						? state.params
						: { ...strategy.defaults };
				}
			}
		} catch (error) {
			console.error('Failed to load strategy from localStorage:', error);
		}
	}
}

// Export a single instance
export const strategy = new StrategyState();

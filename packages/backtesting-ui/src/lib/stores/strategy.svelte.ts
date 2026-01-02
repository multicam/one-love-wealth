/**
 * Strategy Store
 * Manages selected strategy and its parameters
 * Uses Svelte 5 runes with proper module state pattern
 */

import type { StrategyDefinition } from '$lib/strategies/types';
import { getStrategy } from '$lib/strategies';

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
	}

	updateParam(key: string, value: any): void {
		this.params = { ...this.params, [key]: value };
	}

	updateParams(newParams: Record<string, any>): void {
		this.params = { ...this.params, ...newParams };
	}

	resetParams(): void {
		if (this.selectedStrategy) {
			this.params = { ...this.selectedStrategy.defaults };
		}
	}

	clearStrategy(): void {
		this.selectedStrategyId = null;
		this.params = {};
	}
}

// Export a single instance
export const strategy = new StrategyState();

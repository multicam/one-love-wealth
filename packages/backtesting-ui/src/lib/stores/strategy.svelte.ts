/**
 * Strategy Store
 * Manages selected strategy and its parameters
 */

import type { StrategyDefinition } from '$lib/strategies/types';
import { getStrategy } from '$lib/strategies';

// State
export let selectedStrategyId = $state<string | null>(null);
export let params = $state<Record<string, any>>({});

// Derived
export const selectedStrategy = $derived.by((): StrategyDefinition | null => {
	if (!selectedStrategyId) return null;
	return getStrategy(selectedStrategyId);
});

export const hasStrategy = $derived(selectedStrategyId !== null);
export const isReady = $derived(hasStrategy && Object.keys(params).length > 0);

// Actions
export function selectStrategy(strategyId: string): void {
	selectedStrategyId = strategyId;
	const strategy = getStrategy(strategyId);
	if (strategy) {
		params = { ...strategy.defaults };
	}
}

export function updateParam(key: string, value: any): void {
	params = { ...params, [key]: value };
}

export function updateParams(newParams: Record<string, any>): void {
	params = { ...params, ...newParams };
}

export function resetParams(): void {
	if (selectedStrategy) {
		params = { ...selectedStrategy.defaults };
	}
}

export function clearStrategy(): void {
	selectedStrategyId = null;
	params = {};
}

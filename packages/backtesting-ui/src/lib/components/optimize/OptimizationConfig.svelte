<script lang="ts">
	import { Settings, Play, X } from 'lucide-svelte';
	import { toastStore } from '@one-love-wealth/shared-ui';
	import { strategy } from '$lib/stores/strategy';
	import { selectedStrategy } from '$lib/stores/strategy';
	import { config } from '$lib/stores/config';
	import { optimization } from '$lib/stores/optimization';
	import ParameterRanges from './ParameterRanges.svelte';
	import { executeOptimization, cancelOptimization } from '$lib/services/optimization.service';
	import type { OptimizationMethod, OptimizationObjective } from '@one-love-wealth/backtesting';
	import type { StrategyDefinition } from '$lib/strategies/types';

	// Optimization configuration
	let method = $state<OptimizationMethod>('grid');
	let objective = $state<OptimizationObjective>('sharpe');
	let iterations = $state(100); // For random/genetic

	// ETA calculation
	let startTime = $state<number>(0);

	// Local state synced from stores
	let currentStrategy = $state<StrategyDefinition | null>(null);
	let strategyState = $state<{ selectedStrategyId: string | null; params: Record<string, any> }>({ selectedStrategyId: null, params: {} });
	let configState = $state<any>(null);
	let optimizationState = $state<any>(null);

	$effect(() => {
		const unsub1 = selectedStrategy.subscribe(value => { currentStrategy = value; });
		const unsub2 = strategy.subscribe(value => { strategyState = value; });
		const unsub3 = config.subscribe(value => { configState = value; });
		const unsub4 = optimization.subscribe(value => { optimizationState = value; });
		return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
	});

	const estimatedTimeRemaining = $derived.by(() => {
		if (!optimizationState?.isRunning || optimizationState?.currentIteration === 0) return null;

		const elapsed = Date.now() - startTime;
		const avgTimePerIteration = elapsed / optimizationState.currentIteration;
		const remaining = optimizationState.totalIterations - optimizationState.currentIteration;
		const eta = avgTimePerIteration * remaining;

		return eta;
	});

	// Format ETA
	function formatETA(ms: number | null): string {
		if (ms === null) return '';
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}

	// Method options
	const methodOptions: { value: OptimizationMethod; label: string; description: string }[] = [
		{
			value: 'grid',
			label: 'Grid Search',
			description: 'Tests all parameter combinations systematically'
		},
		{
			value: 'random',
			label: 'Random Search',
			description: 'Tests random parameter combinations'
		},
		{
			value: 'genetic',
			label: 'Genetic Algorithm',
			description: 'Evolves optimal parameters over generations'
		}
	];

	// Objective options
	const objectiveOptions: { value: OptimizationObjective; label: string }[] = [
		{ value: 'sharpe', label: 'Sharpe Ratio' },
		{ value: 'sortino', label: 'Sortino Ratio' },
		{ value: 'return', label: 'Total Return' }
	];

	// Calculate total combinations for grid search
	const totalCombinations = $derived.by(() => {
		if (method !== 'grid') return null;

		let total = 1;
		const ranges = optimizationState?.paramRanges ?? {};
		for (const key in ranges) {
			const range = ranges[key];
			if (range && range.min !== undefined && range.max !== undefined && range.step) {
				const steps = Math.floor((range.max - range.min) / range.step) + 1;
				total *= steps;
			}
		}
		return total;
	});

	// Validation
	const isValid = $derived.by(() => {
		if (!currentStrategy) return false;
		if (method === 'random' || method === 'genetic') {
			if (iterations < 10 || iterations > 10000) return false;
		}
		return true;
	});

	// Handle run optimization
	async function handleRunOptimization() {
		if (!isValid || !currentStrategy) return;

		try {
			// Calculate total iterations
			let totalIterations: number;
			if (method === 'grid') {
				totalIterations = totalCombinations ?? 0;
			} else {
				totalIterations = iterations;
			}

			// Start optimization and track start time
			startTime = Date.now();
			optimization.startOptimization(optimizationState?.paramRanges ?? {}, totalIterations);

			// Execute optimization with progress callback
			const result = await executeOptimization(
				{
					method,
					objective,
					paramRanges: optimizationState?.paramRanges ?? {},
					iterations: method !== 'grid' ? iterations : undefined,
					strategy: currentStrategy!,
					strategyParams: strategyState.params,
					dateRange: configState?.dateRange,
					interval: configState?.interval,
					initialCapital: configState?.initialCapital,
					gapFillStrategy: configState?.gapFillStrategy,
					symbols: configState?.symbols
				},
				(iteration, total) => {
					optimization.updateProgress(iteration);
				}
			);

			// Set result with strategy info for history
			optimization.setResult(
				result,
				strategyState.selectedStrategyId!,
				currentStrategy!.name
			);

			// Show success toast
			toastStore.success(
				`Optimization complete! Best ${objective}: ${result.bestObjectiveValue.toFixed(2)}`
			);
		} catch (error) {
			// Handle error
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			optimization.setError(errorMessage);

			// Show error toast
			toastStore.error(`Optimization failed: ${errorMessage}`);
		}
	}

	// Handle cancel
	function handleCancel() {
		cancelOptimization();
		optimization.cancelOptimization();
		toastStore.info('Optimization cancelled');
	}
</script>

<div class="h-full flex flex-col overflow-hidden">
	<!-- Header -->
	<div class="p-4 border-b border-border">
		<div class="flex items-center gap-2 mb-2">
			<Settings size={20} class="text-primary" />
			<h2 class="text-lg font-semibold text-text-primary">Optimization</h2>
		</div>
		<p class="text-sm text-text-secondary">
			Find optimal parameters for {currentStrategy?.name || 'selected strategy'}
		</p>
	</div>

	<!-- Configuration -->
	<div class="flex-1 overflow-y-auto p-4 space-y-6">
		<!-- Method Selector -->
		<div class="space-y-2">
			<label class="text-sm font-medium text-text-primary">Optimization Method</label>
			<div class="space-y-2">
				{#each methodOptions as option}
					<button
						type="button"
						onclick={() => (method = option.value)}
						class="w-full text-left p-3 rounded-lg border transition-all {method === option.value
							? 'bg-primary/10 border-primary'
							: 'bg-surface border-border hover:border-primary/50'}"
					>
						<div class="font-medium text-text-primary">{option.label}</div>
						<div class="text-xs text-text-secondary mt-1">{option.description}</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Iterations (for Random/Genetic) -->
		{#if method === 'random' || method === 'genetic'}
			<div class="space-y-2">
				<label for="iterations" class="text-sm font-medium text-text-primary">
					Number of Iterations
				</label>
				<input
					id="iterations"
					type="number"
					min="10"
					max="10000"
					bind:value={iterations}
					class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
				<p class="text-xs text-text-secondary">
					Recommended: 100-500 for random, 50-200 for genetic
				</p>
			</div>
		{/if}

		<!-- Objective Selector -->
		<div class="space-y-2">
			<label class="text-sm font-medium text-text-primary">Optimization Objective</label>
			<div class="grid grid-cols-3 gap-2">
				{#each objectiveOptions as option}
					<button
						type="button"
						onclick={() => (objective = option.value)}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-all {objective === option.value
							? 'bg-primary text-white'
							: 'bg-surface text-text-secondary hover:bg-primary/10'}"
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Parameter Ranges -->
		{#if $selectedStrategy}
			<ParameterRanges />
		{/if}

		<!-- Total Combinations (Grid only) -->
		{#if method === 'grid' && totalCombinations}
			<div class="bg-primary/5 border border-primary/20 rounded-lg p-3">
				<div class="text-sm font-medium text-primary mb-1">
					Testing {totalCombinations?.toLocaleString()} combinations
				</div>
				<div class="text-xs text-text-secondary">
					This may take several minutes depending on date range and complexity
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer: Run Button -->
	<div class="border-t border-border p-4 bg-surface/50 space-y-3">
		<!-- Run Button -->
		{#if !$optimization.isRunning}
			<button
				type="button"
				onclick={handleRunOptimization}
				disabled={!isValid}
				class="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 {isValid
					? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
					: 'bg-surface text-text-secondary cursor-not-allowed'}"
			>
				<Play size={18} fill="currentColor" />
				<span>Run Optimization</span>
			</button>
		{:else}
			<!-- Cancel Button -->
			<button
				type="button"
				onclick={handleCancel}
				class="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600"
			>
				<X size={18} />
				<span>Cancel Optimization</span>
			</button>
		{/if}

		<!-- Progress Bar -->
		{#if $optimization.isRunning}
			<div class="space-y-2">
				<div class="flex justify-between text-xs text-text-secondary">
					<span>Progress</span>
					<span>{$optimization.currentIteration} / {$optimization.totalIterations}</span>
				</div>
				<div class="h-2 bg-background rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all duration-300"
						style="width: {$optimization.progress}%"
					></div>
				</div>
				{#if estimatedTimeRemaining}
					<div class="text-xs text-text-secondary text-center">
						Estimated time remaining: {formatETA(estimatedTimeRemaining)}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import { Settings, Play, X } from "lucide-svelte";
	import { toastStore } from "@one-love-wealth/shared-ui";
	import { strategy } from "$lib/stores/strategy.svelte";
	import { config } from "$lib/stores/config.svelte";
	import { optimization } from "$lib/stores/optimization.svelte";
	import ParameterRanges from "./ParameterRanges.svelte";
	import OptimizationProgress from "./OptimizationProgress.svelte";
	import {
		executeOptimization,
		cancelOptimization,
	} from "$lib/services/optimization.service";
	import type {
		OptimizationMethod,
		OptimizationObjective,
	} from "@one-love-wealth/backtesting";

	// Optimization configuration
	let method = $state<OptimizationMethod>("grid");
	let objective = $state<OptimizationObjective>("sharpeRatio");
	let iterations = $state(100); // For random/genetic

	// Method options
	const methodOptions: {
		value: OptimizationMethod;
		label: string;
		description: string;
	}[] = [
		{
			value: "grid",
			label: "Grid Search",
			description: "Tests all parameter combinations systematically",
		},
		{
			value: "random",
			label: "Random Search",
			description: "Tests random parameter combinations",
		},
		{
			value: "genetic",
			label: "Genetic Algorithm",
			description: "Evolves optimal parameters over generations",
		},
	];

	// Objective options
	const objectiveOptions: { value: OptimizationObjective; label: string }[] =
		[
			{ value: "sharpeRatio", label: "Sharpe Ratio" },
			{ value: "sortinoRatio", label: "Sortino Ratio" },
			{ value: "totalReturn", label: "Total Return" },
		];

	// Calculate total combinations for grid search
	const totalCombinations = $derived.by(() => {
		if (method !== "grid") return null;

		let total = 1;
		const ranges = optimization.paramRanges;
		for (const key in ranges) {
			const range = ranges[key];
			if (
				range &&
				range.min !== undefined &&
				range.max !== undefined &&
				range.step
			) {
				const steps =
					Math.floor((range.max - range.min) / range.step) + 1;
				total *= steps;
			}
		}
		return total;
	});

	// Validation
	const isValid = $derived.by(() => {
		if (!strategy.selectedStrategy) return false;
		if (method === "random" || method === "genetic") {
			if (iterations < 10 || iterations > 10000) return false;
		}
		return true;
	});

	// Handle run optimization
	async function handleRunOptimization() {
		const currentStrategy = strategy.selectedStrategy;
		if (!isValid || !currentStrategy) return;

		try {
			// Calculate total iterations
			let totalIterations: number;
			if (method === "grid") {
				totalIterations = totalCombinations ?? 0;
			} else {
				totalIterations = iterations;
			}

			// Start optimization with method and objective info
			optimization.startOptimization(
				optimization.paramRanges,
				totalIterations,
				method,
				objective
			);

			// Set phase to optimizing once data is loaded
			optimization.setPhase('optimizing', 'Running optimization...');

			// Execute optimization with progress callback
			const result = await executeOptimization(
				{
					method,
					objective,
					paramRanges: optimization.paramRanges,
					iterations: method !== "grid" ? iterations : undefined,
					strategyId: strategy.selectedStrategyId!,
					strategyParams: strategy.params,
					dateRange: config.dateRange,
					interval: config.interval,
					initialCapital: config.initialCapital,
					gapFillStrategy: config.gapFillStrategy as any,
					symbols: config.symbols,
				},
				(iteration, total, currentBest) => {
					optimization.updateProgress(iteration, currentBest);
				},
			);

			// Set result with strategy info for history
			optimization.setResult(
				result,
				strategy.selectedStrategyId!,
				currentStrategy.name,
			);

			// Show success toast
			toastStore.success(
				`Optimization complete! Best ${objective}: ${result.bestResult.objectiveValue.toFixed(2)}`,
			);
		} catch (error) {
			// Handle error
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred";
			optimization.setError(errorMessage);

			// Show error toast
			toastStore.error(`Optimization failed: ${errorMessage}`);
		}
	}

	// Handle cancel
	function handleCancel() {
		cancelOptimization();
		optimization.cancelOptimization();
		toastStore.info("Optimization cancelled");
	}
</script>

<div class="h-full flex flex-col overflow-hidden">
	<!-- Header -->
	<div class="p-4 border-b border-border">
		<div class="flex items-center gap-2 mb-2">
			<Settings size={20} class="text-primary" />
			<h2 class="text-lg font-semibold text-text-primary">
				Optimization
			</h2>
		</div>
		<p class="text-sm text-text-secondary">
			Find optimal parameters for {strategy.selectedStrategy?.name ||
				"selected strategy"}
		</p>
	</div>

	<!-- Configuration -->
	<div class="flex-1 overflow-y-auto p-4 space-y-6">
		<!-- Method Selector -->
		<div class="space-y-2">
			<label for="method" class="text-sm font-medium text-text-primary"
				>Optimization Method</label
			>
			<div id="method" class="space-y-2">
				{#each methodOptions as option}
					<button
						type="button"
						onclick={() => (method = option.value)}
						class="w-full text-left p-3 rounded-lg border transition-all {method ===
						option.value
							? 'bg-primary/10 border-primary'
							: 'bg-surface border-border hover:border-primary/50'}"
					>
						<div class="font-medium text-text-primary">
							{option.label}
						</div>
						<div class="text-xs text-text-secondary mt-1">
							{option.description}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Iterations (for Random/Genetic) -->
		{#if method === "random" || method === "genetic"}
			<div class="space-y-2">
				<label
					for="iterations"
					class="text-sm font-medium text-text-primary"
				>
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
			<label for="objective" class="text-sm font-medium text-text-primary"
				>Optimization Objective</label
			>
			<div id="objective" class="grid grid-cols-3 gap-2">
				{#each objectiveOptions as option}
					<button
						type="button"
						onclick={() => (objective = option.value)}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-all {objective ===
						option.value
							? 'bg-primary text-white'
							: 'bg-surface text-text-secondary hover:bg-primary/10'}"
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Parameter Ranges -->
		{#if strategy.selectedStrategy}
			<ParameterRanges />
		{/if}

		<!-- Total Combinations (Grid only) -->
		{#if method === "grid" && totalCombinations}
			<div class="bg-primary/5 border border-primary/20 rounded-lg p-3">
				<div class="text-sm font-medium text-primary mb-1">
					Testing {totalCombinations?.toLocaleString()} combinations
				</div>
				<div class="text-xs text-text-secondary">
					This may take several minutes depending on date range and
					complexity
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer: Run Button -->
	<div class="border-t border-border p-4 bg-surface/50 space-y-3">
		<!-- Run Button -->
		{#if !optimization.isRunning}
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

		<!-- Comprehensive Progress Report -->
		<OptimizationProgress />
	</div>
</div>

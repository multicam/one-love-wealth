<script lang="ts">
	import { onMount } from "svelte";
	import { Play, AlertCircle } from "lucide-svelte";
	import { toastStore, Spinner } from "@one-love-wealth/shared-ui";
	import { strategy } from "$lib/stores/strategy";
	import { selectedStrategy } from "$lib/stores/strategy";
	import { config } from "$lib/stores/config";
	import { backtest, hasError } from "$lib/stores/backtest";
	import { validateStrategyParams } from "$lib/strategies/types";
	import { executeBacktest } from "$lib/services/backtest.service";
	import type { StrategyDefinition } from "$lib/strategies/types";

	// Local state synced from stores
	let currentStrategy = $state<StrategyDefinition | null>(null);
	let strategyState = $state<{
		selectedStrategyId: string | null;
		params: Record<string, any>;
	}>({ selectedStrategyId: null, params: {} });
	let configState = $state<any>(null);
	let backtestState = $state<any>(null);
	let hasErrorState = $state(false);

	$effect(() => {
		const unsub1 = selectedStrategy.subscribe((value) => {
			currentStrategy = value;
		});
		const unsub2 = strategy.subscribe((value) => {
			strategyState = value;
		});
		const unsub3 = config.subscribe((value) => {
			configState = value;
		});
		const unsub4 = backtest.subscribe((value) => {
			backtestState = value;
		});
		const unsub5 = hasError.subscribe((value) => {
			hasErrorState = value;
		});
		return () => {
			unsub1();
			unsub2();
			unsub3();
			unsub4();
			unsub5();
		};
	});

	// Listen for keyboard shortcut event
	onMount(() => {
		const handleRunEvent = () => {
			if (isValid && !backtestState?.isRunning) {
				handleRunBacktest();
			}
		};

		window.addEventListener("run-backtest", handleRunEvent);
		return () => window.removeEventListener("run-backtest", handleRunEvent);
	});

	// Validation state
	const validationErrors = $derived.by<string[]>(() => {
		const errors: string[] = [];

		// Check if strategy is selected
		if (!strategyState?.selectedStrategyId || !currentStrategy) {
			errors.push("Please select a strategy");
			return errors;
		}

		// Validate strategy parameters
		const paramValidation = validateStrategyParams(
			currentStrategy,
			strategyState.params,
		);
		if (!paramValidation.valid) {
			errors.push(...paramValidation.errors);
		}

		// Validate date range
		if (!configState?.dateRange?.start || !configState?.dateRange?.end) {
			errors.push("Date range is required");
		} else {
			const start = new Date(configState.dateRange.start);
			const end = new Date(configState.dateRange.end);
			if (start >= end) {
				errors.push("Start date must be before end date");
			}
			// Check if date range is at least 1 day
			const daysDiff =
				(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
			if (daysDiff < 1) {
				errors.push("Date range must be at least 1 day");
			}
		}

		// Validate initial capital
		if (!configState?.initialCapital || configState.initialCapital <= 0) {
			errors.push("Initial capital must be greater than 0");
		}

		return errors;
	});

	// Check if ready to run
	const isValid = $derived(validationErrors.length === 0);

	// Handle run backtest
	async function handleRunBacktest() {
		if (!isValid || !currentStrategy) return;

		try {
			// Start backtest with loading state
			backtest.startBacktest();

			// Execute backtest with progress tracking
			const result = await executeBacktest(
				{
					strategy: currentStrategy,
					strategyParams: strategyState.params,
					dateRange: configState?.dateRange,
					interval: configState?.interval,
					initialCapital: configState?.initialCapital,
					gapFillStrategy: configState?.gapFillStrategy,
				},
				(progress, message) => {
					backtest.setProgress(progress);
					// Could show message in UI if desired
				},
			);

			// Set result in store with strategy info for history
			backtest.setResult(
				result,
				strategyState.selectedStrategyId!,
				currentStrategy!.name,
			);

			// Show success toast
			toastStore.success("Backtest completed successfully!");
		} catch (error) {
			// Handle error
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred";
			backtest.setError(errorMessage);

			// Show error toast
			toastStore.error(`Backtest failed: ${errorMessage}`);
		}
	}
</script>

<div class="space-y-3">
	<!-- Run Button -->
	<button
		type="button"
		onclick={handleRunBacktest}
		disabled={!isValid || backtestState?.isRunning}
		class="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 {isValid &&
		!backtestState?.isRunning
			? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
			: 'bg-surface text-text-secondary cursor-not-allowed'}"
	>
		{#if backtestState?.isRunning}
			<Spinner size={20} color="white" />
			<span>Running Backtest...</span>
		{:else}
			<Play size={18} fill="currentColor" />
			<span>Run Backtest</span>
		{/if}
	</button>

	<!-- Validation Errors -->
	{#if validationErrors.length > 0}
		<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
			<div class="flex items-start gap-2">
				<AlertCircle
					size={16}
					class="text-red-500 flex-shrink-0 mt-0.5"
				/>
				<div class="flex-1">
					<div class="text-xs font-semibold text-red-500 mb-1">
						Cannot run backtest:
					</div>
					<ul class="text-xs text-red-500/80 space-y-1">
						{#each validationErrors as error}
							<li>• {error}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}

	<!-- Progress Indicator -->
	{#if backtestState?.isRunning && backtestState?.progress > 0}
		<div class="space-y-1">
			<div class="flex justify-between text-xs text-text-secondary">
				<span>Progress</span>
				<span>{backtestState.progress}%</span>
			</div>
			<div class="h-1 bg-background rounded-full overflow-hidden">
				<div
					class="h-full bg-primary transition-all duration-300"
					style="width: {backtestState.progress}%"
				></div>
			</div>
		</div>
	{/if}

	<!-- Error Display -->
	{#if hasErrorState}
		<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
			<div class="flex items-start gap-2">
				<AlertCircle
					size={16}
					class="text-red-500 flex-shrink-0 mt-0.5"
				/>
				<div class="flex-1">
					<div class="text-xs font-semibold text-red-500 mb-1">
						Backtest failed:
					</div>
					<div class="text-xs text-red-500/80">
						{backtestState?.error}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Keyboard Shortcut Hint -->
	{#if isValid && !backtestState?.isRunning}
		<div class="text-xs text-text-secondary text-center">
			Press <kbd
				class="px-1.5 py-0.5 bg-background border border-border rounded text-text-primary font-mono"
				>Enter</kbd
			> to run
		</div>
	{/if}
</div>

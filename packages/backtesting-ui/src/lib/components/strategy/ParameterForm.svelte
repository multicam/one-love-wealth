<script lang="ts">
	import { RotateCcw, ChevronDown, ChevronUp, Settings } from 'lucide-svelte';
	import { strategy } from '$lib/stores/strategy.svelte';
	import FieldRenderer from './FieldRenderer.svelte';
	import BacktestConfig from '$lib/components/config/BacktestConfig.svelte';
	import RunBacktestButton from '$lib/components/backtest/RunBacktestButton.svelte';
	import RecentResults from '$lib/components/results/RecentResults.svelte';
	import type { StrategyField } from '$lib/strategies/types';

	// Show/hide advanced parameters
	let showAdvanced = $state(false);
	// Show/hide backtest config
	let showConfig = $state(false);

	// Get visible fields (showByDefault !== false)
	const visibleFields = $derived<StrategyField[]>(() => {
		if (!$strategy.selectedStrategy) return [];
		return $strategy.selectedStrategy.fields.filter((f) => f.showByDefault !== false);
	});

	// Get advanced fields (showByDefault === false)
	const advancedFields = $derived<StrategyField[]>(() => {
		if (!$strategy.selectedStrategy) return [];
		return $strategy.selectedStrategy.fields.filter((f) => f.showByDefault === false);
	});

	// Check if current params match recommended preset
	const isUsingRecommended = $derived(() => {
		if (!$strategy.selectedStrategy) return false;
		const recommended = $strategy.selectedStrategy.defaults;
		for (const key in recommended) {
			if ($strategy.params[key] !== recommended[key]) {
				return false;
			}
		}
		return true;
	});

	// Reset to recommended preset
	function resetToRecommended() {
		if ($strategy.selectedStrategy) {
			strategy.updateParams({ ...$strategy.selectedStrategy.defaults });
		}
	}

	// Handle field update
	function handleFieldUpdate(key: string, value: any) {
		strategy.updateParam(key, value);
	}
</script>

{#if $strategy.selectedStrategy}
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="p-4 border-b border-border">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-lg font-semibold text-text-primary">Parameters</h2>

				<!-- Reset to Recommended Button -->
				{#if !isUsingRecommended()}
					<button
						type="button"
						onclick={resetToRecommended}
						class="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:text-primary/80 transition-colors"
						title="Reset to recommended preset"
					>
						<RotateCcw size={14} />
						<span>Reset</span>
					</button>
				{/if}
			</div>

			<!-- Preset Badge -->
			{#if $strategy.selectedStrategy.preset}
				<div class="flex items-center gap-2 text-xs text-text-secondary">
					<span class="w-2 h-2 rounded-full {isUsingRecommended() ? 'bg-green-500' : 'bg-orange-500'}"></span>
					<span>
						{isUsingRecommended() ? 'Using recommended preset' : 'Custom parameters'}
					</span>
				</div>
			{/if}
		</div>

		<!-- Fields -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4">
			<!-- Visible Fields -->
			{#each visibleFields() as field (field.key)}
				<FieldRenderer
					{field}
					value={$strategy.params[field.key]}
					onUpdate={(val) => handleFieldUpdate(field.key, val)}
				/>
			{/each}

			<!-- Advanced Fields Toggle -->
			{#if advancedFields().length > 0}
				<div class="pt-4 border-t border-border">
					<button
						type="button"
						onclick={() => (showAdvanced = !showAdvanced)}
						class="flex items-center justify-between w-full text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
					>
						<span>Advanced Settings</span>
						{#if showAdvanced}
							<ChevronUp size={16} />
						{:else}
							<ChevronDown size={16} />
						{/if}
					</button>

					<!-- Advanced Fields -->
					{#if showAdvanced}
						<div class="mt-4 space-y-4">
							{#each advancedFields() as field (field.key)}
								<FieldRenderer
									{field}
									value={$strategy.params[field.key]}
									onUpdate={(val) => handleFieldUpdate(field.key, val)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Preset Information -->
			{#if $strategy.selectedStrategy.preset}
				<div class="pt-4 mt-4 border-t border-border">
					<div class="bg-primary/5 rounded-lg p-3 border border-primary/20">
						<h3 class="text-xs font-semibold text-primary mb-2">
							💡 About These Defaults
						</h3>
						<p class="text-xs text-text-secondary">
							{$strategy.selectedStrategy.preset.rationale}
						</p>
					</div>
				</div>
			{/if}

			<!-- Backtest Configuration Toggle -->
			<div class="pt-4 mt-4 border-t border-border">
				<button
					type="button"
					onclick={() => (showConfig = !showConfig)}
					class="flex items-center justify-between w-full text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
				>
					<div class="flex items-center gap-2">
						<Settings size={16} />
						<span>Backtest Configuration</span>
					</div>
					{#if showConfig}
						<ChevronUp size={16} />
					{:else}
						<ChevronDown size={16} />
					{/if}
				</button>

				<!-- Backtest Config -->
				{#if showConfig}
					<div class="mt-4 -mx-4">
						<BacktestConfig />
					</div>
				{/if}
			</div>
		</div>

		<!-- Footer: Run Backtest Button -->
		<div class="border-t border-border p-4 bg-surface/50 space-y-4">
			<RunBacktestButton />

			<!-- Recent Results History -->
			<div class="pt-4 border-t border-border/50">
				<RecentResults />
			</div>
		</div>
	</div>
{:else}
	<!-- No Strategy Selected -->
	<div class="h-full flex items-center justify-center p-6">
		<p class="text-sm text-text-secondary text-center">
			Select a strategy to configure parameters
		</p>
	</div>
{/if}

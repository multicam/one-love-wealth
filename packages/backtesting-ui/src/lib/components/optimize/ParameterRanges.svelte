<script lang="ts">
	import { strategy, selectedStrategy } from '$lib/stores/strategy.svelte';
	import { optimization } from '$lib/stores/optimization.svelte';
	import type { StrategyField } from '$lib/strategies/types';

	// Get numeric parameters from selected strategy
	const numericFields = $derived(() => {
		if (!$selectedStrategy) return [];
		return $selectedStrategy.fields.filter(
			(f) =>
				f.type === 'number' ||
				f.type === 'slider' ||
				f.type === 'percent' ||
				f.type === 'integer'
		);
	});

	// Initialize ranges with defaults
	$effect(() => {
		const fields = numericFields();
		if (fields.length === 0) return;

		const ranges: Record<string, { min: number; max: number; step: number }> = {};

		for (const field of fields) {
			// Use existing range if available, otherwise create default
			const existing = $optimization.paramRanges[field.key];
			if (existing) {
				ranges[field.key] = existing;
			} else {
				// Create sensible defaults based on field type
				const currentValue = $strategy.params[field.key] ?? field.default ?? 0;
				let min: number, max: number, step: number;

				if (field.type === 'percent') {
					min = Math.max(0, currentValue - 0.2);
					max = Math.min(1, currentValue + 0.2);
					step = 0.05;
				} else if (field.type === 'integer' || (field.min !== undefined && field.max !== undefined)) {
					min = field.min ?? Math.max(1, Math.floor(currentValue * 0.5));
					max = field.max ?? Math.ceil(currentValue * 1.5);
					step = field.step ?? 1;
				} else {
					// Generic number
					min = Math.max(0, currentValue * 0.5);
					max = currentValue * 1.5;
					step = (max - min) / 10;
				}

				ranges[field.key] = { min, max, step };
			}
		}

		// Update store
		optimization.paramRanges = ranges;
	});

	// Handle range updates
	function updateRange(key: string, prop: 'min' | 'max' | 'step', value: number) {
		const current = $optimization.paramRanges[key];
		if (!current) return;

		optimization.paramRanges = {
			...$optimization.paramRanges,
			[key]: {
				...current,
				[prop]: value
			}
		};
	}

	// Validation
	function isRangeValid(range: { min: number; max: number; step: number }): boolean {
		return range.min < range.max && range.step > 0 && range.step <= range.max - range.min;
	}
</script>

{#if numericFields().length > 0}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<label class="text-sm font-medium text-text-primary">Parameter Ranges</label>
			<span class="text-xs text-text-secondary">
				{numericFields().length} parameter{numericFields().length !== 1 ? 's' : ''}
			</span>
		</div>

		<div class="space-y-4">
			{#each numericFields() as field}
				{@const range = $optimization.paramRanges[field.key]}
				{@const valid = range ? isRangeValid(range) : false}

				<div
					class="p-3 rounded-lg border {valid
						? 'border-border bg-surface'
						: 'border-red-500/50 bg-red-500/5'}"
				>
					<!-- Field Label -->
					<div class="mb-2">
						<div class="text-sm font-medium text-text-primary">{field.label}</div>
						{#if field.helperText}
							<div class="text-xs text-text-secondary mt-0.5">{field.helperText}</div>
						{/if}
					</div>

					<!-- Range Inputs -->
					{#if range}
						<div class="grid grid-cols-3 gap-2">
							<!-- Min -->
							<div>
								<label for="{field.key}-min" class="text-xs text-text-secondary mb-1 block">
									Min
								</label>
								<input
									id="{field.key}-min"
									type="number"
									value={range.min}
									step={field.type === 'percent' ? 0.01 : field.step ?? 1}
									oninput={(e) => updateRange(field.key, 'min', parseFloat(e.currentTarget.value))}
									class="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
								/>
							</div>

							<!-- Max -->
							<div>
								<label for="{field.key}-max" class="text-xs text-text-secondary mb-1 block">
									Max
								</label>
								<input
									id="{field.key}-max"
									type="number"
									value={range.max}
									step={field.type === 'percent' ? 0.01 : field.step ?? 1}
									oninput={(e) => updateRange(field.key, 'max', parseFloat(e.currentTarget.value))}
									class="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
								/>
							</div>

							<!-- Step -->
							<div>
								<label for="{field.key}-step" class="text-xs text-text-secondary mb-1 block">
									Step
								</label>
								<input
									id="{field.key}-step"
									type="number"
									value={range.step}
									step={field.type === 'percent' ? 0.01 : field.step ?? 1}
									min={field.type === 'percent' ? 0.01 : field.step ?? 1}
									oninput={(e) => updateRange(field.key, 'step', parseFloat(e.currentTarget.value))}
									class="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
								/>
							</div>
						</div>

						<!-- Validation Error -->
						{#if !valid}
							<div class="mt-2 text-xs text-red-500">
								Invalid range: min must be less than max, and step must be positive and smaller than
								range
							</div>
						{/if}

						<!-- Steps Count (Grid only) -->
						{#if valid}
							{@const steps = Math.floor((range.max - range.min) / range.step) + 1}
							<div class="mt-2 text-xs text-text-secondary">
								{steps} step{steps !== 1 ? 's' : ''}
								{#if field.type === 'percent'}
									({(range.min * 100).toFixed(1)}% to {(range.max * 100).toFixed(1)}%)
								{:else}
									({range.min.toFixed(2)} to {range.max.toFixed(2)})
								{/if}
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="p-4 rounded-lg bg-surface/50 border border-border text-center">
		<p class="text-sm text-text-secondary">
			No numeric parameters to optimize. Selected strategy only has fixed parameters.
		</p>
	</div>
{/if}

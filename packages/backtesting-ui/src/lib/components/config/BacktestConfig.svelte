<script lang="ts">
	import { Calendar, TrendingUp, DollarSign } from 'lucide-svelte';
	import { config } from '$lib/stores/config';

	// Format date for input (YYYY-MM-DD)
	function formatDateForInput(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toISOString().split('T')[0];
	}

	// Handle date change
	function handleStartDateChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		config.setDateRange({ start: target.value, end: config.dateRange.end });
	}

	function handleEndDateChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		config.setDateRange({ start: config.dateRange.start, end: target.value });
	}

	// Format currency
	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}

	// Interval options
	const intervalOptions = [
		{ value: '1d' as const, label: 'Daily' },
		{ value: '1wk' as const, label: 'Weekly' },
		{ value: '1mo' as const, label: 'Monthly' },
	];

	// Gap fill strategy options
	const gapFillOptions = [
		{ value: 'forward-fill' as const, label: 'Forward Fill', description: 'Use last known value' },
		{
			value: 'backward-fill' as const,
			label: 'Backward Fill',
			description: 'Use next known value',
		},
		{ value: 'drop' as const, label: 'Drop', description: 'Remove rows with gaps' },
	];
</script>

<div class="p-4 space-y-6">
	<!-- Header -->
	<div>
		<h3 class="text-sm font-semibold text-text-primary mb-1">Backtest Configuration</h3>
		<p class="text-xs text-text-secondary">
			Global settings for all backtests
		</p>
	</div>

	<!-- Date Range -->
	<div class="space-y-3">
		<div class="flex items-center gap-2 text-sm font-medium text-text-primary">
			<Calendar size={16} class="text-primary" />
			<span>Date Range</span>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<!-- Start Date -->
			<div>
				<label for="start-date" class="text-xs text-text-secondary mb-1 block">
					Start Date
				</label>
				<input
					id="start-date"
					type="date"
					value={formatDateForInput(config.dateRange.start)}
					onchange={handleStartDateChange}
					class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
			</div>

			<!-- End Date -->
			<div>
				<label for="end-date" class="text-xs text-text-secondary mb-1 block">
					End Date
				</label>
				<input
					id="end-date"
					type="date"
					value={formatDateForInput(config.dateRange.end)}
					onchange={handleEndDateChange}
					class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
			</div>
		</div>

		<!-- Date Range Summary -->
		<div class="text-xs text-text-secondary">
			{#if config.dateRange.start && config.dateRange.end}
				{@const start = new Date(config.dateRange.start)}
				{@const end = new Date(config.dateRange.end)}
				{@const years = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)}
				<span>Duration: {years} years</span>
			{/if}
		</div>
	</div>

	<!-- Interval -->
	<div class="space-y-3">
		<div class="flex items-center gap-2 text-sm font-medium text-text-primary">
			<TrendingUp size={16} class="text-primary" />
			<span>Data Interval</span>
		</div>

		<div class="flex gap-2">
			{#each intervalOptions as option}
				<button
					type="button"
					onclick={() => config.setInterval(option.value)}
					class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors {config.interval ===
					option.value
						? 'bg-primary text-white'
						: 'bg-background text-text-secondary hover:text-text-primary hover:bg-surface'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Initial Capital -->
	<div class="space-y-3">
		<div class="flex items-center gap-2 text-sm font-medium text-text-primary">
			<DollarSign size={16} class="text-primary" />
			<span>Initial Capital</span>
		</div>

		<div>
			<input
				id="initial-capital"
				type="number"
				min="1000"
				max="10000000"
				step="1000"
				value={config.initialCapital}
				oninput={(e) => config.setInitialCapital(parseFloat(e.currentTarget.value))}
				class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
			/>
			<div class="text-xs text-text-secondary mt-1">
				{formatCurrency(config.initialCapital)}
			</div>
		</div>
	</div>

	<!-- Gap Fill Strategy -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<label for="gap-fill" class="text-sm font-medium text-text-primary">
				Gap Fill Strategy
			</label>
		</div>

		<select
			id="gap-fill"
			value={config.gapFillStrategy}
			onchange={(e) => config.setGapFillStrategy(e.currentTarget.value as any)}
			class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
		>
			{#each gapFillOptions as option}
				<option value={option.value}>
					{option.label} - {option.description}
				</option>
			{/each}
		</select>

		<p class="text-xs text-text-secondary">
			How to handle missing data points in the time series
		</p>
	</div>

	<!-- Reset Button -->
	<div class="pt-4 border-t border-border">
		<button
			type="button"
			onclick={() => config.resetToDefaults()}
			class="w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
		>
			Reset to Defaults
		</button>
	</div>
</div>

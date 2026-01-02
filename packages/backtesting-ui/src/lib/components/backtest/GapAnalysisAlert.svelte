<script lang="ts">
	import { AlertTriangle, Info, X } from 'lucide-svelte';

	interface DataGap {
		symbol: string;
		startDate: Date;
		endDate: Date;
		missingDays: number;
	}

	interface Props {
		gaps?: DataGap[];
		totalExpectedDays?: number;
		actualDays?: number;
	}

	let { gaps = [], totalExpectedDays = 0, actualDays = 0 }: Props = $props();

	let isDismissed = $state(false);

	const hasGaps = $derived(() => gaps.length > 0);
	const coveragePercent = $derived(() => {
		if (totalExpectedDays === 0) return 100;
		return (actualDays / totalExpectedDays) * 100;
	});

	const severity = $derived(() => {
		const coverage = coveragePercent();
		if (coverage >= 95) return 'info';
		if (coverage >= 85) return 'warning';
		return 'error';
	});

	function dismiss() {
		isDismissed = true;
	}
</script>

{#if hasGaps() && !isDismissed}
	<div
		class="rounded-lg border p-4 {severity() === 'error'
			? 'bg-red-500/10 border-red-500/50'
			: severity() === 'warning'
				? 'bg-orange-500/10 border-orange-500/50'
				: 'bg-blue-500/10 border-blue-500/50'}"
	>
		<div class="flex items-start gap-3">
			<!-- Icon -->
			<div
				class="{severity() === 'error'
					? 'text-red-500'
					: severity() === 'warning'
						? 'text-orange-500'
						: 'text-blue-500'}"
			>
				{#if severity() === 'error' || severity() === 'warning'}
					<AlertTriangle size={20} />
				{:else}
					<Info size={20} />
				{/if}
			</div>

			<!-- Content -->
			<div class="flex-1 space-y-2">
				<div class="flex items-start justify-between gap-2">
					<h4 class="font-semibold text-text-primary">
						{#if severity() === 'error'}
							Significant Data Gaps Detected
						{:else if severity() === 'warning'}
							Data Gaps Detected
						{:else}
							Minor Data Gaps
						{/if}
					</h4>
					<button
						type="button"
						onclick={dismiss}
						class="text-text-secondary hover:text-text-primary transition-colors"
						aria-label="Dismiss"
					>
						<X size={16} />
					</button>
				</div>

				<p class="text-sm text-text-secondary">
					Data coverage: <strong class="text-text-primary">{coveragePercent().toFixed(1)}%</strong>
					({actualDays} of {totalExpectedDays} expected days)
				</p>

				<!-- Gap Details -->
				{#if gaps.length > 0}
					<div class="space-y-1 mt-3">
						<div class="text-xs font-medium text-text-secondary uppercase tracking-wide">
							Detected Gaps:
						</div>
						<div class="space-y-1.5 max-h-32 overflow-y-auto">
							{#each gaps.slice(0, 5) as gap}
								<div class="text-xs bg-surface/50 rounded p-2 border border-border/50">
									<div class="flex items-center justify-between">
										<span class="font-medium text-text-primary">{gap.symbol}</span>
										<span class="text-text-secondary">{gap.missingDays} days missing</span>
									</div>
									<div class="text-text-secondary mt-1">
										{gap.startDate.toLocaleDateString()} - {gap.endDate.toLocaleDateString()}
									</div>
								</div>
							{/each}
							{#if gaps.length > 5}
								<div class="text-xs text-text-secondary text-center py-1">
									... and {gaps.length - 5} more gaps
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Recommendation -->
				<div class="text-xs text-text-secondary bg-surface/30 rounded p-2 border border-border/50 mt-3">
					<strong class="text-text-primary">Recommendation:</strong>
					{#if severity() === 'error'}
						Consider using a different date range or gap-fill strategy. Large gaps may significantly
						impact backtest accuracy.
					{:else if severity() === 'warning'}
						Results may be affected by data gaps. Consider adjusting the gap-fill strategy or date
						range.
					{:else}
						Minor gaps detected. The selected gap-fill strategy should handle these adequately.
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

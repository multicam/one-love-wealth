<script lang="ts">
	import { History, TrendingUp, TrendingDown, Trash2 } from 'lucide-svelte';
	import { backtest } from '$lib/stores/backtest';

	function formatPercent(value: number): string {
		return `${(value * 100).toFixed(2)}%`;
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	function handleRemove(id: string, event: Event) {
		event.stopPropagation();
		backtest.removeFromHistory(id);
	}
</script>

{#if backtest.history.length > 0}
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-text-primary flex items-center gap-2">
				<History size={16} />
				Recent Backtests
			</h3>
			{#if backtest.history.length > 0}
				<button
					type="button"
					onclick={() => backtest.clearHistory()}
					class="text-xs text-text-secondary hover:text-red-500 transition-colors"
				>
					Clear All
				</button>
			{/if}
		</div>

		<div class="space-y-2 max-h-96 overflow-y-auto">
			{#each backtest.history as result (result.id)}
				<div
					class="bg-surface rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
				>
					<div class="flex items-start justify-between gap-2 mb-2">
						<div class="flex-1 min-w-0">
							<div class="font-medium text-text-primary text-sm truncate">
								{result.strategyName}
							</div>
							<div class="text-xs text-text-secondary">
								{result.symbols.join(', ')} • {formatDate(result.timestamp)}
							</div>
						</div>
						<button
							type="button"
							onclick={(e) => handleRemove(result.id, e)}
							class="text-text-secondary hover:text-red-500 transition-colors flex-shrink-0"
							aria-label="Remove"
						>
							<Trash2 size={14} />
						</button>
					</div>

					<div class="grid grid-cols-3 gap-2 text-xs">
						<div>
							<div class="text-text-secondary">Return</div>
							<div
								class="font-semibold {result.totalReturn >= 0
									? 'text-green-500'
									: 'text-red-500'}"
							>
								{formatPercent(result.totalReturn)}
							</div>
						</div>
						<div>
							<div class="text-text-secondary">Sharpe</div>
							<div class="font-semibold text-text-primary">
								{result.sharpeRatio.toFixed(2)}
							</div>
						</div>
						<div>
							<div class="text-text-secondary">Max DD</div>
							<div class="font-semibold text-orange-500">
								{formatPercent(Math.abs(result.maxDrawdown))}
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-border/50">
						<div>
							<span class="text-text-secondary">Trades:</span>
							<span class="font-medium text-text-primary ml-1">{result.totalTrades}</span>
						</div>
						<div>
							<span class="text-text-secondary">Final:</span>
							<span class="font-medium text-text-primary ml-1">
								{formatCurrency(result.finalValue)}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="bg-surface/50 rounded-lg p-6 border border-border text-center">
		<History size={32} class="mx-auto text-text-secondary mb-2" />
		<p class="text-sm text-text-secondary">No recent backtests</p>
		<p class="text-xs text-text-secondary mt-1">Run a backtest to see history here</p>
	</div>
{/if}

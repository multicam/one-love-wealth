<script lang="ts">
	import { TrendingUp, TrendingDown, Target, Percent, BarChart, Zap } from 'lucide-svelte';
	import type { PerformanceMetrics } from '@one-love-wealth/backtesting';

	interface Props {
		metrics: PerformanceMetrics;
		showAdvanced?: boolean;
	}

	let { metrics, showAdvanced = false }: Props = $props();

	// Format helpers
	function formatPercent(value: number): string {
		return `${(value * 100).toFixed(2)}%`;
	}

	function formatNumber(value: number, decimals = 2): string {
		return value.toFixed(decimals);
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatDuration(days: number): string {
		if (days < 30) return `${days} days`;
		if (days < 365) return `${Math.round(days / 30)} months`;
		return `${(days / 365).toFixed(1)} years`;
	}

	// Core metrics (top 6)
	const coreMetrics = $derived([
		{
			label: 'Total Return',
			value: formatPercent(metrics.totalReturnPercent),
			icon: TrendingUp,
			color: metrics.totalReturnPercent >= 0 ? 'text-green-500' : 'text-red-500',
			bgColor: metrics.totalReturnPercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
		},
		{
			label: 'CAGR',
			value: formatPercent(metrics.cagr),
			icon: BarChart,
			color: metrics.cagr >= 0 ? 'text-blue-500' : 'text-red-500',
			bgColor: metrics.cagr >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10',
		},
		{
			label: 'Sharpe Ratio',
			value: formatNumber(metrics.sharpeRatio),
			icon: Target,
			color:
				metrics.sharpeRatio >= 1
					? 'text-green-500'
					: metrics.sharpeRatio >= 0
						? 'text-yellow-500'
						: 'text-red-500',
			bgColor:
				metrics.sharpeRatio >= 1
					? 'bg-green-500/10'
					: metrics.sharpeRatio >= 0
						? 'bg-yellow-500/10'
						: 'bg-red-500/10',
		},
		{
			label: 'Max Drawdown',
			value: formatPercent(Math.abs(metrics.maxDrawdownPercent)),
			icon: TrendingDown,
			color: 'text-orange-500',
			bgColor: 'bg-orange-500/10',
		},
		{
			label: 'Win Rate',
			value: formatPercent(metrics.winRate),
			icon: Percent,
			color: metrics.winRate >= 0.5 ? 'text-green-500' : 'text-orange-500',
			bgColor: metrics.winRate >= 0.5 ? 'bg-green-500/10' : 'bg-orange-500/10',
		},
		{
			label: 'Total Trades',
			value: metrics.totalTrades.toString(),
			icon: Zap,
			color: 'text-purple-500',
			bgColor: 'bg-purple-500/10',
		},
	]);

	// Advanced metrics
	const advancedMetrics = $derived([
		{ label: 'Sortino Ratio', value: formatNumber(metrics.sortinoRatio) },
		{ label: 'Calmar Ratio', value: formatNumber(metrics.calmarRatio) },
		{ label: 'Volatility', value: formatPercent(metrics.volatility) },
		{ label: 'Profit Factor', value: formatNumber(metrics.profitFactor) },
		{ label: 'Winning Trades', value: metrics.winningTrades.toString() },
		{ label: 'Losing Trades', value: metrics.losingTrades.toString() },
		{ label: 'Average Win', value: formatCurrency(metrics.averageWin) },
		{ label: 'Average Loss', value: formatCurrency(metrics.averageLoss) },
		{ label: 'Average Trade', value: formatCurrency(metrics.averageTrade) },
		{ label: 'Largest Win', value: formatCurrency(metrics.largestWin) },
		{ label: 'Largest Loss', value: formatCurrency(metrics.largestLoss) },
		{
			label: 'Max DD Duration',
			value: formatDuration(metrics.maxDrawdownDuration),
		},
		{ label: 'Trading Days', value: metrics.tradingDays.toString() },
		{ label: 'Years Traded', value: formatNumber(metrics.yearsTraded, 1) },
		{ label: 'Exposure', value: formatPercent(metrics.exposurePercent) },
	]);
</script>

<div class="space-y-6">
	<!-- Core Metrics Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each coreMetrics as metric}
			{@const Icon = metric.icon}
			<div class="bg-surface rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
				<div class="flex items-start justify-between mb-3">
					<div class="flex items-center gap-2">
						<div class="{metric.bgColor} p-2 rounded-lg">
							<Icon size={18} class={metric.color} />
						</div>
						<span class="text-sm font-medium text-text-secondary">{metric.label}</span>
					</div>
				</div>
				<div class="text-2xl font-bold {metric.color}">
					{metric.value}
				</div>
			</div>
		{/each}
	</div>

	<!-- Advanced Metrics -->
	{#if showAdvanced}
		<div class="space-y-3">
			<h3 class="text-sm font-semibold text-text-primary">Advanced Metrics</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each advancedMetrics as metric}
					<div class="bg-surface/50 rounded-lg border border-border p-3">
						<div class="text-xs text-text-secondary mb-1">{metric.label}</div>
						<div class="text-sm font-semibold text-text-primary">
							{metric.value}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

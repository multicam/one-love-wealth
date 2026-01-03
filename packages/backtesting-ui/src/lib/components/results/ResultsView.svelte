<script lang="ts">
	import { BarChart3, TrendingUp, List, TrendingDown } from "lucide-svelte";
	import { backtest } from "$lib/stores/backtest.svelte";
	import { strategy } from "$lib/stores/strategy.svelte";
	import MetricsGrid from "./MetricsGrid.svelte";
	import TradeLog from "./TradeLog.svelte";
	import EquityCurve from "../charts/EquityCurve.svelte";
	import PriceChart from "./PriceChart.svelte";
	import DrawdownChart from "./DrawdownChart.svelte";

	// Tab state
	let activeTab = $state<"overview" | "charts" | "trades" | "drawdowns">(
		"overview",
	);

	// Tab definitions
	const tabs = [
		{ id: "overview" as const, label: "Overview", icon: BarChart3 },
		{ id: "charts" as const, label: "Charts", icon: TrendingUp },
		{ id: "trades" as const, label: "Trades", icon: List },
		{ id: "drawdowns" as const, label: "Drawdowns", icon: TrendingDown },
	];

	// Format numbers
	function formatPercent(value: number): string {
		return `${(value * 100).toFixed(2)}%`;
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatNumber(value: number, decimals = 2): string {
		return value.toFixed(decimals);
	}
</script>

{#if backtest.hasResult && backtest.result}
	<div class="h-full flex flex-col">
		<!-- Header with Strategy Info -->
		<div class="border-b border-border bg-surface/50 px-6 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-text-primary">
						{strategy.selectedStrategy?.name || "Backtest Results"}
					</h2>
					<p class="text-sm text-text-secondary mt-1">
						{backtest.result.trades.length} trades
						{#if backtest.metrics}
							• {formatPercent(backtest.metrics.totalReturn)} return
							• Sharpe
							{formatNumber(backtest.metrics.sharpeRatio)}
						{/if}
					</p>
				</div>

				<!-- Quick Stats -->
				{#if backtest.metrics}
					<div class="flex gap-6">
						<div class="text-right">
							<div class="text-xs text-text-secondary">
								Final Value
							</div>
							<div
								class="text-lg font-semibold {backtest.metrics
									.totalReturn >= 0
									? 'text-green-500'
									: 'text-red-500'}"
							>
								{formatCurrency(
									backtest.result.finalPortfolio.totalValue,
								)}
							</div>
						</div>
						<div class="text-right">
							<div class="text-xs text-text-secondary">
								Total Return
							</div>
							<div
								class="text-lg font-semibold {backtest.metrics
									.totalReturn >= 0
									? 'text-green-500'
									: 'text-red-500'}"
							>
								{formatPercent(backtest.metrics.totalReturn)}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Tab Navigation -->
		<div class="border-b border-border bg-surface/30">
			<div class="flex gap-1 px-6">
				{#each tabs as tab}
					{@const Icon = tab.icon}
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === tab.id}
						onclick={() => (activeTab = tab.id)}
						class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative {activeTab ===
						tab.id
							? 'text-primary'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						<Icon size={16} />
						<span>{tab.label}</span>

						<!-- Active indicator -->
						{#if activeTab === tab.id}
							<div
								class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
							></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Tab Content -->
		<div class="flex-1 overflow-y-auto">
			{#if activeTab === "overview"}
				<!-- Overview Tab -->
				<div class="p-6">
					{#if backtest.metrics}
						<MetricsGrid
							metrics={backtest.metrics}
							showAdvanced={true}
						/>
					{:else}
						<div
							class="bg-surface/50 rounded-lg p-8 border border-border"
						>
							<div class="text-center">
								<BarChart3
									size={48}
									class="mx-auto text-text-secondary mb-4"
								/>
								<h3
									class="text-lg font-semibold text-text-primary mb-2"
								>
									No Metrics Available
								</h3>
								<p class="text-sm text-text-secondary">
									Metrics will appear here after running a
									backtest
								</p>
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === "charts"}
				<!-- Charts Tab -->
				<div class="p-6">
					{#if backtest.result}
						<div class="space-y-6">
							<EquityCurve
								equityCurve={backtest.result.equityCurve}
								trades={backtest.result.trades}
							/>
							<PriceChart trades={backtest.result.trades} />
						</div>
					{/if}
				</div>
			{:else if activeTab === "trades"}
				<!-- Trades Tab -->
				<div class="p-6">
					{#if backtest.result}
						<TradeLog trades={backtest.result.trades} />
					{/if}
				</div>
			{:else if activeTab === "drawdowns"}
				<!-- Drawdowns Tab -->
				<div class="p-6">
					{#if backtest.result}
						<DrawdownChart
							equityCurve={backtest.result.equityCurve}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- No Results -->
	<div class="h-full flex items-center justify-center p-6">
		<div class="text-center max-w-md">
			<BarChart3 size={64} class="mx-auto text-text-secondary mb-4" />
			<h3 class="text-xl font-semibold text-text-primary mb-2">
				No Results Yet
			</h3>
			<p class="text-sm text-text-secondary mb-6">
				Configure your strategy parameters and run a backtest to see
				results here.
			</p>
			{#if strategy.selectedStrategyId}
				<p class="text-xs text-text-secondary">
					Selected: <span class="font-medium"
						>{strategy.selectedStrategy?.name}</span
					>
				</p>
			{/if}
		</div>
	</div>
{/if}

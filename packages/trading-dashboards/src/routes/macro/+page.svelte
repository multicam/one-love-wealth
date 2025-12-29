<script lang="ts">
	import { onMount } from 'svelte';
	import MetricCard from '$lib/components/charts/MetricCard.svelte';
	import ChartModal from '$lib/components/modals/ChartModal.svelte';
	import { RefreshButton } from '@one-love-wealth/shared-ui';
	import {
		btcPrice,
		fearGreed,
		sentiment,
		manufacturing,
		m2Growth,
		sofrSpread,
		vix,
		btcGoldRatio,
		fetchMacroData,
		lastUpdate,
		type MacroIndicator
	} from '$lib/stores/macro/indicators';

	let modalOpen = $state(false);
	let selectedIndicator = $state<MacroIndicator | null>(null);
	let selectedTitle = $state('');

	function openChart(indicator: MacroIndicator, title: string) {
		selectedIndicator = indicator;
		selectedTitle = title;
		modalOpen = true;
	}

	function closeChart() {
		modalOpen = false;
		selectedIndicator = null;
		selectedTitle = '';
	}

	onMount(() => {
		// Initial fetch
		fetchMacroData();

		// Refresh every hour
		const interval = setInterval(fetchMacroData, 60 * 60 * 1000);

		return () => clearInterval(interval);
	});

	function formatLastUpdate(date: Date | null): string {
		if (!date) return 'Never';
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return date.toLocaleDateString();
	}
</script>

<div class="macro-dashboard">
	<div class="dashboard-header">
		<div>
			<h1 class="dashboard-title">Macro Dashboard</h1>
			<p class="dashboard-subtitle">Economic indicators and market sentiment tracking</p>
		</div>
		<div class="header-actions">
			<div class="last-updated">
				Last updated: {formatLastUpdate($lastUpdate)}
			</div>
			<RefreshButton onRefresh={fetchMacroData} />
		</div>
	</div>

	<section class="metrics-section">
		<h2 class="section-title">Price & Sentiment</h2>
		<div class="metrics-grid">
			<MetricCard
				title="BTC Price"
				value="${$btcPrice.value.toLocaleString()}"
				change={$btcPrice.change}
				changePercent={$btcPrice.changePercent}
				implication={$btcPrice.implication}
				status={$btcPrice.status}
				onclick={() => openChart($btcPrice, 'BTC Price')}
			/>

			<MetricCard
				title="Fear & Greed Index"
				value={$fearGreed.value}
				change={$fearGreed.change}
				changePercent={$fearGreed.changePercent}
				implication={$fearGreed.implication}
				status={$fearGreed.status}
				onclick={() => openChart($fearGreed, 'Fear & Greed Index')}
			/>

			<MetricCard
				title="Michigan Consumer Sentiment"
				value={$sentiment.value}
				change={$sentiment.change}
				changePercent={$sentiment.changePercent}
				implication={$sentiment.implication}
				status={$sentiment.status}
				onclick={() => openChart($sentiment, 'Michigan Consumer Sentiment')}
			/>
		</div>
	</section>

	<section class="metrics-section">
		<h2 class="section-title">Economic Indicators</h2>
		<div class="metrics-grid">
			<MetricCard
				title="ISM Manufacturing PMI"
				value={$manufacturing.value}
				change={$manufacturing.change}
				changePercent={$manufacturing.changePercent}
				implication={$manufacturing.implication}
				status={$manufacturing.status}
				onclick={() => openChart($manufacturing, 'ISM Manufacturing PMI')}
			/>

			<MetricCard
				title="M2 YoY Growth"
				value="{$m2Growth.value}%"
				change={$m2Growth.change}
				changePercent={$m2Growth.changePercent}
				implication={$m2Growth.implication}
				status={$m2Growth.status}
				onclick={() => openChart($m2Growth, 'M2 YoY Growth')}
			/>

			<MetricCard
				title="SOFR-EFFR Spread"
				value="+{$sofrSpread.value}%"
				change={$sofrSpread.change}
				changePercent={$sofrSpread.changePercent}
				implication={$sofrSpread.implication}
				status={$sofrSpread.status}
				onclick={() => openChart($sofrSpread, 'SOFR-EFFR Spread')}
			/>
		</div>
	</section>

	<section class="metrics-section">
		<h2 class="section-title">Risk Indicators</h2>
		<div class="metrics-grid">
			<MetricCard
				title="VIX (Equity Fear)"
				value={$vix.value}
				change={$vix.change}
				changePercent={$vix.changePercent}
				implication={$vix.implication}
				status={$vix.status}
				onclick={() => openChart($vix, 'VIX (Equity Fear)')}
			/>

			<MetricCard
				title="BTC/Gold Ratio"
				value="{$btcGoldRatio.value}x"
				change={$btcGoldRatio.change}
				changePercent={$btcGoldRatio.changePercent}
				implication={$btcGoldRatio.implication}
				status={$btcGoldRatio.status}
				onclick={() => openChart($btcGoldRatio, 'BTC/Gold Ratio')}
			/>
		</div>
	</section>

	<section class="analysis-section">
		<div class="card analysis-card">
			<h2 class="section-title">Macro Thesis</h2>
			<div class="thesis-content">
				<h3>Key Observations</h3>
				<ul>
					<li>
						<strong>Fear vs Price:</strong> BTC near ATH despite extreme fear (F&G: {$fearGreed.value})
						- classic "wall of worry" setup
					</li>
					<li>
						<strong>Liquidity Leading:</strong> M2 growth accelerating ({$m2Growth.value}%) - fuel
						gauge filling
					</li>
					<li>
						<strong>Consumer Capitulation:</strong> Michigan Sentiment at {$sentiment.value} (near
						2008 lows) - generational exhaustion
					</li>
					<li>
						<strong>Manufacturing Lag:</strong> ISM PMI at {$manufacturing.value} (contraction) - lagging
						indicator, liquidity leads by 6-12 months
					</li>
					<li>
						<strong>Credit Functional:</strong> VIX at {$vix.value}, SOFR spread +{$sofrSpread.value}%
						- nervous but no 2008-style seizure
					</li>
				</ul>

				<h3>Thesis: Price Leads Sentiment in Bulls</h3>
				<p>
					BTC holding key support with elevated volatility but no breakdown. Crowd sentiment
					remains in panic zone (&lt;25 Fear & Greed), supporting continuation of the bull market
					"wall of worry." No euphoria trap - accumulation zone intact.
				</p>
			</div>
		</div>
	</section>
</div>

<ChartModal
	isOpen={modalOpen}
	indicator={selectedIndicator}
	title={selectedTitle}
	onClose={closeChart}
/>

<style>
	.macro-dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.dashboard-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		margin-bottom: var(--spacing-xs);
	}

	.dashboard-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.header-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-sm);
	}

	.last-updated {
		font-size: 0.875rem;
		color: var(--text-muted);
		text-align: right;
	}

	.metrics-section {
		margin-bottom: var(--spacing-xl);
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		margin-bottom: var(--spacing-md);
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-md);
	}

	.analysis-section {
		margin-top: var(--spacing-xl);
	}

	.analysis-card {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
	}

	.thesis-content h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.thesis-content h3:first-child {
		margin-top: 0;
	}

	.thesis-content ul {
		list-style: none;
		padding: 0;
	}

	.thesis-content li {
		padding: var(--spacing-sm) 0;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.thesis-content li::before {
		content: '→ ';
		color: var(--accent-primary);
		font-weight: bold;
		margin-right: var(--spacing-xs);
	}

	.thesis-content p {
		color: var(--text-secondary);
		line-height: 1.8;
		margin: var(--spacing-md) 0;
	}
</style>

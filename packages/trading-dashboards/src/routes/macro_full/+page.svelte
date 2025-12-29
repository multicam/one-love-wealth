<script lang="ts">
	import { onMount } from 'svelte';
	import TimeSeriesChart from '$lib/components/charts/TimeSeriesChart.svelte';
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
		lastUpdate
	} from '$lib/stores/macro/indicators';

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

	// Subscribe to all stores at top level
	const indicators = [
		{ data: $btcPrice, title: 'BTC Price', prefix: '$', suffix: '' },
		{ data: $fearGreed, title: 'Fear & Greed Index', prefix: '', suffix: '' },
		{ data: $sentiment, title: 'Michigan Consumer Sentiment', prefix: '', suffix: '' },
		{ data: $manufacturing, title: 'ISM Manufacturing PMI', prefix: '', suffix: '' },
		{ data: $m2Growth, title: 'M2 YoY Growth', prefix: '', suffix: '%' },
		{ data: $sofrSpread, title: 'SOFR-EFFR Spread', prefix: '+', suffix: '%' },
		{ data: $vix, title: 'VIX (Equity Fear)', prefix: '', suffix: '' },
		{ data: $btcGoldRatio, title: 'BTC/Gold Ratio', prefix: '', suffix: 'x' }
	];
</script>

<div class="macro-full">
	<div class="dashboard-header">
		<div>
			<h1 class="dashboard-title">Macro Dashboard - Full View</h1>
			<p class="dashboard-subtitle">All economic indicators with historical charts</p>
		</div>
		<div class="last-updated">
			Last updated: {formatLastUpdate($lastUpdate)}
		</div>
	</div>

	<div class="indicators-grid">
		{#each indicators as { data, title, prefix, suffix }}
			<div class="indicator-card status-{data.status}">
				<div class="indicator-info">
					<h3 class="indicator-title">{title}</h3>
					<div class="indicator-value">
						{prefix}{typeof data.value === 'number'
							? data.value.toLocaleString()
							: data.value}{suffix}
					</div>
					<div class="indicator-change" class:positive={data.change > 0} class:negative={data.change < 0}>
						{#if data.change > 0}
							↑
						{:else if data.change < 0}
							↓
						{:else}
							→
						{/if}
						{Math.abs(data.change).toFixed(2)}
						<span class="percent">({data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
					</div>
					{#if data.implication}
						<div class="indicator-implication">
							{data.implication}
						</div>
					{/if}
				</div>
				<div class="indicator-chart">
					<TimeSeriesChart
						data={data.history}
						title={title}
						height={250}
						color={data.status === 'bullish' ? 'var(--green)' : data.status === 'bearish' ? 'var(--red)' : 'var(--accent-primary)'}
					/>
				</div>
			</div>
		{/each}
	</div>

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

<style>
	.macro-full {
		max-width: 1600px;
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

	.last-updated {
		font-size: 0.875rem;
		color: var(--text-muted);
		text-align: right;
	}

	.indicators-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.indicator-card {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		transition: all var(--transition-fast);
	}

	.indicator-card:hover {
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-md);
	}

	.indicator-card.status-bullish {
		border-left: 4px solid var(--green);
	}

	.indicator-card.status-bearish {
		border-left: 4px solid var(--red);
	}

	.indicator-card.status-neutral {
		border-left: 4px solid var(--text-muted);
	}

	.indicator-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--spacing-sm);
	}

	.indicator-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.indicator-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.indicator-change {
		font-size: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.indicator-change.positive {
		color: var(--green);
	}

	.indicator-change.negative {
		color: var(--red);
	}

	.percent {
		color: var(--text-muted);
		font-weight: 400;
	}

	.indicator-implication {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.6;
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--divider-color);
	}

	.indicator-chart {
		display: flex;
		align-items: center;
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

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		margin-bottom: var(--spacing-md);
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

	@media (max-width: 1200px) {
		.indicators-grid {
			grid-template-columns: 1fr;
		}

		.indicator-card {
			grid-template-columns: 1fr;
		}
	}
</style>

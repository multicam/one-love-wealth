<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		change?: number;
		changePercent?: number;
		implication?: string;
		status?: 'bullish' | 'bearish' | 'neutral';
		lastUpdate?: string;
		onclick?: () => void;
	}

	let { title, value, change, changePercent, implication, status = 'neutral', lastUpdate, onclick }: Props = $props();

	const hasChange = $derived(change !== undefined);
	const isPositive = $derived(change !== undefined && change > 0);
	const isNegative = $derived(change !== undefined && change < 0);
	const isClickable = $derived(onclick !== undefined);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="metric-card {status}"
	class:clickable={isClickable}
	onclick={isClickable ? onclick : undefined}
	onkeydown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick?.(); } } : undefined}
	role={isClickable ? 'button' : undefined}
	tabindex={isClickable ? 0 : undefined}
>
	<div class="card-header">
		<h3 class="title">{title}</h3>
		{#if lastUpdate}
			<span class="last-update">{lastUpdate}</span>
		{/if}
	</div>

	<div class="value">{value}</div>

	{#if hasChange}
		<div class="change" class:positive={isPositive} class:negative={isNegative}>
			{#if isPositive}
				↑
			{:else if isNegative}
				↓
			{:else}
				→
			{/if}
			{Math.abs(change || 0).toFixed(2)}
			{#if changePercent !== undefined}
				<span class="percent">({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
			{/if}
		</div>
	{/if}

	{#if implication}
		<div class="implication">
			{implication}
		</div>
	{/if}
</div>

<style>
	.metric-card {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		transition: all var(--transition-fast);
	}

	.metric-card.clickable {
		cursor: pointer;
	}

	.metric-card:hover {
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-md);
	}

	.metric-card.clickable:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.metric-card.clickable:active {
		transform: translateY(0);
	}

	.metric-card.bullish {
		border-left: 4px solid var(--green);
	}

	.metric-card.bearish {
		border-left: 4px solid var(--red);
	}

	.metric-card.neutral {
		border-left: 4px solid var(--text-muted);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.last-update {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: var(--spacing-sm) 0;
		font-family: 'JetBrains Mono', monospace;
	}

	.change {
		font-size: 0.875rem;
		font-weight: 600;
		margin: var(--spacing-sm) 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.change.positive {
		color: var(--green);
	}

	.change.negative {
		color: var(--red);
	}

	.percent {
		color: var(--text-muted);
		font-weight: 400;
	}

	.implication {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--divider-color);
		line-height: 1.6;
	}
</style>

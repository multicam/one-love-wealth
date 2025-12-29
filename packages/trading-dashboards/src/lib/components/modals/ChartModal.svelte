<script lang="ts">
	import TimeSeriesChart from '$lib/components/charts/TimeSeriesChart.svelte';
	import type { MacroIndicator } from '$lib/stores/macro/indicators';

	interface Props {
		isOpen: boolean;
		indicator: MacroIndicator | null;
		title: string;
		onClose: () => void;
	}

	let { isOpen, indicator, title, onClose }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && indicator}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="modal-backdrop" 
		onclick={handleBackdropClick}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBackdropClick(e as unknown as MouseEvent); }}
		role="button"
		tabindex="-1"
		aria-label="Close modal"
	>
		<div class="modal-content">
			<div class="modal-header">
				<h2>{title} - Historical Data</h2>
				<button class="close-button" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="modal-body">
				{#if indicator.history && indicator.history.length > 0}
					<TimeSeriesChart data={indicator.history} {title} height={400} />

					<div class="stats">
						<div class="stat-item">
							<span class="stat-label">Current Value</span>
							<span class="stat-value">{indicator.value}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Change</span>
							<span class="stat-value" class:positive={indicator.change > 0} class:negative={indicator.change < 0}>
								{indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
								({indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%)
							</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Status</span>
							<span class="stat-value status-{indicator.status}">{indicator.status}</span>
						</div>
					</div>

					{#if indicator.implication}
						<div class="implication">
							<strong>Analysis:</strong> {indicator.implication}
						</div>
					{/if}
				{:else}
					<div class="no-data">
						<p>No historical data available yet.</p>
						<p class="hint">Data will populate as it's fetched from APIs.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-lg);
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-lg);
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.close-button {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 2rem;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.close-button:hover {
		background: rgba(239, 68, 68, 0.1);
		color: var(--red);
	}

	.modal-body {
		padding: var(--spacing-lg);
		overflow-y: auto;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
		padding: var(--spacing-md);
		background: var(--card-bg);
		border-radius: var(--radius-md);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.stat-value.positive {
		color: var(--green);
	}

	.stat-value.negative {
		color: var(--red);
	}

	.stat-value.status-bullish {
		color: var(--green);
		text-transform: capitalize;
	}

	.stat-value.status-bearish {
		color: var(--red);
		text-transform: capitalize;
	}

	.stat-value.status-neutral {
		color: var(--text-muted);
		text-transform: capitalize;
	}

	.implication {
		margin-top: var(--spacing-lg);
		padding: var(--spacing-md);
		background: rgba(59, 130, 246, 0.05);
		border-left: 3px solid var(--accent-primary);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.implication strong {
		color: var(--text-primary);
	}

	.no-data {
		text-align: center;
		padding: var(--spacing-xl) * 2;
		color: var(--text-secondary);
	}

	.no-data p {
		margin: var(--spacing-sm) 0;
	}

	.hint {
		font-size: 0.875rem;
		color: var(--text-muted);
	}
</style>

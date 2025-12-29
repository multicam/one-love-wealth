<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createChart } from 'lightweight-charts';

	interface Props {
		data: Array<{ value: number; timestamp: Date }>;
		title: string;
		color?: string;
		height?: number;
	}

	let { data, title, color = '#3b82f6', height = 300 }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: any = null;
	let lineSeries: any = null;

	onMount(() => {
		if (!chartContainer) return;

		// Create chart
		chart = createChart(chartContainer, {
			width: chartContainer.clientWidth,
			height,
			layout: {
				background: { color: '#0a0e17' },
				textColor: '#94a3b8'
			},
			grid: {
				vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
				horzLines: { color: 'rgba(148, 163, 184, 0.1)' }
			},
			timeScale: {
				borderColor: 'rgba(148, 163, 184, 0.2)',
				timeVisible: true
			},
			rightPriceScale: {
				borderColor: 'rgba(148, 163, 184, 0.2)'
			}
		});

		// Add line series (v4 API)
		lineSeries = chart.addLineSeries({
			color,
			lineWidth: 2,
			priceFormat: {
				type: 'custom',
				formatter: (price: number) => {
					if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
					if (price >= 1) return price.toFixed(2);
					return price.toFixed(4);
				}
			}
		});

		// Transform data for chart
		const chartData = data
			.map((d) => ({
				time: Math.floor(d.timestamp.getTime() / 1000),
				value: d.value
			}))
			.sort((a, b) => a.time - b.time);

		if (chartData.length > 0) {
			lineSeries.setData(chartData);
			chart.timeScale().fitContent();
		}

		// Handle resize
		const handleResize = () => {
			if (chart && chartContainer) {
				chart.applyOptions({
					width: chartContainer.clientWidth
				});
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		if (chart) {
			chart.remove();
			chart = null;
		}
	});
</script>

<div class="chart-wrapper">
	<h3 class="chart-title">{title}</h3>
	<div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
	.chart-wrapper {
		width: 100%;
	}

	.chart-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 var(--spacing-md) 0;
	}

	.chart-container {
		width: 100%;
		position: relative;
	}
</style>

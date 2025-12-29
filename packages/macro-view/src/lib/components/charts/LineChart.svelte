<script lang="ts">
	import { onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ChartDataset } from 'chart.js';
	import { colors } from '$lib/config/design-tokens';

	interface Props {
		labels: string[];
		datasets: ChartDataset[];
		title?: string;
		yAxisLog?: boolean;
		dualAxis?: boolean;
	}

	let { 
		labels, 
		datasets, 
		title = '', 
		yAxisLog = false, 
		dualAxis = false 
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	function createChart() {
		if (chart) chart.destroy();
		if (!canvas) return;

		const scales: any = {
			x: {
				ticks: { color: colors.chart.axis },
				grid: { color: colors.chart.grid }
			},
			y: {
				type: yAxisLog ? 'logarithmic' : 'linear',
				position: 'left',
				ticks: { color: colors.chart.axis },
				grid: { color: colors.chart.grid }
			}
		};

		if (dualAxis) {
			scales.y1 = {
				type: 'linear',
				position: 'right',
				ticks: { color: colors.chart.axis },
				grid: { drawOnChartArea: false }
			};
		}

        // Unwrap proxies using $state.snapshot to avoid Chart.js errors with Svelte 5 proxies
		const config: ChartConfiguration = {
			type: 'line',
			data: {
				labels: $state.snapshot(labels) as string[],
				datasets: $state.snapshot(datasets) as ChartDataset<'line'>[]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					title: {
						display: !!title,
						text: title,
						color: colors.text.muted,
						font: { size: 16 }
					},
					legend: {
						labels: { color: colors.text.secondary }
					},
					tooltip: {
						backgroundColor: colors.chart.tooltip.bg,
						titleColor: colors.text.primary,
						bodyColor: colors.chart.tooltip.text,
						borderColor: colors.chart.tooltip.border,
						borderWidth: 1
					}
				},
				scales
			}
		};

		chart = new Chart(canvas, config);
	}

	$effect(() => {
		if (canvas && labels && datasets) {
			createChart();
		}
	});

	onDestroy(() => {
		if (chart) chart.destroy();
	});
</script>

<div class="relative h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>
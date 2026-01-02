<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createChart, ColorType, type IChartApi, type ISeriesApi, type LineData, type AreaData } from 'lightweight-charts';
	import type { EquityPoint } from '@one-love-wealth/backtesting';

	interface Props {
		equityCurve: EquityPoint[];
		height?: number;
	}

	let { equityCurve, height = 400 }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: IChartApi | null = null;
	let lineSeries: ISeriesApi<'Line'> | null = null;
	let areaSeries: ISeriesApi<'Area'> | null = null;

	let viewMode = $state<'overlay' | 'separate'>('overlay');

	// Initialize chart
	onMount(() => {
		if (!chartContainer) return;

		// Create chart
		chart = createChart(chartContainer, {
			layout: {
				background: { type: ColorType.Solid, color: 'transparent' },
				textColor: '#9ca3af',
			},
			grid: {
				vertLines: { color: '#2a2e39' },
				horzLines: { color: '#2a2e39' },
			},
			width: chartContainer.clientWidth,
			height: height,
			timeScale: {
				timeVisible: true,
				secondsVisible: false,
			},
			crosshair: {
				mode: 1,
			},
		});

		// Handle resize
		const handleResize = () => {
			if (chart && chartContainer) {
				chart.applyOptions({ width: chartContainer.clientWidth });
			}
		};

		window.addEventListener('resize', handleResize);

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// Cleanup chart on unmount
	onDestroy(() => {
		if (chart) {
			chart.remove();
		}
	});

	// Update chart when data or view mode changes
	$effect(() => {
		if (!chart) return;

		// Remove existing series
		if (lineSeries) {
			chart.removeSeries(lineSeries);
			lineSeries = null;
		}
		if (areaSeries) {
			chart.removeSeries(areaSeries);
			areaSeries = null;
		}

		if (viewMode === 'overlay') {
			// Overlay mode: equity line + drawdown area
			lineSeries = chart.addLineSeries({
				color: '#3b82f6',
				lineWidth: 2,
				priceFormat: {
					type: 'price',
					precision: 2,
					minMove: 0.01,
				},
			});

			areaSeries = chart.addAreaSeries({
				topColor: 'rgba(239, 68, 68, 0.4)',
				bottomColor: 'rgba(239, 68, 68, 0.1)',
				lineColor: 'rgba(239, 68, 68, 0.8)',
				lineWidth: 1,
				priceFormat: {
					type: 'percent',
					precision: 2,
				},
			});

			// Set equity data
			const equityData: LineData[] = equityCurve.map((point) => ({
				time: Math.floor(point.time / 1000) as any,
				value: point.equity,
			}));
			lineSeries.setData(equityData);

			// Set drawdown data (as percentage, negative values)
			const drawdownData: AreaData[] = equityCurve.map((point) => ({
				time: Math.floor(point.time / 1000) as any,
				value: point.drawdownPercent, // Already negative from 0 to -1
			}));
			areaSeries.setData(drawdownData);
		} else {
			// Separate mode: only drawdown area
			areaSeries = chart.addAreaSeries({
				topColor: 'rgba(239, 68, 68, 0.05)',
				bottomColor: 'rgba(239, 68, 68, 0.4)',
				lineColor: 'rgba(239, 68, 68, 0.8)',
				lineWidth: 2,
				priceFormat: {
					type: 'percent',
					precision: 2,
				},
			});

			// Set drawdown data (invert for better visualization)
			const drawdownData: AreaData[] = equityCurve.map((point) => ({
				time: Math.floor(point.time / 1000) as any,
				value: point.drawdownPercent, // Negative values show as depth
			}));
			areaSeries.setData(drawdownData);
		}
	});

	// Calculate max drawdown info
	const maxDrawdown = $derived.by(() => {
		if (equityCurve.length === 0) return { percent: 0, date: '' };

		let maxDD = 0;
		let maxDDTime = 0;

		for (const point of equityCurve) {
			if (point.drawdownPercent < maxDD) {
				maxDD = point.drawdownPercent;
				maxDDTime = point.time;
			}
		}

		return {
			percent: maxDD,
			date: new Date(maxDDTime).toLocaleDateString(),
		};
	});
</script>

<div class="space-y-3">
	<!-- Chart Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-text-primary">Drawdown Analysis</h3>
		<div class="flex items-center gap-4">
			<!-- Max Drawdown Info -->
			{#if equityCurve.length > 0}
				<div class="text-xs text-text-secondary">
					<span class="font-medium text-red-500">
						Max DD: {(maxDrawdown.percent * 100).toFixed(2)}%
					</span>
					<span class="ml-2">on {maxDrawdown.date}</span>
				</div>
			{/if}

			<!-- View Mode Toggle -->
			<div class="flex items-center gap-2 bg-surface/50 rounded-lg p-1 border border-border">
				<button
					type="button"
					onclick={() => (viewMode = 'overlay')}
					class="px-3 py-1 text-xs font-medium rounded transition-colors {viewMode === 'overlay'
						? 'bg-primary text-white'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					Overlay
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'separate')}
					class="px-3 py-1 text-xs font-medium rounded transition-colors {viewMode === 'separate'
						? 'bg-primary text-white'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					Separate
				</button>
			</div>
		</div>
	</div>

	<!-- Chart Container -->
	<div class="bg-surface rounded-lg border border-border p-4">
		<div bind:this={chartContainer} style="width: 100%; height: {height}px;"></div>
	</div>

	<!-- Legend -->
	<div class="flex items-center gap-6 text-xs text-text-secondary">
		{#if viewMode === 'overlay'}
			<div class="flex items-center gap-1.5">
				<div class="w-3 h-0.5 bg-blue-500"></div>
				<span>Equity</span>
			</div>
		{/if}
		<div class="flex items-center gap-1.5">
			<div class="w-3 h-2 bg-red-500/40"></div>
			<span>Drawdown</span>
		</div>
		<div class="text-xs text-text-secondary ml-auto">
			<span>
				{#if viewMode === 'overlay'}
					Showing equity curve with drawdown overlay
				{:else}
					Showing drawdown depth from peak
				{/if}
			</span>
		</div>
	</div>
</div>

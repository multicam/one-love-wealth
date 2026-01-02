<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createChart, ColorType, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';
	import type { EquityPoint, Trade } from '@one-love-wealth/backtesting';

	interface Props {
		equityCurve: EquityPoint[];
		trades: Trade[];
		height?: number;
	}

	let { equityCurve, trades, height = 400 }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: IChartApi | null = null;
	let lineSeries: ISeriesApi<'Line'> | null = null;

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
				mode: 1, // Normal crosshair
			},
		});

		// Create line series
		lineSeries = chart.addLineSeries({
			color: '#3b82f6',
			lineWidth: 2,
			priceFormat: {
				type: 'price',
				precision: 2,
				minMove: 0.01,
			},
		});

		// Convert equity curve data to chart format
		const chartData: LineData[] = equityCurve.map((point) => ({
			time: Math.floor(point.time / 1000) as any, // Convert ms to seconds
			value: point.equity,
		}));

		lineSeries.setData(chartData);

		// Add trade markers
		const markers = trades.map((trade) => ({
			time: Math.floor(trade.timestamp / 1000) as any,
			position: trade.side === 'buy' ? ('belowBar' as const) : ('aboveBar' as const),
			color: trade.side === 'buy' ? '#10b981' : '#ef4444',
			shape: trade.side === 'buy' ? ('arrowUp' as const) : ('arrowDown' as const),
			text: `${trade.side.toUpperCase()} ${trade.symbol}`,
		}));

		lineSeries.setMarkers(markers);

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

	// Update chart when data changes
	$effect(() => {
		if (!lineSeries) return;

		// Convert equity curve data to chart format
		const chartData: LineData[] = equityCurve.map((point) => ({
			time: Math.floor(point.time / 1000) as any,
			value: point.equity,
		}));

		lineSeries.setData(chartData);

		// Update trade markers
		const markers = trades.map((trade) => ({
			time: Math.floor(trade.timestamp / 1000) as any,
			position: trade.side === 'buy' ? ('belowBar' as const) : ('aboveBar' as const),
			color: trade.side === 'buy' ? '#10b981' : '#ef4444',
			shape: trade.side === 'buy' ? ('arrowUp' as const) : ('arrowDown' as const),
			text: `${trade.side.toUpperCase()} ${trade.symbol}`,
		}));

		lineSeries.setMarkers(markers);
	});
</script>

<div class="space-y-3">
	<!-- Chart Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-text-primary">Portfolio Equity Curve</h3>
		{#if equityCurve.length > 0}
			<div class="flex items-center gap-4 text-xs text-text-secondary">
				<div class="flex items-center gap-1.5">
					<div class="w-3 h-0.5 bg-blue-500"></div>
					<span>Equity</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-2 h-2 bg-green-500 rounded-full"></div>
					<span>Buy</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-2 h-2 bg-red-500 rounded-full"></div>
					<span>Sell</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Chart Container -->
	<div class="bg-surface rounded-lg border border-border p-4">
		<div bind:this={chartContainer} style="width: 100%; height: {height}px;"></div>
	</div>
</div>

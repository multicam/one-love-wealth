<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createChart, ColorType, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';
	import type { Trade } from '@one-love-wealth/backtesting';

	interface Props {
		trades: Trade[];
		height?: number;
		symbol?: string;
	}

	let { trades, height = 400, symbol }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: IChartApi | null = null;
	let lineSeries: ISeriesApi<'Line'> | null = null;

	// Filter trades by symbol if specified
	const filteredTrades = $derived(() => {
		if (!symbol) return trades;
		return trades.filter((t) => t.symbol === symbol);
	});

	// Get unique symbols
	const symbols = $derived(() => {
		const unique = new Set(trades.map((t) => t.symbol));
		return Array.from(unique).sort();
	});

	let selectedSymbol = $state<string>('');

	// Update selected symbol when symbols change
	$effect(() => {
		const syms = symbols();
		if (syms.length > 0 && !selectedSymbol) {
			selectedSymbol = syms[0];
		}
	});

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

		// Create line series
		lineSeries = chart.addLineSeries({
			color: '#8b5cf6',
			lineWidth: 2,
			priceFormat: {
				type: 'price',
				precision: 2,
				minMove: 0.01,
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

	// Update chart when data changes
	$effect(() => {
		if (!lineSeries) return;

		const displayTrades = symbol ? trades.filter((t) => t.symbol === symbol) :
			trades.filter((t) => t.symbol === selectedSymbol);

		if (displayTrades.length === 0) {
			lineSeries.setData([]);
			return;
		}

		// Create price points from trades
		const priceData: LineData[] = displayTrades.map((trade) => ({
			time: Math.floor(trade.timestamp / 1000) as any,
			value: trade.price,
		}));

		lineSeries.setData(priceData);

		// Add trade markers
		const markers = displayTrades.map((trade) => ({
			time: Math.floor(trade.timestamp / 1000) as any,
			position: trade.side === 'buy' ? ('belowBar' as const) : ('aboveBar' as const),
			color: trade.side === 'buy' ? '#10b981' : '#ef4444',
			shape: trade.side === 'buy' ? ('arrowUp' as const) : ('arrowDown' as const),
			text: `${trade.side.toUpperCase()} @ ${trade.price.toFixed(2)}`,
		}));

		lineSeries.setMarkers(markers);
	});
</script>

<div class="space-y-3">
	<!-- Chart Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h3 class="text-sm font-semibold text-text-primary">Trade Prices</h3>
			{#if !symbol && symbols().length > 1}
				<select
					bind:value={selectedSymbol}
					class="px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary focus:outline-none focus:border-primary"
				>
					{#each symbols() as sym}
						<option value={sym}>{sym}</option>
					{/each}
				</select>
			{/if}
		</div>
		<div class="flex items-center gap-4 text-xs text-text-secondary">
			<div class="flex items-center gap-1.5">
				<div class="w-3 h-0.5 bg-purple-500"></div>
				<span>Price</span>
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
	</div>

	<!-- Chart Container -->
	<div class="bg-surface rounded-lg border border-border p-4">
		<div bind:this={chartContainer} style="width: 100%; height: {height}px;"></div>
	</div>

	<!-- Note about limitations -->
	<div class="text-xs text-text-secondary bg-surface/30 rounded-lg p-3 border border-border/50">
		<strong>Note:</strong> This chart shows trade execution prices. Full OHLCV candlestick data will be available
		once the data-layer integration is complete.
	</div>
</div>

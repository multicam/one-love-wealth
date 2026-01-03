<script lang="ts">
	import { onMount, untrack } from "svelte";
	import {
		createChart,
		ColorType,
		LineSeries,
		type IChartApi,
		type ISeriesApi,
		type LineData,
		type SeriesMarker,
		type Time,
	} from "lightweight-charts";
	import type { Trade } from "@one-love-wealth/backtesting";

	interface Props {
		trades: Trade[];
		height?: number;
		symbol?: string;
	}

	let { trades, height = 400, symbol }: Props = $props();

	let chartContainer: HTMLDivElement | undefined = $state(undefined);
	let chart: IChartApi | null = null;
	let lineSeries: ISeriesApi<"Line"> | null = null;
	let resizeObserver: ResizeObserver | null = null;

	// Get unique symbols for the selector (if no symbol prop is provided)
	let uniqueSymbols = $derived.by(() => {
		const list = Array.from(new Set(trades.map((t) => t.symbol))).sort();
		return list;
	});

	let selectedSymbol = $state<string>("");

	// Update selected symbol when trades change
	$effect(() => {
		if (uniqueSymbols.length > 0 && !selectedSymbol && !symbol) {
			selectedSymbol = uniqueSymbols[0];
		}
	});

	// Filtered trades for display
	let displayTrades = $derived.by(() => {
		const sym = symbol || selectedSymbol;
		if (!sym) return [];
		return trades.filter((t) => t.symbol === sym);
	});

	// Initialize chart when container is available
	function initChart() {
		if (!chartContainer || chart) return;

		chart = createChart(chartContainer, {
			layout: {
				background: { type: ColorType.Solid, color: "transparent" },
				textColor: "#9ca3af",
				fontFamily: "Inter, system-ui, sans-serif",
			},
			grid: {
				vertLines: { color: "#2a2e39", style: 1 },
				horzLines: { color: "#2a2e39", style: 1 },
			},
			width: chartContainer.clientWidth || 400,
			height: height,
			timeScale: {
				timeVisible: true,
				secondsVisible: false,
				borderColor: "#374151",
			},
			rightPriceScale: {
				borderColor: "#374151",
			},
			crosshair: {
				mode: 1,
			},
		});

		lineSeries = chart.addSeries(LineSeries, {
			color: "#8b5cf6",
			lineWidth: 2,
			priceFormat: {
				type: "price",
				precision: 2,
				minMove: 0.01,
			},
		});

		updateChartData();

		resizeObserver = new ResizeObserver((entries) => {
			if (entries.length === 0 || !chart) return;
			const { width } = entries[0].contentRect;
			if (width > 0) {
				chart.applyOptions({ width });
			}
		});
		resizeObserver.observe(chartContainer);
	}

	// Initialize on mount
	onMount(() => {
		initChart();
		return () => {
			resizeObserver?.disconnect();
			if (chart) {
				chart.remove();
				chart = null;
				lineSeries = null;
			}
		};
	});

	function updateChartData() {
		if (!lineSeries || !displayTrades.length) {
			if (lineSeries) lineSeries.setData([]);
			return;
		}

		// Convert data to chart format
		// Note: We use trade prices as a proxy for the price curve
		const priceData: LineData[] = displayTrades.map((trade) => ({
			time: Math.floor(trade.timestamp / 1000) as Time,
			value: trade.price,
		}));

		priceData.sort((a, b) => (a.time as number) - (b.time as number));

		// Remote duplicates for same timestamp
		const uniqueData = priceData.filter(
			(val, index, self) =>
				index === 0 || val.time !== self[index - 1].time,
		);

		lineSeries.setData(uniqueData);

		// Fit content to view
		if (chart) {
			chart.timeScale().fitContent();
		}

		// Note: Trade markers removed - setMarkers API changed in lightweight-charts v5
	}

	// Initialize chart when container becomes available
	$effect(() => {
		const container = chartContainer;
		if (container) {
			untrack(() => {
				if (!chart) {
					initChart();
				}
			});
		}
	});

	// Update data when it changes
	$effect(() => {
		const dtLen = displayTrades.length;
		untrack(() => {
			if (chart && lineSeries && dtLen > 0) {
				updateChartData();
			}
		});
	});
</script>

<div class="space-y-3">
	<!-- Chart Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h3 class="text-sm font-semibold text-text-primary">
				Trade Prices
			</h3>
			{#if !symbol && uniqueSymbols.length > 1}
				<select
					bind:value={selectedSymbol}
					class="px-2 py-1 text-xs bg-surface border border-border rounded text-text-primary outline-none focus:border-primary"
				>
					{#each uniqueSymbols as sym}
						<option value={sym}>{sym}</option>
					{/each}
				</select>
			{/if}
			{#if symbol || selectedSymbol}
				<span
					class="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded"
				>
					{symbol || selectedSymbol}
				</span>
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
	<div
		class="bg-surface-primary rounded-xl border border-border overflow-hidden p-1 shadow-sm relative"
	>
		<div bind:this={chartContainer} class="w-full" style="height: {height}px;"></div>

		{#if displayTrades.length === 0}
			<div
				class="absolute inset-0 flex items-center justify-center bg-surface/50 pointer-events-none"
			>
				<p class="text-sm text-text-secondary">
					No trade data for this symbol
				</p>
			</div>
		{/if}
	</div>

	<div
		class="text-xs text-text-secondary bg-surface/30 rounded-lg p-3 border border-border/50"
	>
		<strong>Note:</strong> This chart displays individual trade execution points.
		Full historical price data (candlesticks) will be integrated from the data-layer
		in a future update.
	</div>
</div>

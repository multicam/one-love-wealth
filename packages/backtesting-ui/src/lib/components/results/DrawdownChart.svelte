<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import {
		createChart,
		ColorType,
		LineSeries,
		AreaSeries,
		type IChartApi,
		type ISeriesApi,
		type LineData,
		type AreaData,
		type Time,
	} from "lightweight-charts";
	import type { EquityPoint } from "@one-love-wealth/backtesting";

	interface Props {
		equityCurve: EquityPoint[];
		height?: number;
	}

	let { equityCurve, height = 400 }: Props = $props();

	let chartContainer: HTMLDivElement | undefined = $state(undefined);
	let chart: IChartApi | null = null;
	let lineSeries: ISeriesApi<"Line"> | null = null;
	let areaSeries: ISeriesApi<"Area"> | null = null;
	let resizeObserver: ResizeObserver | null = null;

	let viewMode = $state<"overlay" | "separate">("overlay");

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

		updateChart();

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
				areaSeries = null;
			}
		};
	});

	function updateChart() {
		if (!chart) return;

		// Clear existing
		if (lineSeries) {
			chart.removeSeries(lineSeries);
			lineSeries = null;
		}
		if (areaSeries) {
			chart.removeSeries(areaSeries);
			areaSeries = null;
		}

		if (viewMode === "overlay") {
			lineSeries = chart.addSeries(LineSeries, {
				color: "#34d399",
				lineWidth: 2,
				priceFormat: { type: "price", precision: 2, minMove: 0.01 },
			});

			areaSeries = chart.addSeries(AreaSeries, {
				topColor: "rgba(239, 68, 68, 0.4)",
				bottomColor: "rgba(239, 68, 68, 0.05)",
				lineColor: "rgba(239, 68, 68, 0.8)",
				lineWidth: 1,
				priceFormat: { type: "percent", precision: 2 },
			});

			const equityData: LineData[] = equityCurve.map((p) => ({
				time: Math.floor(p.time / 1000) as Time,
				value: p.equity,
			}));
			lineSeries.setData(equityData);

			const drawdownData: AreaData[] = equityCurve.map((p) => ({
				time: Math.floor(p.time / 1000) as Time,
				value: p.drawdownPercent * 100, // Use percent for overlay
			}));
			areaSeries.setData(drawdownData);
		} else {
			areaSeries = chart.addSeries(AreaSeries, {
				topColor: "rgba(239, 68, 68, 0.05)",
				bottomColor: "rgba(239, 68, 68, 0.4)",
				lineColor: "rgba(239, 68, 68, 0.8)",
				lineWidth: 2,
				priceFormat: { type: "percent", precision: 2 },
			});

			const drawdownData: AreaData[] = equityCurve.map((p) => ({
				time: Math.floor(p.time / 1000) as Time,
				value: p.drawdownPercent * 100,
			}));
			areaSeries.setData(drawdownData);
		}

		// Fit content to view
		if (chart) {
			chart.timeScale().fitContent();
		}
	}

	$effect(() => {
		const container = chartContainer;
		const eqLen = equityCurve.length;
		const vm = viewMode;
		
		// Initialize chart when container is ready
		if (container && !chart) {
			initChart();
		}
		// Update if chart is initialized
		if (chart && eqLen > 0) {
			updateChart();
		}
	});

	const maxDrawdown = $derived.by(() => {
		if (equityCurve.length === 0) return { percent: 0, date: "" };
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
		<h3 class="text-sm font-semibold text-text-primary">
			Drawdown Analysis
		</h3>
		<div class="flex items-center gap-4">
			{#if equityCurve.length > 0}
				<div class="text-xs text-text-secondary">
					<span class="font-medium text-red-500">
						Max DD: {(maxDrawdown.percent * 100).toFixed(2)}%
					</span>
					<span class="ml-2">on {maxDrawdown.date}</span>
				</div>
			{/if}

			<div
				class="flex items-center gap-1 bg-surface-tertiary rounded-lg p-0.5 border border-border"
			>
				<button
					type="button"
					onclick={() => (viewMode = "overlay")}
					class="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded transition-all {viewMode ===
					'overlay'
						? 'bg-primary text-white shadow-sm'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					Overlay
				</button>
				<button
					type="button"
					onclick={() => (viewMode = "separate")}
					class="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded transition-all {viewMode ===
					'separate'
						? 'bg-primary text-white shadow-sm'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					Depth
				</button>
			</div>
		</div>
	</div>

	<div
		class="bg-surface-primary rounded-xl border border-border overflow-hidden p-1 shadow-sm relative"
	>
		<div bind:this={chartContainer} class="w-full" style="height: {height}px;"></div>

		{#if equityCurve.length === 0}
			<div
				class="absolute inset-0 flex items-center justify-center bg-surface/50 pointer-events-none"
			>
				<p class="text-sm text-text-secondary">
					No drawdown data available
				</p>
			</div>
		{/if}
	</div>

	<!-- Legend -->
	<div class="flex items-center gap-6 text-xs text-text-secondary">
		{#if viewMode === "overlay"}
			<div class="flex items-center gap-1.5">
				<div class="w-3 h-0.5 bg-emerald-400"></div>
				<span>Equity</span>
			</div>
		{/if}
		<div class="flex items-center gap-1.5">
			<div class="w-3 h-2 bg-red-500/40"></div>
			<span>Drawdown</span>
		</div>
	</div>
</div>

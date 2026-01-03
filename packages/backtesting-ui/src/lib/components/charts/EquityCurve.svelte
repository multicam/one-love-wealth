<script lang="ts">
  import { onMount, onDestroy } from "svelte";
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
  import type { EquityPoint, Trade } from "@one-love-wealth/backtesting";

  interface Props {
    equityCurve: EquityPoint[];
    trades?: Trade[];
    height?: number;
    title?: string;
  }

  let {
    equityCurve,
    trades = [],
    height = 400,
    title = "Portfolio Equity",
  }: Props = $props();

  let chartContainer = $state<HTMLDivElement>();
  let chart: IChartApi | null = null;
  let lineSeries: ISeriesApi<"Line"> | null = null;

  // Initialize chart
  onMount(() => {
    if (!chartContainer) return;

    // Create chart
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
      width: chartContainer.clientWidth,
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
        mode: 1, // Normal
      },
    });

    // Create series using v5 addSeries API
    lineSeries = chart.addSeries(LineSeries, {
      color: "#34d399",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    updateChartData();

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chart) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });

    resizeObserver.observe(chartContainer);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.remove();
        chart = null;
      }
    };
  });

  // Function to update data and markers
  function updateChartData() {
    if (!lineSeries || !equityCurve.length) return;

    // Convert data to chart format
    const chartData: LineData[] = equityCurve.map((point) => ({
      time: Math.floor(point.time / 1000) as Time,
      value: point.equity,
    }));

    // Data must be sorted by time
    chartData.sort((a, b) => (a.time as number) - (b.time as number));

    // Remove duplicates
    const uniqueData = chartData.filter(
      (val, index, self) => index === 0 || val.time !== self[index - 1].time,
    );

    lineSeries.setData(uniqueData);

    // Add trade markers if available
    if (trades && trades.length > 0) {
      const markers: SeriesMarker<Time>[] = trades
        .filter((t) => t.timestamp) // Ensure timestamp exists
        .map((trade) => ({
          time: Math.floor(trade.timestamp / 1000) as Time,
          position: trade.side === "buy" ? "belowBar" : "aboveBar",
          color: trade.side === "buy" ? "#10b981" : "#ef4444",
          shape: trade.side === "buy" ? "arrowUp" : "arrowDown",
          text: `${trade.side.toUpperCase()} ${trade.symbol}`,
        }));

      // Markers must also be sorted
      markers.sort((a, b) => (a.time as number) - (b.time as number));
      (lineSeries as any).setMarkers(markers);
    }
  }

  // React to data changes
  $effect(() => {
    if (equityCurve || trades) {
      updateChartData();
    }
  });
</script>

<div class="space-y-3">
  {#if title}
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-text-primary">{title}</h3>
      {#if equityCurve.length > 0}
        <div class="flex items-center gap-4 text-xs text-text-secondary">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-0.5 bg-emerald-400"></div>
            <span>Equity</span>
          </div>
          {#if trades.length > 0}
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Buy</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Sell</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <div
    class="bg-surface-primary rounded-xl border border-border overflow-hidden p-1 shadow-sm"
  >
    <div bind:this={chartContainer} class="w-full"></div>
  </div>

  {#if equityCurve.length === 0}
    <div
      class="absolute inset-0 flex items-center justify-center bg-surface/50 rounded-xl pointer-events-none"
    >
      <p class="text-sm text-text-secondary">No equity curve data available</p>
    </div>
  {/if}
</div>

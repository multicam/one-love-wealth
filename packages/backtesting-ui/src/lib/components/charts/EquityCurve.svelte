<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
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

  let chartContainer: HTMLDivElement | undefined = $state(undefined);
  let chart: IChartApi | null = null;
  let lineSeries: ISeriesApi<"Line"> | null = null;
  let resizeObserver: ResizeObserver | null = null;

  // Initialize chart when container is available
  function initChart() {
    if (!chartContainer || chart) return;

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

  // Function to update data and markers
  function updateChartData() {
    if (!lineSeries || !equityCurve.length) {
      console.log('[EquityCurve] No data to render:', { hasLineSeries: !!lineSeries, dataLength: equityCurve.length });
      return;
    }

    console.log('[EquityCurve] Rendering', equityCurve.length, 'points');

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

    console.log('[EquityCurve] Setting', uniqueData.length, 'unique points, first:', uniqueData[0], 'last:', uniqueData[uniqueData.length - 1]);

    lineSeries.setData(uniqueData);

    // Fit content to view
    if (chart) {
      chart.timeScale().fitContent();
    }

    // Note: Trade markers removed - setMarkers API changed in lightweight-charts v5
    // TODO: Implement markers using the new v5 API if needed
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
    const eqLen = equityCurve.length;
    const trLen = trades.length;
    untrack(() => {
      if (chart && lineSeries && eqLen > 0) {
        updateChartData();
      }
    });
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
    <div bind:this={chartContainer} class="w-full" style="height: {height}px;"></div>
  </div>

  {#if equityCurve.length === 0}
    <div
      class="absolute inset-0 flex items-center justify-center bg-surface/50 rounded-xl pointer-events-none"
    >
      <p class="text-sm text-text-secondary">No equity curve data available</p>
    </div>
  {/if}
</div>

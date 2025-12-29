<script lang="ts">
  import { onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { ChartConfiguration, ChartDataset, ScaleOptions } from 'chart.js';

  interface Props {
    /** X-axis labels (dates/times) */
    labels: string[];
    /** Chart datasets */
    datasets: ChartDataset[];
    /** Chart title */
    title?: string;
    /** Use logarithmic Y axis */
    yAxisLog?: boolean;
    /** Enable dual Y axes */
    dualAxis?: boolean;
    /** Chart height in pixels or CSS value */
    height?: string;
    /** Theme colors override */
    theme?: {
      axis?: string;
      grid?: string;
      text?: string;
      tooltipBg?: string;
      tooltipText?: string;
      tooltipBorder?: string;
    };
  }

  let {
    labels,
    datasets,
    title = '',
    yAxisLog = false,
    dualAxis = false,
    height = '100%',
    theme = {}
  }: Props = $props();

  // Default dark theme colors
  const defaultTheme = {
    axis: theme.axis ?? '#64748b',
    grid: theme.grid ?? '#1e293b',
    text: theme.text ?? '#94a3b8',
    tooltipBg: theme.tooltipBg ?? '#1e293b',
    tooltipText: theme.tooltipText ?? '#e2e8f0',
    tooltipBorder: theme.tooltipBorder ?? '#334155'
  };

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  function createChart() {
    if (chart) chart.destroy();
    if (!canvas) return;

    const scales: Record<string, ScaleOptions> = {
      x: {
        ticks: { color: defaultTheme.axis },
        grid: { color: defaultTheme.grid }
      },
      y: {
        type: yAxisLog ? 'logarithmic' : 'linear',
        position: 'left',
        ticks: { color: defaultTheme.axis },
        grid: { color: defaultTheme.grid }
      }
    };

    if (dualAxis) {
      scales.y1 = {
        type: 'linear',
        position: 'right',
        ticks: { color: defaultTheme.axis },
        grid: { drawOnChartArea: false }
      };
    }

    // Unwrap Svelte 5 proxies using $state.snapshot
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
            color: defaultTheme.text,
            font: { size: 16 }
          },
          legend: {
            labels: { color: defaultTheme.text }
          },
          tooltip: {
            backgroundColor: defaultTheme.tooltipBg,
            titleColor: defaultTheme.tooltipText,
            bodyColor: defaultTheme.tooltipText,
            borderColor: defaultTheme.tooltipBorder,
            borderWidth: 1
          }
        },
        scales: scales as any
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

<div style="position: relative; width: 100%; height: {height};">
  <canvas bind:this={canvas}></canvas>
</div>

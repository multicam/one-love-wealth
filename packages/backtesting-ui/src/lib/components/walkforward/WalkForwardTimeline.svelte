<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { WalkForwardWindow } from '$lib/stores/walkforward';

  interface Props {
    windows: WalkForwardWindow[];
    onWindowClick?: (window: WalkForwardWindow) => void;
  }

  let { windows, onWindowClick }: Props = $props();

  let container = $state<HTMLDivElement>();
  let selectedWindow = $state<number | null>(null);

  // Re-render when windows change
  $effect(() => {
    if (container && windows.length > 0) {
      renderTimeline();
    }
  });

  onMount(() => {
    if (container && windows.length > 0) {
      renderTimeline();
    }
  });

  function renderTimeline() {
    if (!container) return;

    // Clear existing
    d3.select(container).selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 60, left: 20 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', 200)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const allDates = windows.flatMap((w) => [
      new Date(w.inSampleStart),
      new Date(w.inSampleEnd),
      new Date(w.outSampleStart),
      new Date(w.outSampleEnd),
    ]);

    const minDate = d3.min(allDates)!;
    const maxDate = d3.max(allDates)!;

    // X scale (time)
    const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

    // Draw timeline axis
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat('%Y-%m') as any);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '10px');

    // Draw windows
    const windowHeight = 30;
    const gap = 10;

    windows.forEach((window, i) => {
      const y = i * (windowHeight + gap);

      // In-sample period (blue)
      const inSampleStart = xScale(new Date(window.inSampleStart));
      const inSampleEnd = xScale(new Date(window.inSampleEnd));
      const inSampleWidth = inSampleEnd - inSampleStart;

      svg
        .append('rect')
        .attr('x', inSampleStart)
        .attr('y', y)
        .attr('width', inSampleWidth)
        .attr('height', windowHeight)
        .attr('fill', '#3B82F6')
        .attr('opacity', selectedWindow === i ? 1 : 0.7)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => handleWindowClick(window, i))
        .append('title')
        .text(
          `Window ${window.windowNumber}\nIn-Sample: ${window.inSampleStart} to ${window.inSampleEnd}\nSharpe: ${window.inSampleMetrics.sharpe.toFixed(2)}`
        );

      // Out-sample period (green)
      const outSampleStart = xScale(new Date(window.outSampleStart));
      const outSampleEnd = xScale(new Date(window.outSampleEnd));
      const outSampleWidth = outSampleEnd - outSampleStart;

      svg
        .append('rect')
        .attr('x', outSampleStart)
        .attr('y', y)
        .attr('width', outSampleWidth)
        .attr('height', windowHeight)
        .attr('fill', '#10B981')
        .attr('opacity', selectedWindow === i ? 1 : 0.7)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => handleWindowClick(window, i))
        .append('title')
        .text(
          `Window ${window.windowNumber}\nOut-of-Sample: ${window.outSampleStart} to ${window.outSampleEnd}\nSharpe: ${window.outSampleMetrics.sharpe.toFixed(2)}\nDegradation: ${window.degradationPercent.toFixed(1)}%`
        );

      // Window label
      svg
        .append('text')
        .attr('x', inSampleStart + 5)
        .attr('y', y + windowHeight / 2 + 4)
        .attr('fill', 'white')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(`W${window.windowNumber}`);
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width - 180},-30)`);

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#3B82F6')
      .attr('rx', 2);

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('fill', '#D1D5DB')
      .style('font-size', '11px')
      .text('In-Sample');

    legend
      .append('rect')
      .attr('x', 90)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#10B981')
      .attr('rx', 2);

    legend
      .append('text')
      .attr('x', 110)
      .attr('y', 12)
      .attr('fill', '#D1D5DB')
      .style('font-size', '11px')
      .text('Out-of-Sample');
  }

  function handleWindowClick(window: WalkForwardWindow, index: number) {
    selectedWindow = index;
    if (onWindowClick) {
      onWindowClick(window);
    }
  }
</script>

<div class="w-full">
  <h3 class="text-lg font-semibold mb-3 text-text-primary">Timeline</h3>
  <div bind:this={container} class="w-full"></div>

  {#if windows.length === 0}
    <div class="h-48 flex items-center justify-center">
      <p class="text-sm text-text-secondary">No windows to display</p>
    </div>
  {/if}
</div>

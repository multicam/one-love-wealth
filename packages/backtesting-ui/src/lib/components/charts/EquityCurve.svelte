<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  interface Props {
    data: Array<{ date: string; value: number }>;
  }

  let { data }: Props = $props();

  let container = $state<HTMLDivElement>();

  // Re-render when data changes
  $effect(() => {
    if (container && data.length > 0) {
      renderChart();
    }
  });

  onMount(() => {
    if (container && data.length > 0) {
      renderChart();
    }
  });

  function renderChart() {
    if (!container) return;

    // Clear existing
    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parsedData = data.map((d) => ({
      date: new Date(d.date),
      value: d.value,
    }));

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.value)!])
      .nice()
      .range([height, 0]);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat('%Y-%m') as any);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `$${d3.format(',.0f')(d as number)}`);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '11px');

    svg.append('g').call(yAxis).selectAll('text').style('fill', '#9CA3AF').style('font-size', '11px');

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-width).tickFormat(() => ''))
      .style('stroke', '#374151')
      .style('stroke-opacity', 0.1)
      .style('stroke-dasharray', '2,2');

    // Line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw line
    svg
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg
      .selectAll('circle')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 3)
      .attr('fill', '#10B981')
      .append('title')
      .text((d) => `${d.date.toISOString().split('T')[0]}: $${d.value.toFixed(2)}`);

    // Labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px')
      .text('Date');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '12px')
      .text('Equity Value');
  }
</script>

<div bind:this={container} class="w-full"></div>

{#if data.length === 0}
  <div class="h-96 flex items-center justify-center bg-surface-secondary rounded-lg">
    <p class="text-sm text-text-secondary">No equity curve data available</p>
  </div>
{/if}

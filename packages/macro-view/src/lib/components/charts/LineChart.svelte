<!--
  LineChart wrapper for macro-view that uses shared-ui LineChart
  with the project's design token colors.
-->
<script lang="ts">
	import { LineChart as SharedLineChart } from '@one-love-wealth/shared-ui';
	import type { ChartDataset } from 'chart.js';
	import { colors } from '$lib/config/design-tokens';

	interface Props {
		labels: string[];
		datasets: ChartDataset[];
		title?: string;
		yAxisLog?: boolean;
		dualAxis?: boolean;
	}

	let { 
		labels, 
		datasets, 
		title = '', 
		yAxisLog = false, 
		dualAxis = false 
	}: Props = $props();

	// Map design tokens to shared-ui theme format
	const theme = $derived({
		axis: colors.chart.axis,
		grid: colors.chart.grid,
		text: colors.text.muted,
		tooltipBg: colors.chart.tooltip.bg,
		tooltipText: colors.chart.tooltip.text,
		tooltipBorder: colors.chart.tooltip.border
	});
</script>

<SharedLineChart 
	{labels} 
	{datasets} 
	{title} 
	{yAxisLog} 
	{dualAxis}
	{theme}
/>

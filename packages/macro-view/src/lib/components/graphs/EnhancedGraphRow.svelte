<script lang="ts">
	import { onMount } from 'svelte';
	import type { EnhancedGraphDefinition } from '$lib/types/graph-definition';
	import { dataProviderRegistry } from '$lib/data-providers/registry';
	import { applyTransforms } from '$lib/logic/transform-engine';
	import LineChart from '../charts/LineChart.svelte';
	import Skeleton from '../common/Skeleton.svelte';
	import FavoriteButton from './FavoriteButton.svelte';
	import type { DataPoint } from '$lib/db';

	interface Props {
		graph: EnhancedGraphDefinition;
	}

	let { graph }: Props = $props();

	let loading = $state(false);
	let error = $state('');
	let loaded = $state(false);
	let container: HTMLDivElement;
	let chartData = $state<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

	async function loadData() {
		if (loading || loaded) return;
		loading = true;
		error = '';

		try {
			// Fetch all data sources in parallel using provider registry
			const promises = graph.dataSources.map(async (sourceConfig) => {
				const result = await dataProviderRegistry.fetch(sourceConfig);
				return { config: sourceConfig, data: result.series.data };
			});

			const results = await Promise.all(promises);

			// Apply client-side transforms if configured
			const transformedResults = results.map((result, index) => {
				let data = result.data;

				// Apply series-specific transforms
				if (graph.transforms) {
					const seriesTransforms = graph.transforms.filter(
						(t) => t.seriesIndex === undefined || t.seriesIndex === index
					);
					if (seriesTransforms.length > 0) {
						data = applyTransforms(data, seriesTransforms);
					}
				}

				return { ...result, data };
			});

			// Determine date range
			let dateRange = { start: '', end: '' };
			if (graph.timeAlignment?.dateRange) {
				dateRange = {
					start: graph.timeAlignment.dateRange.start || '',
					end: graph.timeAlignment.dateRange.end || ''
				};
			}

			// Merge data on common timestamps
			const allTimes = new Set<number>();
			const startTime = dateRange.start ? new Date(dateRange.start).getTime() : 0;
			const endTime = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
			transformedResults.forEach((result) => {
				result.data.forEach((point: DataPoint) => {
					// Skip invalid timestamps
					if (!point.time || !Number.isFinite(point.time)) return;
					// Apply date range filter
					if (point.time < startTime) return;
					if (point.time > endTime) return;
					allTimes.add(point.time);
				});
			});

			let sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

			// Apply recentPoints filter if configured
			if (graph.timeAlignment?.recentPoints) {
				sortedTimes = sortedTimes.slice(-graph.timeAlignment.recentPoints);
			} else {
				// Default: Last 200 points for performance
				sortedTimes = sortedTimes.slice(-200);
			}

			// Convert timestamps to date labels for display
			const labels = sortedTimes.map(t => new Date(t).toISOString().split('T')[0]);

			// Build datasets with time alignment
			const datasets = transformedResults.map((result, index) => {
				const config = result.config;
				const dataMap = new Map(result.data.map((d: DataPoint) => [d.time, d.value]));

				// Get time shift configuration for this series
				const shiftConfig = graph.timeAlignment?.shifts?.find((s) => s.seriesIndex === index);

				let values = sortedTimes.map((time) => {
					// Apply time shift if configured
					if (shiftConfig) {
						const shiftMonths = shiftConfig.months;
						const direction = shiftConfig.direction;

						// Calculate shifted time
						const dateObj = new Date(time);
						if (direction === 'lead') {
							dateObj.setMonth(dateObj.getMonth() + shiftMonths);
						} else {
							dateObj.setMonth(dateObj.getMonth() - shiftMonths);
						}
						const shiftedTime = dateObj.getTime();

						// Look up value at shifted time
						return dataMap.get(shiftedTime) ?? null;
					}

					// No shift - direct lookup
					return dataMap.get(time) ?? null;
				});

				// Get display configuration
				const display = config.display || {};
				const color = display.color || '#3b82f6';
				const label = display.label || config.name;
				const yAxisId = display.yAxisId || (graph.chartConfig.dualAxis && index > 0 ? 'y1' : 'y');

				return {
					label,
					data: values,
					borderColor: color,
					backgroundColor: color + '10', // 10% opacity
					yAxisID: yAxisId,
					tension: 0.4,
					pointRadius: 0
				};
			});

			chartData = { labels, datasets };
			loaded = true;
		} catch (e: any) {
			console.error('[EnhancedGraphRow] Error loading data:', e);
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadData();
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		); // Load when 200px away

		if (container) observer.observe(container);

		return () => observer.disconnect();
	});
</script>

<div
	bind:this={container}
	class="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl scroll-mt-24 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl"
	id={`graph-${graph.id}`}
>
	<div class="flex flex-col justify-between gap-6">
		<div class="space-y-4">
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1">
					<h3 class="text-xl font-bold text-white leading-tight">{graph.title}</h3>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each graph.dataSources as source}
							{@const display = source.display || {}}
							{@const color = display.color || '#3b82f6'}
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
								style="color: {color}"
							>
								{source.name}
							</span>
						{/each}
					</div>
				</div>
				<FavoriteButton graphId={graph.id} />
			</div>

			<p class="text-sm text-slate-400 leading-relaxed">
				{graph.description}
			</p>

			{#if error}
				<div
					class="p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-xs text-red-300"
				>
					Error loading data: {error}
					<button
						onclick={() => {
							loaded = false;
							loadData();
						}}
						class="underline ml-2">Retry</button
					>
				</div>
			{/if}
		</div>

		<div class="h-120 bg-slate-950/30 rounded-xl border border-slate-800/50 p-2 relative">
			{#if !loaded && !error}
				<div class="absolute inset-0 flex items-center justify-center z-10">
					<div class="text-center space-y-3">
						<div
							class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
						></div>
						<p class="text-xs text-slate-500 uppercase tracking-widest">Loading Data...</p>
					</div>
				</div>
				<!-- Skeleton background -->
				<div class="opacity-20 blur-sm h-full">
					<Skeleton class="w-full h-full" />
				</div>
			{:else if loaded}
				<!-- Chart type routing -->
				{#if graph.chartConfig.type === 'line'}
					<LineChart
						labels={chartData.labels}
						datasets={chartData.datasets}
						yAxisLog={graph.chartConfig.yAxisLog}
						dualAxis={graph.chartConfig.dualAxis}
					/>
				{:else if graph.chartConfig.type === 'scatter'}
					<!-- Scatter chart not yet implemented - fallback to line -->
					<LineChart
						labels={chartData.labels}
						datasets={chartData.datasets}
						yAxisLog={graph.chartConfig.yAxisLog}
						dualAxis={graph.chartConfig.dualAxis}
					/>
					<div class="absolute bottom-2 left-2 text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-800/50">
						Scatter chart not yet implemented - showing as line chart
					</div>
				{:else if graph.chartConfig.type === 'bar'}
					<!-- Bar chart not yet implemented - fallback to line -->
					<LineChart
						labels={chartData.labels}
						datasets={chartData.datasets}
						yAxisLog={graph.chartConfig.yAxisLog}
						dualAxis={graph.chartConfig.dualAxis}
					/>
					<div class="absolute bottom-2 left-2 text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-800/50">
						Bar chart not yet implemented - showing as line chart
					</div>
				{:else if graph.chartConfig.type === 'area'}
					<!-- Area chart not yet implemented - fallback to line -->
					<LineChart
						labels={chartData.labels}
						datasets={chartData.datasets}
						yAxisLog={graph.chartConfig.yAxisLog}
						dualAxis={graph.chartConfig.dualAxis}
					/>
					<div class="absolute bottom-2 left-2 text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-800/50">
						Area chart not yet implemented - showing as line chart
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { GraphDefinition } from '$lib/logic/graphs-config';
	import { fredProvider, coinGeckoProvider, yahooProvider } from '$lib/data-providers';
	import { TimeUtils } from '@one-love-wealth/data-layer';
	import LineChart from '../charts/LineChart.svelte';
	import Skeleton from '../common/Skeleton.svelte';
	import type { DataPoint } from '$lib/db';
	import { components, colors } from '$lib/config/design-tokens';

	interface Props {
		graph: GraphDefinition;
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
			const promises = graph.dataSources.map(async (source) => {
				let data: DataPoint[] = [];
				if (source.type === 'fred') {
					const res = await fredProvider.fetch({ type: 'fred', seriesId: source.id, id: source.id, name: source.name });
					data = res.series.data;
				} else if (source.type === 'coingecko') {
					const res = await coinGeckoProvider.fetch({ type: 'coingecko', coinId: source.id, id: source.id, name: source.name });
					data = res.series.data;
				} else if (source.type === 'yahoo') {
					const res = await yahooProvider.fetch({ type: 'yahoo', symbol: source.id, id: source.id, name: source.name });
					data = res.series.data;
				}
				return { ...source, data };
			});

			const results = await Promise.all(promises);

			// Normalize Dates (Simple intersection for MVP)
			// Find the most recent date range common to all series or union
			// For simplicity, we use the date range of the first series
			if (results.length === 0) return;

			const baseData = results[0].data;
            // Limit to last 5-10 years for readability unless it's a long term chart
            const recentData = baseData.slice(-120); // ~10 years monthly or ~4m daily. 
            // Better: Slice by date. Let's just take last 200 points for performance
            
			const labels = recentData.map(d => TimeUtils.toISO(d).split('T')[0]);

			const datasets = results.map((res, index) => {
				// Apply time shift if configured (shift values forward/backward relative to labels)
                // If timeShift is +6 months, we want to shift this series' data so that T matches T+6 of the base.
                // Visually, shifting a leading indicator FORWARD (right) aligns it with the lagging one.
                // Array shift: [1, 2, 3] shifted +1 => [null, 1, 2]
                let seriesData = res.data;
                const shiftMonths = graph.chartConfig.timeShift || 0;
                
                // Map values to base labels
				let values = labels.map(date => {
					const dateTs = new Date(date).getTime();
					const point = seriesData.find(d => d.time === dateTs) || 
                                  seriesData.find(d => d.time >= dateTs);
					return point ? (point.value ?? null) : null;
				});

                if (shiftMonths !== 0 && index === 1) { // Apply to the second series typically? Or specific series?
                    // The config is on the graph, but usually applies to one series relative to another.
                    // For "ISM vs Rates (Lead 6m)", Rates leads ISM. So we shift Rates.
                    // Ideally, config should specify WHICH series to shift.
                    // For now, let's assume if timeShift exists, we shift the SECOND series (index 1).
                    // Approximation: 1 month ~ 1 data point if monthly.
                    // If daily data, this is harder. Assuming monthly for macro data.
                    const shiftCount = Math.round(shiftMonths); 
                    if (shiftCount > 0) {
                        values = Array(shiftCount).fill(null).concat(values.slice(0, -shiftCount));
                    } else if (shiftCount < 0) {
                        values = values.slice(-shiftCount).concat(Array(-shiftCount).fill(null));
                    }
                }

				return {
					label: res.label || res.name,
					data: values,
					borderColor: res.color,
					backgroundColor: res.color + '10', // 10% opacity
					yAxisID: graph.chartConfig.dualAxis && index > 0 ? 'y1' : 'y',
					tension: 0.4,
                    pointRadius: 0
				};
			});

			chartData = { labels, datasets };
			loaded = true;
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				loadData();
				observer.disconnect();
			}
		}, { rootMargin: '200px' }); // Load when 200px away

		if (container) observer.observe(container);

		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="{components.card.base} {components.card.hover} p-6 shadow-xl scroll-mt-24" id={`graph-${graph.id}`}>
	<div class="flex flex-col  justify-between gap-6">
		<div class=" space-y-4">
			<div>
				<h3 class="text-xl font-bold text-white leading-tight">{graph.title}</h3>
				<div class="flex flex-wrap gap-2 mt-2">
					{#each graph.dataSources as source}
						<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700" style="color: {source.color}">
							{source.name}
						</span>
					{/each}
				</div>
			</div>
			
			<p class="text-sm text-slate-400 leading-relaxed">
				{graph.description}
			</p>

            {#if error}
                <div class="p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-xs text-red-300">
                    Error loading data: {error}
                    <button onclick={() => { loaded = false; loadData(); }} class="underline ml-2">Retry</button>
                </div>
            {/if}
		</div>

		<div class="h-120 {components.chartContainer.base} relative">
			{#if !loaded && !error}
				<div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="text-center space-y-3">
                        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p class="text-xs text-slate-500 uppercase tracking-widest">Loading Data...</p>
                    </div>
                </div>
                <!-- Skeleton background -->
                <div class="opacity-20 blur-sm h-full">
                    <Skeleton class="w-full h-full" />
                </div>
			{:else if loaded}
				<LineChart 
					labels={chartData.labels} 
					datasets={chartData.datasets}
					yAxisLog={graph.chartConfig.yAxisLog}
					dualAxis={graph.chartConfig.dualAxis}
				/>
			{/if}
		</div>
	</div>
</div>

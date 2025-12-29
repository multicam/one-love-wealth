<script lang="ts">
	import { onMount } from 'svelte';
	import LineChart from '../charts/LineChart.svelte';
	import Skeleton from '../common/Skeleton.svelte';
	import { fredProvider } from '$lib/data-providers';
	import { TimeUtils } from '@one-love-wealth/data-layer';
	import type { DataPoint } from '$lib/db';

	let ismData = $state<DataPoint[]>([]);
	let loading = $state(true);
	let showSinWave = $state(false);

	onMount(async () => {
		try {
			const result = await fredProvider.fetch({ type: 'fred', seriesId: 'IPMAN', id: 'IPMAN', name: 'ISM Manufacturing' });
			ismData = result.series.data;
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	let chartData = $derived.by(() => {
		if (!ismData.length) return { labels: [], datasets: [] };

		const labels = ismData.slice(-60).map(d => TimeUtils.toISO(d).split('T')[0]); // Last 5 years
		const values = ismData.slice(-60).map(d => d.value ?? null);

		const datasets: any[] = [{
			label: 'ISM Manufacturing PMI',
			data: values,
			borderColor: '#10b981', // Emerald
			borderWidth: 2,
			tension: 0.4,
			pointRadius: 0,
			fill: {
				target: 'origin',
				above: 'rgba(16, 185, 129, 0.05)'
			}
		}];

		if (showSinWave) {
			const sinValues = values.map((_, i) => {
				return 50 + 5 * Math.sin((i * 2 * Math.PI) / 48);
			});
			datasets.push({
				label: '4-Year Cycle Model',
				data: sinValues,
				borderColor: 'rgba(148, 163, 184, 0.3)',
				borderDash: [5, 5],
				pointRadius: 0,
				tension: 0.4
			});
		}

		return { labels, datasets };
	});

	let currentPhase = $derived.by(() => {
		if (ismData.length < 2) return 'Unknown';
		const last = ismData[ismData.length - 1].value ?? 0;
		const prev = ismData[ismData.length - 2].value ?? 0;
		
		if (last > 50 && last > prev) return 'Expansion';
		if (last > 50 && last < prev) return 'Slowdown';
		if (last < 50 && last < prev) return 'Contraction';
		return 'Recovery';
	});
</script>

<div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl h-[400px] flex flex-col hover:border-slate-700 transition-colors">
	<div class="flex justify-between items-start mb-6">
		<div>
			<h3 class="text-xl font-bold text-white tracking-tight">Business Cycle Monitor</h3>
			<div class="flex items-center mt-2">
				{#if loading}
					<Skeleton class="h-8 w-12 mr-2" />
					<Skeleton class="h-5 w-24" />
				{:else}
					<span class="text-3xl font-mono font-bold mr-3 {Number(ismData[ismData.length - 1]?.value) < 50 ? 'text-red-400' : 'text-green-400'}">
						{ismData[ismData.length - 1]?.value?.toFixed(1) || '--'}
					</span>
					<span class="px-3 py-1 rounded-full text-xs uppercase font-black tracking-widest
						{currentPhase === 'Contraction' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
						 currentPhase === 'Expansion' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 
						 'bg-slate-800 text-slate-300 border border-slate-700'}">
						{currentPhase}
					</span>
				{/if}
			</div>
		</div>

		<label class="flex items-center cursor-pointer group">
			<span class="mr-3 text-xs font-bold text-slate-500 group-hover:text-slate-400 uppercase tracking-widest">Model</span>
			<input type="checkbox" bind:checked={showSinWave} class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-slate-900" />
		</label>
	</div>

	<div class="flex-1 min-h-0">
		{#if loading}
			<Skeleton class="h-full w-full" />
		{:else}
			<LineChart 
				labels={chartData.labels} 
				datasets={chartData.datasets}
			/>
		{/if}
	</div>
</div>

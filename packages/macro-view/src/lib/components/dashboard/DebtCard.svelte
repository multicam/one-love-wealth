<script lang="ts">
	import { onMount } from 'svelte';
	import LineChart from '../charts/LineChart.svelte';
	import Skeleton from '../common/Skeleton.svelte';
	import { fredClient } from '$lib/logic/api-clients';
	import type { DataPoint } from '$lib/db';

	let debtData = $state<DataPoint[]>([]);
	let interestData = $state<DataPoint[]>([]);
	let loading = $state(true);
	let view = $state<'debt' | 'interest'>('debt');

	onMount(async () => {
		try {
			const debtSeries = await fredClient.fetchSeries('GFDEGDQ188S');
			debtData = debtSeries.data;

			const interestSeries = await fredClient.fetchSeries('A091RC1Q027SBEA');
			interestData = interestSeries.data;
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	let chartData = $derived.by(() => {
		const data = view === 'debt' ? debtData : interestData;
		if (!data.length) return { labels: [], datasets: [] };

		const labels = data.slice(-40).map(d => d.date); 
		const values = data.slice(-40).map(d => d.value);

		return {
			labels,
			datasets: [{
				label: view === 'debt' ? 'US Federal Debt (% of GDP)' : 'Interest Payments ($ Billions)',
				data: values,
				borderColor: view === 'debt' ? '#f43f5e' : '#f59e0b', 
				backgroundColor: view === 'debt' ? 'rgba(244, 63, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)',
				fill: true,
				tension: 0.4,
				pointRadius: 0
			}]
		};
	});
</script>

<div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl h-[400px] flex flex-col hover:border-slate-700 transition-colors">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h3 class="text-xl font-bold text-white tracking-tight">Debt & Debasement</h3>
			<p class="text-sm text-slate-500">Fiscal Dominance Indicators</p>
		</div>
		
		<div class="flex items-center space-x-2 bg-slate-950 rounded-xl p-1.5 border border-slate-800">
			<button 
				class="px-3 py-1.5 text-[10px] font-black tracking-tighter uppercase rounded-lg transition-all
				{view === 'debt' ? 'bg-rose-900/40 text-rose-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}"
				onclick={() => view = 'debt'}
			>
				DEBT/GDP
			</button>
			<button 
				class="px-3 py-1.5 text-[10px] font-black tracking-tighter uppercase rounded-lg transition-all
				{view === 'interest' ? 'bg-amber-900/40 text-amber-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}"
				onclick={() => view = 'interest'}
			>
				INTEREST
			</button>
		</div>
	</div>

	<div class="flex-1 min-h-0">
		{#if loading}
			<div class="h-full flex flex-col space-y-4">
				<Skeleton class="flex-1 w-full" />
				<Skeleton class="h-4 w-1/2 mx-auto" />
			</div>
		{:else}
			<LineChart 
				labels={chartData.labels} 
				datasets={chartData.datasets}
				yAxisLog={false}
			/>
		{/if}
	</div>
</div>
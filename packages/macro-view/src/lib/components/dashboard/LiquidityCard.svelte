<script lang="ts">
	import { onMount } from 'svelte';
	import LineChart from '../charts/LineChart.svelte';
	import Skeleton from '../common/Skeleton.svelte';
	import { fredClient, coinGeckoClient } from '$lib/logic/api-clients';
	import type { DataPoint } from '$lib/db';

	let m2Data = $state<DataPoint[]>([]);
	let btcData = $state<DataPoint[]>([]);
	let loading = $state(true);
	let error = $state('');
	let leadWeeks = $state(0);

	async function loadData() {
		loading = true;
		error = '';
		try {
			const m2Series = await fredClient.fetchSeries('M2SL');
			m2Data = m2Series.data;

			const btcSeries = await coinGeckoClient.fetchMarketChart('bitcoin');
			btcData = btcSeries.data;
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	let chartData = $derived.by(() => {
		if (!m2Data.length || !btcData.length) return { labels: [], datasets: [] };

		const labels = m2Data.map((d) => d.date);
		const m2Values = m2Data.map(d => d.value);
		
		const btcValues = labels.map(date => {
			const btcPoint = btcData.find(d => d.date === date) || 
                       btcData.find(d => d.date >= date);
			return btcPoint ? btcPoint.value : null;
		});

        let shiftedM2 = m2Values;
        if (leadWeeks > 0) {
            const shiftCount = Math.round(leadWeeks / 4); 
            shiftedM2 = Array(shiftCount).fill(null).concat(m2Values.slice(0, -shiftCount));
        }

		return {
			labels,
			datasets: [
				{
					label: `Global Liquidity (M2) ${leadWeeks > 0 ? `(+${leadWeeks}w lead)` : ''}`,
					data: shiftedM2,
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					yAxisID: 'y',
					tension: 0.4,
					pointRadius: 0
				},
				{
					label: 'Bitcoin Price (Log)',
					data: btcValues,
					borderColor: '#f59e0b',
					yAxisID: 'y1',
					tension: 0.4,
					pointRadius: 0
				}
			]
		};
	});
</script>

<div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl h-[500px] flex flex-col hover:border-slate-700 transition-colors">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h3 class="text-xl font-bold text-white tracking-tight">Global Liquidity vs Bitcoin</h3>
			<p class="text-sm text-slate-500">M2 Money Supply vs BTC Price Action</p>
		</div>
		
		<div class="flex items-center space-x-2 bg-slate-950 rounded-xl p-1.5 border border-slate-800">
			<button 
				class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all
				{leadWeeks === 0 ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}"
				onclick={() => leadWeeks = 0}
			>
				CURRENT
			</button>
			<button 
				class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all
				{leadWeeks === 12 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}"
				onclick={() => leadWeeks = 12}
			>
				+12W LEAD
			</button>
		</div>
	</div>

	<div class="flex-1 min-h-0">
		{#if loading}
			<div class="h-full flex flex-col space-y-4">
				<Skeleton class="flex-1 w-full" />
				<div class="flex justify-between">
					<Skeleton class="h-4 w-24" />
					<Skeleton class="h-4 w-32" />
				</div>
			</div>
		{:else if error}
			<div class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
				<div class="text-4xl">⚠️</div>
				<p>Error: {error}</p>
				<button onclick={loadData} class="text-blue-400 hover:underline font-bold text-sm">Retry Connection</button>
			</div>
		{:else}
			<LineChart 
				labels={chartData.labels} 
				datasets={chartData.datasets}
				yAxisLog={true}
				dualAxis={true}
			/>
		{/if}
	</div>
</div>

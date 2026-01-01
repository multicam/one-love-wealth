<script lang="ts">
	import { fredProvider } from '$lib/data-providers';
	import { TimeUtils } from '@one-love-wealth/data-layer';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import type { DataPoint } from '$lib/db';

	async function searchFredSeries(query: string): Promise<any[]> {
		const url = `/api/proxy/fred/search?text=${encodeURIComponent(query)}`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`FRED Search Error: ${response.statusText}`);
			}
			const json = await response.json();
			return json.seriess || [];
		} catch (e) {
			console.warn('FRED Search failed:', e);
			return [];
		}
	}

	let query = $state('');
	let results = $state<any[]>([]);
	let loading = $state(false);
	let selectedSeries = $state<any>(null);
	let chartData = $state<DataPoint[]>([]);
	let chartLoading = $state(false);

	async function handleSearch() {
		if (!query.trim()) return;
		loading = true;
		results = [];
		try {
			results = await searchFredSeries(query);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function selectSeries(series: any) {
		selectedSeries = series;
		chartLoading = true;
		chartData = [];
		try {
			const result = await fredProvider.fetch({ type: 'fred', seriesId: series.id, id: series.id, name: series.title || series.id });
			chartData = result.series.data;
		} catch (e) {
			console.error(e);
		} finally {
			chartLoading = false;
		}
	}

	function exportCSV() {
		if (!chartData.length) return;
		const csvContent = "data:text/csv;charset=utf-8," 
			+ "Date,Value\n"
			+ chartData.map(e => `${TimeUtils.toISO(e).split('T')[0]},${e.value}`).join("\n");
		
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `${selectedSeries.id}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="vertical max-w-6xl mx-auto" style="--gap: 2rem;">
	<div class="horizontal items-center justify-between">
		<div class="vertical" style="--gap: 0.5rem;">
			<h1 class="text-3xl font-bold text-white">Data Explorer</h1>
			<p class="text-slate-400">Search and analyze 800,000+ economic series from FRED.</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
		<!-- Search Panel -->
		<div class="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
			<div class="p-4 border-b border-slate-800 bg-slate-900 z-10">
				<div class="relative">
					<input 
						type="text" 
						bind:value={query}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						placeholder="Search e.g. 'unemployment'..." 
						class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
					/>
					<span class="absolute left-3 top-3.5 text-slate-500">🔍</span>
				</div>
				<button 
					onclick={handleSearch}
					disabled={loading}
					class="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-2 rounded-lg transition-all"
				>
					{loading ? 'Searching...' : 'Search'}
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
				{#if results.length === 0 && !loading}
					<div class="text-center text-slate-500 mt-10 p-4">
						<p>No results found.</p>
						<p class="text-xs mt-2">Try searching for "GDP", "CPI", or "M2".</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each results as item}
							<button 
								class="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 group
								{selectedSeries?.id === item.id ? 'bg-slate-800 border-blue-500/50' : ''}"
								onclick={() => selectSeries(item)}
							>
								<div class="font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{item.title}</div>
								<div class="flex justify-between items-center mt-1">
									<code class="text-xs bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">{item.id}</code>
									<span class="text-xs text-slate-500">{item.frequency_short}</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Chart Panel -->
		<div class="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col relative overflow-hidden">
			{#if selectedSeries}
				<div class="flex justify-between items-start mb-6 z-10">
					<div>
						<h2 class="text-xl font-bold text-white pr-4">{selectedSeries.title}</h2>
						<div class="flex items-center space-x-4 mt-1 text-sm text-slate-400">
							<span>ID: <code class="text-slate-300">{selectedSeries.id}</code></span>
							<span>•</span>
							<span>Units: {selectedSeries.units}</span>
						</div>
					</div>
					<button 
						onclick={exportCSV}
						class="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-700"
					>
						<span>⬇️</span>
						<span>Export CSV</span>
					</button>
				</div>

				<div class="flex-1 min-h-0 relative">
					{#if chartLoading}
						<div class="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20 backdrop-blur-sm">
							<div class="text-slate-400 animate-pulse">Loading Data...</div>
						</div>
					{:else if chartData.length > 0}
						<LineChart 
							labels={chartData.map(d => TimeUtils.toISO(d).split('T')[0])}
							datasets={[{
								label: selectedSeries.title,
								data: chartData.map(d => d.value ?? null),
								borderColor: '#3b82f6',
								backgroundColor: 'rgba(59, 130, 246, 0.1)',
								fill: true,
								tension: 0.2,
								pointRadius: 0
							}]}
						/>
					{:else}
						<div class="h-full flex items-center justify-center text-slate-500">
							No data available for this series.
						</div>
					{/if}
				</div>
			{:else}
				<div class="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
					<div class="text-4xl">📊</div>
					<p>Select a series from the search results to visualize it.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

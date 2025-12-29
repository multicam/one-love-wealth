<script lang="ts">
	import { onMount } from 'svelte';
	import { fredProvider, coinGeckoProvider } from '$lib/data-providers';
	import { generateBtcForecast, type ForecastResult } from '$lib/logic/projections';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import { db, type DataPoint } from '$lib/db';

	let m2Data = $state<DataPoint[]>([]);
	let btcData = $state<DataPoint[]>([]);
	let loading = $state(true);
	
	let liquidityGrowth = $state(8); // 8% Default
	let horizon = $state(12); // 12 months
	let scenarioName = $state('My Macro Thesis');

	onMount(async () => {
		try {
			const m2Result = await fredProvider.fetch({ type: 'fred', seriesId: 'M2SL', id: 'M2SL', name: 'M2 Money Supply' });
			const btcResult = await coinGeckoProvider.fetch({ type: 'coingecko', coinId: 'bitcoin', id: 'bitcoin', name: 'Bitcoin' });
			m2Data = m2Result.series.data;
			btcData = btcResult.series.data;
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	let forecast = $derived.by(() => {
		if (!m2Data.length || !btcData.length) return [];
		return generateBtcForecast(m2Data, btcData, {
			liquidityGrowthYoY: liquidityGrowth / 100,
			horizonMonths: horizon
		});
	});

	let chartData = $derived.by(() => {
		if (!forecast.length) return { labels: [], datasets: [] };

		return {
			labels: forecast.map(f => f.date),
			datasets: [
				{
					label: 'Bull Case (+50%)',
					data: forecast.map(f => f.bull),
					borderColor: 'rgba(34, 197, 94, 0.4)',
					borderDash: [5, 5],
					pointRadius: 0,
					tension: 0.4
				},
				{
					label: 'Base Projection',
					data: forecast.map(f => f.base),
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					fill: true,
					tension: 0.4
				},
				{
					label: 'Bear Case (-30%)',
					data: forecast.map(f => f.bear),
					borderColor: 'rgba(239, 68, 68, 0.4)',
					borderDash: [5, 5],
					pointRadius: 0,
					tension: 0.4
				}
			]
		};
	});

	async function saveScenario() {
		try {
			await db.saveScenario({
				id: crypto.randomUUID(),
				name: scenarioName,
				createdAt: Date.now(),
				assumptions: {
					liquidityGrowth,
					gdpGrowth: 0, // Not used in simple model yet
					customMultipliers: {}
				},
				output: {
					btcTarget: forecast[forecast.length - 1].base,
					confidenceInterval: [forecast[forecast.length - 1].bear, forecast[forecast.length - 1].bull]
				}
			});
			alert('Scenario saved to Thesis Library!');
		} catch (e) {
			alert('Failed to save scenario');
		}
	}
</script>

<div class="space-y-8 max-w-6xl mx-auto">
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
		<!-- Sidebar Controls -->
		<aside class="space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-1">
			<h3 class="text-lg font-bold text-white mb-4">Assumptions</h3>
			
			<div>
				<label for="liquidity-growth" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
					Liquidity Growth (YoY %)
				</label>
				<input 
					id="liquidity-growth"
					type="range" min="-10" max="30" step="0.5" 
					bind:value={liquidityGrowth}
					class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
				/>
				<div class="flex justify-between mt-2 text-sm font-mono">
					<span class="text-slate-500">-10%</span>
					<span class="text-blue-400 font-bold">{liquidityGrowth}%</span>
					<span class="text-slate-500">30%</span>
				</div>
			</div>

			<div>
				<label for="horizon" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
					Horizon (Months)
				</label>
				<select 
					id="horizon"
					bind:value={horizon}
					class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value={6}>6 Months</option>
					<option value={12}>1 Year</option>
					<option value={24}>2 Years</option>
					<option value={48}>4 Years (Full Cycle)</option>
				</select>
			</div>

			<div class="pt-6 border-t border-slate-800">
				<label for="scenario-name" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
					Scenario Name
				</label>
				<input 
					id="scenario-name"
					type="text" 
					bind:value={scenarioName}
					class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none mb-4"
				/>
				<button 
					onclick={saveScenario}
					class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all shadow-lg active:scale-95"
				>
					Save Scenario
				</button>
			</div>
		</aside>

		<!-- Forecasting Chart -->
		<div class="lg:col-span-3 space-y-6">
			<div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl h-[500px] flex flex-col">
				<div class="flex justify-between items-start mb-6">
					<div>
						<h2 class="text-2xl font-bold text-white">BTC Price Projection</h2>
						<p class="text-sm text-slate-400">Based on historical M2 correlation & assumptions</p>
					</div>
					
					{#if forecast.length > 0}
						<div class="text-right">
							<div class="text-xs text-slate-500 uppercase">Projected Target</div>
							<div class="text-3xl font-mono font-bold text-blue-400">
								${Math.round(forecast[forecast.length - 1].base).toLocaleString()}
							</div>
						</div>
					{/if}
				</div>

				<div class="flex-1 min-h-0">
					{#if loading}
						<div class="h-full flex items-center justify-center text-slate-500 animate-pulse">
							Initializing Regression Engine...
						</div>
					{:else if forecast.length === 0}
						<div class="h-full flex items-center justify-center text-slate-600 italic text-center px-12">
							Waiting for enough historical data to generate correlation model...
						</div>
					{:else}
						<LineChart 
							labels={chartData.labels} 
							datasets={chartData.datasets}
							yAxisLog={true}
						/>
					{/if}
				</div>
			</div>

			<!-- Insight Box -->
			<div class="bg-blue-900/10 border border-blue-800/30 p-6 rounded-2xl">
				<h4 class="text-blue-300 font-bold mb-2 flex items-center">
					<span class="mr-2">💡</span> Macro Insight
				</h4>
				<p class="text-sm text-blue-100/70 leading-relaxed">
					This model assumes that the historical relationship between global liquidity expansion 
					and Bitcoin adoption remains intact. By projecting M2 at a <strong>{liquidityGrowth}%</strong> 
					YoY rate, the regression model suggests a base target of 
					<strong>${forecast[forecast.length - 1]?.base.toLocaleString() || '---'}</strong> 
					by <strong>{forecast[forecast.length - 1]?.date || '---'}</strong>.
				</p>
			</div>
		</div>
	</div>
</div>

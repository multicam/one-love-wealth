<script lang="ts">
	import LiquidityCard from '$lib/components/dashboard/LiquidityCard.svelte';
	import CycleIndicator from '$lib/components/dashboard/CycleIndicator.svelte';
	import DebtCard from '$lib/components/dashboard/DebtCard.svelte';
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white mb-2">Macro Dashboard</h1>
			<p class="text-slate-400 max-w-2xl">
				Monitor global liquidity flows and business cycle metrics to identify high-probability 
				market regimes.
			</p>
		</div>
		<div class="text-right hidden md:block">
			<div class="text-sm text-slate-500">Last Updated</div>
			<div class="font-mono text-slate-300">{new Date().toLocaleDateString()}</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Main Liquidity Chart (Spans 2 cols) -->
		<div class="lg:col-span-2">
			<LiquidityCard />
		</div>

		<!-- Cycle Indicators & Metrics -->
		<div class="space-y-8">
			<CycleIndicator />
			<DebtCard />
		</div>
	</div>
</div>
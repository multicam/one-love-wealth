<script lang="ts">
	import { ENHANCED_GRAPHS_LIST } from '$lib/logic/graphs-config-enhanced';
	import EnhancedGraphRow from '$lib/components/graphs/EnhancedGraphRow.svelte';
	import { favorites } from '$lib/stores/favorites';
	import { LazyLoad } from '@one-love-wealth/shared-ui';

	let showOnlyFavorites = $state(false);

	let filteredGraphs = $derived(
		showOnlyFavorites
			? ENHANCED_GRAPHS_LIST.filter(graph => $favorites.includes(graph.id))
			: ENHANCED_GRAPHS_LIST
	);

	let favoritesCount = $derived($favorites.length);
</script>

<div class="max-w-7xl mx-auto vertical" style="--gap: 2rem;">
	<div class="horizontal items-center justify-between flex-wrap gap-4">
		<div class="vertical flex-1 min-w-64" style="--gap: 0.5rem;">
			<h1 class="text-3xl font-bold text-white">Macro Graphs</h1>
			<p class="text-slate-400">
				A comprehensive collection of {ENHANCED_GRAPHS_LIST.length} key macroeconomic charts and correlations
				powered by 7 data providers (FRED, CoinGecko, Yahoo Finance, World Bank, BLS, Treasury, Hyperliquid).
			</p>
		</div>

		<div class="horizontal items-center gap-3">
			{#if favoritesCount > 0}
				<button
					onclick={() => showOnlyFavorites = !showOnlyFavorites}
					class="filter-button"
					class:active={showOnlyFavorites}
					title={showOnlyFavorites ? 'Show all graphs' : 'Show only favorites'}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							fill-rule="evenodd"
							d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="font-medium">
						{#if showOnlyFavorites}
							All Graphs
						{:else}
							Favorites ({favoritesCount})
						{/if}
					</span>
				</button>
			{/if}
		</div>
	</div>

	{#if showOnlyFavorites && filteredGraphs.length === 0}
		<div class="text-center py-16">
			<div class="text-slate-400 space-y-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-16 h-16 mx-auto mb-4 opacity-30"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
					/>
				</svg>
				<p class="text-lg font-medium">No favorites yet</p>
				<p class="text-sm">Click the star icon on any graph to add it to your favorites</p>
			</div>
		</div>
	{:else}
		<div class="vertical" style="--gap: 2rem;">
			{#each filteredGraphs as graph (graph.id)}
				<LazyLoad class="min-h-[300px]">
					<EnhancedGraphRow {graph} />
				</LazyLoad>
			{/each}
		</div>
	{/if}

    <div class="text-center p-8 text-slate-500 text-sm">
        <p>Enhanced with server-side YoY calculations, client-side transforms, and advanced time alignment.</p>
    </div>
</div>

<style>
	.filter-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background-color: #1e293b; /* slate-800 */
		color: #94a3b8; /* slate-400 */
		border: 1px solid #334155; /* slate-700 */
		border-radius: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-button:hover {
		background-color: #334155; /* slate-700 */
		color: #cbd5e1; /* slate-300 */
		border-color: #475569; /* slate-600 */
	}

	.filter-button.active {
		background-color: rgba(251, 191, 36, 0.1); /* amber-400 with opacity */
		color: #fbbf24; /* amber-400 */
		border-color: #fbbf24;
	}

	.filter-button.active:hover {
		background-color: rgba(251, 191, 36, 0.15);
		color: #fcd34d; /* amber-300 */
		border-color: #fcd34d;
	}
</style>

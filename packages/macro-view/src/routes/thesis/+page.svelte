<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	const theses = [
		{ id: 'pal', title: 'The Everything Code', author: 'Raoul Pal', icon: '🌎' },
		{ id: 'alden', title: 'Fiscal Dominance', author: 'Lyn Alden', icon: '🏗️' },
		{ id: 'morales', title: 'The Liquidity Pulse', author: 'Isaiah Morales', icon: '🧠' }
	];

	let selectedId = $state(theses[0].id);
	let content = $state('');
	let loading = $state(false);

	async function loadThesis(id: string) {
		selectedId = id;
		loading = true;
		try {
			// In a real SvelteKit app, you'd use a dynamic import or a dedicated endpoint
			// For this MVP, we fetch the static asset
			const res = await fetch(`/content/${id}.md`);
			const text = await res.text();
			content = await marked.parse(text);
		} catch (e) {
			content = '<p class="text-red-400">Failed to load thesis content.</p>';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadThesis(selectedId);
	});
</script>

<div class="max-w-6xl mx-auto space-y-8">
	<div class="flex flex-col md:flex-row gap-8 min-h-[600px]">
		<!-- Selection Sidebar -->
		<aside class="w-full md:w-72 space-y-4">
			<h2 class="text-xl font-bold text-white px-2 mb-4">Core Theses</h2>
			<nav class="space-y-2">
				{#each theses as t}
					<button 
						onclick={() => loadThesis(t.id)}
						class="w-full text-left p-4 rounded-xl border transition-all group
						{selectedId === t.id ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}"
					>
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{t.icon}</span>
							<div>
								<div class="font-bold {selectedId === t.id ? 'text-white' : 'text-slate-200 group-hover:text-blue-400'}">{t.title}</div>
								<div class="text-xs {selectedId === t.id ? 'text-blue-100' : 'text-slate-500'}">{t.author}</div>
							</div>
						</div>
					</button>
				{/each}
			</nav>

			<div class="p-6 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed mt-8">
				<h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Community</h4>
				<p class="text-xs text-slate-400 leading-relaxed">
					Have a thesis to add? Submit a PR to the GitHub repository with your analysis.
				</p>
			</div>
		</aside>

		<!-- Content Area -->
		<main class="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
			<div class="h-1.5 bg-blue-600 w-full"></div>
			<div class="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1">
				{#if loading}
					<div class="space-y-4 animate-pulse">
						<div class="h-8 bg-slate-800 rounded w-3/4"></div>
						<div class="h-4 bg-slate-800 rounded w-1/2"></div>
						<div class="space-y-2 pt-8">
							<div class="h-4 bg-slate-800 rounded w-full"></div>
							<div class="h-4 bg-slate-800 rounded w-full"></div>
							<div class="h-4 bg-slate-800 rounded w-5/6"></div>
						</div>
					</div>
				{:else}
					<article class="prose prose-invert prose-blue max-w-none 
						prose-headings:text-white prose-a:text-blue-400 prose-strong:text-blue-200">
						{@html content}
					</article>
				{/if}
			</div>
		</main>
	</div>
</div>

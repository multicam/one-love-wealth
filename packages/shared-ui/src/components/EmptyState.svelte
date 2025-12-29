<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: string;
		action?: Snippet;
		class?: string;
	}

	let {
		title = 'No data',
		description = 'There is nothing to display yet.',
		icon = '📭',
		action,
		class: className = ''
	}: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-8 text-center min-h-[200px] {className}">
	<div class="text-5xl mb-4 opacity-80">{icon}</div>
	<h3 class="text-xl font-semibold text-slate-100 m-0 mb-2">{title}</h3>
	<p class="text-sm text-slate-400 m-0 max-w-[300px] leading-relaxed">{description}</p>
	{#if action}
		<div class="mt-6">
			{@render action()}
		</div>
	{/if}
</div>

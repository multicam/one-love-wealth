<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		children: import('svelte').Snippet;
		class?: string;
		noPadding?: boolean;
	}

	let { children, class: className, noPadding = false }: Props = $props();
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<main class={cn('flex-1', noPadding ? '' : 'p-8', className)}>
		{@render children()}
	</main>
</div>

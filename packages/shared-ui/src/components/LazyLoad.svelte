<script lang="ts">
	import { intersectionObserver } from '@splendidlabz/utils/dom';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		placeholder?: Snippet;
		rootMargin?: string;
		threshold?: number;
		class?: string;
	}

	let {
		children,
		placeholder,
		rootMargin = '100px',
		threshold = 0.1,
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let isVisible = $state(false);
	let observer: ReturnType<typeof intersectionObserver> | null = null;

	$effect(() => {
		if (container && !isVisible) {
			observer = intersectionObserver(container, {
				rootMargin,
				threshold,
				callback: ({ entry }: { entry: IntersectionObserverEntry }) => {
					if (entry.isIntersecting) {
						isVisible = true;
						observer?.destroy();
						observer = null;
					}
				}
			});
		}

		return () => {
			observer?.destroy();
			observer = null;
		};
	});
</script>

<div bind:this={container} class={className}>
	{#if isVisible}
		{@render children()}
	{:else if placeholder}
		{@render placeholder()}
	{:else}
		<div class="animate-pulse bg-slate-800 rounded-lg min-h-[200px]"></div>
	{/if}
</div>

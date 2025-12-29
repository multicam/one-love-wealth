<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		fallback?: Snippet<[Error]>;
		onError?: (error: Error) => void;
	}

	let { children, fallback, onError }: Props = $props();

	let error = $state<Error | null>(null);

	function handleError(e: Error) {
		error = e;
		onError?.(e);
	}

	function reset() {
		error = null;
	}

	$effect(() => {
		const handler = (event: ErrorEvent) => {
			handleError(event.error);
		};
		window.addEventListener('error', handler);
		return () => window.removeEventListener('error', handler);
	});
</script>

{#if error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<div class="flex flex-col items-center justify-center p-8 text-center min-h-[200px] bg-red-900/20 border border-red-500/30 rounded-xl">
			<div class="text-4xl mb-4">⚠️</div>
			<h3 class="text-lg font-semibold text-red-300 m-0 mb-2">Something went wrong</h3>
			<p class="text-sm text-red-400/80 m-0 mb-4 max-w-md">{error.message}</p>
			<button
				class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
				onclick={reset}
			>
				Try Again
			</button>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}

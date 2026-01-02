<script lang="ts">
	import { AlertTriangle, RefreshCw } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		fallback?: Snippet<[Error]>;
		name?: string;
	}

	let { children, fallback, name = 'Component' }: Props = $props();

	let error = $state<Error | null>(null);
	let hasError = $derived(error !== null);

	function reset() {
		error = null;
	}

	// Window error handler
	function handleError(event: ErrorEvent) {
		// Only capture errors in this component's context
		// This is a simplified error boundary for Svelte
		if (event.error) {
			error = event.error;
			event.preventDefault();
		}
	}

	// Unhandled rejection handler
	function handleRejection(event: PromiseRejectionEvent) {
		error = new Error(event.reason?.toString() || 'Unhandled promise rejection');
		event.preventDefault();
	}
</script>

<svelte:window onerror={handleError} onunhandledrejection={handleRejection} />

{#if hasError && error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<div class="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
			<div class="flex items-start gap-3">
				<div class="text-red-500">
					<AlertTriangle size={24} />
				</div>
				<div class="flex-1 space-y-2">
					<h3 class="font-semibold text-text-primary">Error in {name}</h3>
					<p class="text-sm text-text-secondary">
						{error.message || 'An unexpected error occurred'}
					</p>
					{#if error.stack}
						<details class="text-xs text-text-secondary">
							<summary class="cursor-pointer hover:text-text-primary">Stack trace</summary>
							<pre class="mt-2 p-2 bg-surface/50 rounded overflow-x-auto">{error.stack}</pre>
						</details>
					{/if}
					<button
						type="button"
						onclick={reset}
						class="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-3"
					>
						<RefreshCw size={14} />
						Try Again
					</button>
				</div>
			</div>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}

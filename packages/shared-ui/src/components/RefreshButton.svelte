<script lang="ts">
	interface Props {
		onRefresh: () => Promise<unknown>;
		label?: string;
		labelRefreshing?: string;
		class?: string;
	}

	let { 
		onRefresh, 
		label = 'Refresh', 
		labelRefreshing = 'Refreshing...',
		class: className = ''
	}: Props = $props();
	let isRefreshing = $state(false);

	async function handleRefresh() {
		if (isRefreshing) return;
		isRefreshing = true;
		try {
			await onRefresh();
		} finally {
			isRefreshing = false;
		}
	}
</script>

<button
	class="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded border-none transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 {className}"
	onclick={handleRefresh}
	disabled={isRefreshing}
	title="Refresh data"
>
	<span class="text-base {isRefreshing ? 'animate-spin' : ''}">↻</span>
	{isRefreshing ? labelRefreshing : label}
</button>

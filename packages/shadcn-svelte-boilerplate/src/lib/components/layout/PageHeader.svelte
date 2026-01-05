<script lang="ts">
	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="mb-8">
	<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
	{#if description}
		<p class="text-muted-foreground mt-2">{description}</p>
	{/if}
</div>

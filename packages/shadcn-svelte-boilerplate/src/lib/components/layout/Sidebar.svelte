<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { sidebarNavItems, APP_NAME } from '$lib/config/navigation';
</script>

<aside class="hidden lg:flex w-64 flex-col border-r bg-muted/40 p-4">
	<div class="mb-8">
		<a href="/" class="text-xl font-bold">{APP_NAME}</a>
	</div>

	<nav class="flex-1 space-y-1">
		{#each sidebarNavItems as item}
			{@const isActive = $page.url.pathname === item.href}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
					isActive
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
			>
				{#if item.icon}
					<svelte:component this={item.icon} class="h-4 w-4" />
				{/if}
				{item.label}
			</a>
		{/each}
	</nav>
</aside>

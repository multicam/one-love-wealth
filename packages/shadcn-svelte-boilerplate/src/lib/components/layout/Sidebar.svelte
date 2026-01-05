<script lang="ts">
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import { cn } from '$lib/utils';
	import { sidebarNavItems, isNavItemActive, ChevronDown, APP_NAME } from '$lib/config/navigation';

	let expandedSections = $state<Set<string>>(new Set());

	function toggleSection(label: string) {
		const newSet = new Set(expandedSections);
		if (newSet.has(label)) {
			newSet.delete(label);
		} else {
			newSet.add(label);
		}
		expandedSections = newSet;
	}

	// Auto-expand sections that contain the active page
	$effect(() => {
		const pathname = $page.url.pathname;
		const sectionsToExpand: string[] = [];
		sidebarNavItems.forEach((item) => {
			if (item.children && isNavItemActive(item, pathname)) {
				sectionsToExpand.push(item.label);
			}
		});
		if (sectionsToExpand.length > 0) {
			untrack(() => {
				expandedSections = new Set([...expandedSections, ...sectionsToExpand]);
			});
		}
	});
</script>

<aside class="hidden lg:flex w-64 flex-col border-r bg-muted/40 p-4">
	<div class="mb-8">
		<a href="/" class="text-xl font-bold">{APP_NAME}</a>
	</div>

	<nav class="flex-1 space-y-1">
		{#each sidebarNavItems as item}
			{#if item.children}
				{@const isExpanded = expandedSections.has(item.label)}
				{@const hasActiveChild = isNavItemActive(item, $page.url.pathname)}
				<div>
					<button
						onclick={() => toggleSection(item.label)}
						class={cn(
							'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
							hasActiveChild
								? 'text-foreground font-medium'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'
						)}
					>
						<span class="flex items-center gap-3">
							{#if item.icon}
								{@const Icon = item.icon}
								<Icon class="h-4 w-4" />
							{/if}
							{item.label}
						</span>
						<ChevronDown
							class={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
						/>
					</button>
					{#if isExpanded}
						<div class="ml-4 mt-1 space-y-1 border-l pl-3">
							{#each item.children as child}
								{@const isActive = $page.url.pathname === child.href}
								<a
									href={child.href}
									class={cn(
										'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
										isActive
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									{#if child.icon}
										{@const ChildIcon = child.icon}
										<ChildIcon class="h-4 w-4" />
									{/if}
									{child.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
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
						{@const Icon = item.icon}
						<Icon class="h-4 w-4" />
					{/if}
					{item.label}
				</a>
			{/if}
		{/each}
	</nav>
</aside>

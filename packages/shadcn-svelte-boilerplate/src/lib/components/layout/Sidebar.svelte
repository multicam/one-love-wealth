<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { LayoutDashboard, Users, Settings, FileText, User, CreditCard, BarChart3, Calendar, Inbox, ShoppingCart, Package } from 'lucide-svelte';

	const sidebarItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/analytics', label: 'Analytics', icon: BarChart3 },
		{ href: '/calendar', label: 'Calendar', icon: Calendar },
		{ href: '/inbox', label: 'Inbox', icon: Inbox },
		{ href: '/orders', label: 'Orders', icon: ShoppingCart },
		{ href: '/products', label: 'Products', icon: Package },
		{ href: '/users', label: 'Users', icon: Users },
		{ href: '/forms', label: 'Forms', icon: FileText },
		{ href: '/profile', label: 'Profile', icon: User },
		{ href: '/pricing', label: 'Pricing', icon: CreditCard },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];
</script>

<aside class="hidden lg:flex w-64 flex-col border-r bg-muted/40 p-4">
	<div class="mb-8">
		<a href="/" class="text-xl font-bold">MyApp</a>
	</div>

	<nav class="flex-1 space-y-1">
		{#each sidebarItems as item}
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
				<item.icon class="h-4 w-4" />
				{item.label}
			</a>
		{/each}
	</nav>
</aside>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu, Moon, Sun } from 'lucide-svelte';
	import { toggleMode, mode } from 'mode-watcher';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/analytics', label: 'Analytics' },
		{ href: '/calendar', label: 'Calendar' },
		{ href: '/inbox', label: 'Inbox' },
		{ href: '/orders', label: 'Orders' },
		{ href: '/products', label: 'Products' },
		{ href: '/users', label: 'Users' },
		{ href: '/forms', label: 'Forms' },
		{ href: '/profile', label: 'Profile' },
		{ href: '/settings', label: 'Settings' },
		{ href: '/pricing', label: 'Pricing' }
	];
</script>

<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container flex h-16 items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="text-xl font-bold">MyApp</a>
			<nav class="hidden md:flex gap-6">
				{#each navItems as item}
					<a href={item.href} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" onclick={toggleMode}>
				{#if mode.current === 'dark'}
					<Sun class="h-5 w-5" />
				{:else}
					<Moon class="h-5 w-5" />
				{/if}
			</Button>

			<div class="hidden md:flex gap-2">
				<Button variant="ghost" href="/auth/login">Login</Button>
				<Button href="/auth/register">Get Started</Button>
			</div>

			<Sheet.Root>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="md:hidden">
							<Menu class="h-5 w-5" />
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="right">
					<Sheet.Header>
						<Sheet.Title>Menu</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col gap-4 mt-4">
						{#each navItems as item}
							<a href={item.href} class="text-lg">{item.label}</a>
						{/each}
						<hr class="my-2" />
						<Button variant="outline" href="/auth/login" class="w-full">Login</Button>
						<Button href="/auth/register" class="w-full">Get Started</Button>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>

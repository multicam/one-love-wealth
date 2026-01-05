<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Menu, Moon, Sun } from '@lucide/svelte';
	import { toggleMode, mode } from 'mode-watcher';
	import { mainNavItems, flattenNavItems, ChevronDown, APP_NAME } from '$lib/config/navigation';

	const mobileNavItems = flattenNavItems(mainNavItems);
</script>

<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container flex h-16 items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="text-xl font-bold">{APP_NAME}</a>
			<nav class="hidden md:flex gap-1">
				{#each mainNavItems as item}
					{#if item.children}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										class="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
									>
										{item.label}
										<ChevronDown class="h-4 w-4" />
									</button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								{#each item.children as child}
									<DropdownMenu.Item>
										<a href={child.href} class="flex items-center gap-2 w-full">
											{#if child.icon}
												{@const Icon = child.icon}
												<Icon class="h-4 w-4" />
											{/if}
											{child.label}
										</a>
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<a
							href={item.href}
							class="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
						>
							{item.label}
						</a>
					{/if}
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
						{#each mobileNavItems as item}
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

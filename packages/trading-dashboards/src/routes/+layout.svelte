<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import '$lib/styles/global.css';
	import { Toast } from '@one-love-wealth/shared-ui';

	let { children } = $props();
	const currentPath = $derived($page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<header class="main-header">
		<div class="header-content">
			<h1 class="logo">Trading Dashboards</h1>
			<nav class="main-nav">
				<a href="/" class:active={currentPath === '/'}>
					Home
				</a>
				<a href="/orderbook" class:active={currentPath.startsWith('/orderbook')}>
					Order Book
				</a>
				<a href="/macro" class:active={currentPath === '/macro'}>
					Macro Cards
				</a>
				<a href="/macro_full" class:active={currentPath === '/macro_full'}>
					Macro Full
				</a>
			</nav>
		</div>
	</header>

	<main class="main-content">
		{@render children()}
	</main>

	<Toast position="bottom-right" />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-header {
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-md) var(--spacing-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.main-nav {
		display: flex;
		gap: var(--spacing-sm);
	}

	.main-nav a {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.main-nav a:hover {
		color: var(--text-primary);
		background: rgba(59, 130, 246, 0.1);
	}

	.main-nav a.active {
		color: white;
		background: var(--accent-primary);
	}

	.main-content {
		flex: 1;
		width: 100%;
	}
</style>

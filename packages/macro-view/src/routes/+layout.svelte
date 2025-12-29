<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Toast from '$lib/components/common/Toast.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores/settingsStore';
	import './layout.css';

	let { children } = $props();
	let isSidebarOpen = $state(false);

	onMount(() => {
		settings.load();
	});

	const getTitle = (path: string) => {
		switch (path) {
			case '/explorer': return 'Data Explorer';
			case '/graphs': return 'Graphs List';
			case '/forecasting': return 'Scenario Forecasting';
			case '/thesis': return 'Thesis Library';
			case '/settings': return 'Settings';
			default: return 'Global Macro Dashboard';
		}
	};
</script>

<div class="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
	<!-- Sidebar Overlay -->
	{#if isSidebarOpen}
		<button 
			class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
			aria-label="Close sidebar"
			onclick={() => isSidebarOpen = false}
		></button>
	{/if}

	<!-- Sidebar -->
	<div class="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
		{isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
		<Sidebar onNavigate={() => isSidebarOpen = false} />
	</div>

	<div class="flex-1 flex flex-col overflow-hidden">
		<Header 
			title={getTitle($page.url.pathname)} 
			onMenuClick={() => isSidebarOpen = !isSidebarOpen} 
		/>

		<main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
			<div class="mx-auto">
				{@render children()}
			</div>
		</main>
	</div>

	<Toast />
</div>

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 6px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: #020617;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #1e293b;
		border-radius: 10px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #334155;
	}
</style>

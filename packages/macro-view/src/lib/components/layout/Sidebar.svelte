<script lang="ts">
	import { page } from '$app/state';

	let { onNavigate = () => {} } = $props();

	const navItems = [
		{ name: 'Dashboard', path: '/', icon: '📊' },
		{ name: 'Data Explorer', path: '/explorer', icon: '🔍' },
		{ name: 'Graphs List', path: '/graphs', icon: '📉' },
		{ name: 'Forecasting', path: '/forecasting', icon: '📈' },
		{ name: 'API Tester', path: '/api-tester', icon: '🧪' },
		{ name: 'Thesis Library', path: '/thesis', icon: '📚' },
		{ name: 'Settings', path: '/settings', icon: '⚙️' }
	];
</script>

<aside class="w-64 bg-slate-950 text-white h-full flex flex-col border-r border-slate-900/50">


	<nav class="flex-1 px-4 py-4 space-y-2">
		{#each navItems as item}
			<a
				href={item.path}
				onclick={onNavigate}
				class="flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all group
          {page.url.pathname === item.path
					? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
					: 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}"
			>
				<span class="mr-3 text-lg filter {page.url.pathname === item.path ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all">{item.icon}</span>
				{item.name}
			</a>
		{/each}
	</nav>

	<div class="p-6">
		<div class="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
			<div class="flex items-center space-x-3 mb-2">
				<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
				<span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Live</span>
			</div>
			<div class="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Latency: 12ms</div>
		</div>
	</div>
</aside>
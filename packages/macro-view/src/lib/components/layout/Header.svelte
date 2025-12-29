<script lang="ts">
	let { title = 'Dashboard', onMenuClick } = $props();
</script>

<header class="h-16 bg-slate-950/50 backdrop-blur-xl border-b border-slate-900/50 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
	<div class="flex items-center">
		<button 
			class="px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity"
			onclick={onMenuClick}
			aria-label="Toggle sidebar"
		>
			<h1 class="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">MACROVIEW</h1>
		</button>

		<h2 class="text-lg md:text-xl font-black text-slate-100 uppercase tracking-tight">{title}</h2>
	</div>

	<div class="flex items-center space-x-2 md:space-x-4">
		<button class="p-2 text-slate-500 hover:text-blue-400 transition-colors">
			<span class="sr-only">Notifications</span>
			<span class="text-lg">🔔</span>
		</button>
		<div class="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 border border-blue-500/50 flex items-center justify-center text-xs md:text-sm font-black text-white shadow-lg shadow-blue-900/20">
			JM
		</div>
	</div>
</header>
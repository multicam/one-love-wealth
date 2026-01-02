<script lang="ts">
	import { Settings } from 'lucide-svelte';

	interface Props {
		activeTab?: 'backtest' | 'optimize' | 'walkforward';
		navigationDisabled?: boolean;
		onSettingsClick?: () => void;
	}

	let { 
		activeTab = 'backtest', 
		navigationDisabled = false,
		onSettingsClick 
	}: Props = $props();
</script>

<header class="h-16 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-6 flex-shrink-0">
	<!-- Logo/Title -->
	<div class="flex items-center gap-3">
		<div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
			<svg
				class="w-6 h-6 text-blue-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				/>
			</svg>
		</div>
		<div>
			<h1 class="text-lg font-semibold text-white">Backtesting UI</h1>
			<p class="text-xs text-gray-400">Strategy Analysis & Optimization</p>
		</div>
	</div>

	<!-- Mode Tabs -->
	<nav class="flex gap-1 bg-gray-900 rounded-lg p-1">
		<button
			type="button"
			class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
			class:bg-blue-500={activeTab === 'backtest'}
			class:text-white={activeTab === 'backtest'}
			class:text-gray-500={activeTab !== 'backtest' || navigationDisabled}
			class:cursor-not-allowed={navigationDisabled}
			disabled={navigationDisabled}
		>
			Backtest
		</button>
		<button
			type="button"
			class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
			class:bg-blue-500={activeTab === 'optimize'}
			class:text-white={activeTab === 'optimize'}
			class:text-gray-500={activeTab !== 'optimize' || navigationDisabled}
			class:cursor-not-allowed={navigationDisabled}
			disabled={navigationDisabled}
		>
			Optimize
		</button>
		<button
			type="button"
			class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
			class:bg-blue-500={activeTab === 'walkforward'}
			class:text-white={activeTab === 'walkforward'}
			class:text-gray-500={activeTab !== 'walkforward' || navigationDisabled}
			class:cursor-not-allowed={navigationDisabled}
			disabled={navigationDisabled}
		>
			Walk-Forward
		</button>
	</nav>

	<!-- Right Section: Settings -->
	<div class="flex items-center gap-4">
		<button
			type="button"
			class="w-10 h-10 rounded-lg hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
			title="Settings"
			onclick={onSettingsClick}
		>
			<Settings size={20} />
		</button>
	</div>
</header>

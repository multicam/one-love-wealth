<script lang="ts">
	import { settings } from '$lib/stores/settingsStore';
	import { onMount } from 'svelte';

	// Future settings logic can go here
</script>

<div class="max-w-2xl mx-auto space-y-8">
	<section class="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
		<h3 class="text-xl font-bold mb-6 flex items-center">
			<span class="mr-3">⚙️</span>
			Application Settings
		</h3>

		<p class="text-slate-400">
			Global configuration is managed via environment variables. 
			Specific user preferences will appear here in future updates.
		</p>
	</section>

	<section class="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 border-dashed">
		<h3 class="text-lg font-bold mb-4 text-slate-400">Application Info</h3>
		<div class="grid grid-cols-2 gap-4 text-sm">
			<div class="text-slate-500">Version</div>
			<div>1.0.0-alpha</div>
			<div class="text-slate-500">License</div>
			<div>MIT / Open Source</div>
			<div class="text-slate-500">Environment</div>
			<div class="flex items-center">
				<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
				Client-side (IndexedDB)
			</div>
		</div>
	</section>
</div>
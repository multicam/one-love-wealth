<script lang="ts" module>
	import { writable } from 'svelte/store';

	export interface Toast {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info';
	}

	export const toasts = writable<Toast[]>([]);

	export function addToast(message: string, type: Toast['type'] = 'info') {
		const id = crypto.randomUUID();
		toasts.update(all => [...all, { id, message, type }]);
		setTimeout(() => {
			removeToast(id);
		}, 5000);
	}

	function removeToast(id: string) {
		toasts.update(all => all.filter(t => t.id !== id));
	}
</script>

<script lang="ts">
	import { fade, fly } from 'svelte/transition';
</script>

<div class="fixed bottom-8 right-8 z-[100] space-y-3 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div 
			in:fly={{ y: 20, duration: 300 }}
			out:fade
			class="pointer-events-auto flex items-center px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[300px]
			{toast.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-200' : 
			 toast.type === 'success' ? 'bg-green-950/80 border-green-800 text-green-200' : 
			 'bg-blue-950/80 border-blue-800 text-blue-200'}"
		>
			<span class="mr-3 text-xl">
				{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}
			</span>
			<div class="font-bold text-sm tracking-tight">{toast.message}</div>
			<button 
				onclick={() => removeToast(toast.id)}
				class="ml-auto pl-4 text-white/30 hover:text-white transition-colors"
			>
				✕
			</button>
		</div>
	{/each}
</div>

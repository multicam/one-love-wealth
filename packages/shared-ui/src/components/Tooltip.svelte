<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		class?: string;
	}

	let {
		children,
		text,
		position = 'top',
		delay = 300,
		class: className = ''
	}: Props = $props();

	let visible = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	function showTooltip() {
		timeoutId = setTimeout(() => {
			visible = true;
		}, delay);
	}

	function hideTooltip() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		visible = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && visible) {
			hideTooltip();
		}
	}

	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});

	const positionClasses: Record<string, string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};

	const arrowClasses: Record<string, string> = {
		top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0',
		bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0',
		left: '-right-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0',
		right: '-left-1 top-1/2 -translate-y-1/2 border-r-0 border-t-0'
	};
</script>

<div
	class="relative inline-flex {className}"
	role="presentation"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocusin={showTooltip}
	onfocusout={hideTooltip}
	onkeydown={handleKeydown}
>
	{@render children()}
	{#if visible && text}
		<div 
			class="absolute z-[1000] px-2 py-1 bg-slate-800 text-slate-200 text-xs font-medium rounded shadow-md border border-slate-700 whitespace-nowrap pointer-events-none animate-[fadeIn_0.15s_ease] {positionClasses[position]}" 
			role="tooltip"
		>
			{text}
			<div class="absolute w-2 h-2 bg-slate-800 border border-slate-700 rotate-45 {arrowClasses[position]}"></div>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>

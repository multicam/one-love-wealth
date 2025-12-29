<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		variant?: 'default' | 'elevated' | 'outlined';
		hover?: boolean;
		onclick?: () => void;
	}

	let {
		children,
		class: className = '',
		padding = 'md',
		variant = 'default',
		hover = false,
		onclick
	}: Props = $props();

	const paddingClasses: Record<string, string> = {
		none: 'p-0',
		sm: 'p-2',
		md: 'p-4',
		lg: 'p-6',
		xl: 'p-8'
	};

	const variantClasses: Record<string, string> = {
		default: 'bg-slate-800 border border-slate-700',
		elevated: 'bg-slate-800 shadow-lg shadow-black/20',
		outlined: 'bg-transparent border border-slate-700'
	};

	const hoverClasses = $derived(
		hover || onclick 
			? 'hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all' 
			: ''
	);

	const clickableClasses = $derived(onclick ? 'cursor-pointer active:translate-y-0' : '');
</script>

{#if onclick}
	<button
		class="rounded-xl w-full text-left font-inherit text-inherit border-none {paddingClasses[padding]} {variantClasses[variant]} {hoverClasses} {clickableClasses} {className}"
		{onclick}
		type="button"
	>
		{@render children()}
	</button>
{:else}
	<div
		class="rounded-xl w-full {paddingClasses[padding]} {variantClasses[variant]} {hoverClasses} {className}"
	>
		{@render children()}
	</div>
{/if}

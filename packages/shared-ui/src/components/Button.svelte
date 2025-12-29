<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		children,
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		class: className = '',
		onclick
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);

	const sizeClasses: Record<string, string> = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-4 text-base'
	};

	const variantClasses: Record<string, string> = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 active:translate-y-0',
		secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 hover:border-blue-500 hover:-translate-y-0.5 active:translate-y-0',
		ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-100',
		danger: 'bg-red-600 hover:bg-red-700 text-white hover:-translate-y-0.5 active:translate-y-0'
	};
</script>

<button
	class="inline-flex items-center justify-center gap-1 font-medium rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 {sizeClasses[size]} {variantClasses[variant]} {className}"
	{type}
	disabled={isDisabled}
	{onclick}
>
	{#if loading}
		<span class="animate-spin">↻</span>
	{/if}
	<span class:invisible={loading}>
		{@render children()}
	</span>
</button>

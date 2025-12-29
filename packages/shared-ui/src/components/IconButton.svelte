<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		label: string;
		variant?: 'default' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		children,
		label,
		variant = 'default',
		size = 'md',
		disabled = false,
		class: className = '',
		onclick
	}: Props = $props();

	const sizeClasses: Record<string, string> = {
		sm: 'w-7 h-7 text-sm',
		md: 'w-9 h-9 text-base',
		lg: 'w-11 h-11 text-lg'
	};

	const variantClasses: Record<string, string> = {
		default: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600',
		ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-100',
		danger: 'bg-transparent hover:bg-red-600/20 text-red-400 hover:text-red-300'
	};
</script>

<button
	class="inline-flex items-center justify-center rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed {sizeClasses[size]} {variantClasses[variant]} {className}"
	type="button"
	{disabled}
	{onclick}
	aria-label={label}
	title={label}
>
	{@render children()}
</button>

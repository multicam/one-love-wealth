<script lang="ts">
	interface Props {
		class?: string;
		width?: string;
		height?: string;
		rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
		animate?: boolean;
	}

	let {
		class: className = '',
		width,
		height,
		rounded = 'md',
		animate = true
	}: Props = $props();

	const roundedClasses: Record<string, string> = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		full: 'rounded-full'
	};
</script>

<div
	class="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] min-h-4 {roundedClasses[rounded]} {animate ? 'animate-[shimmer_1.5s_ease-in-out_infinite]' : ''} {className}"
	style:width={width}
	style:height={height}
></div>

<style>
	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>

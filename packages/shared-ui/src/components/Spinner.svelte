<script lang="ts">
	interface Props {
		size?: number | string;
		color?: string;
		strokeWidth?: number;
		class?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 3,
		class: className = ''
	}: Props = $props();

	const sizeValue = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg
	width={sizeValue}
	height={sizeValue}
	viewBox="0 0 24 24"
	class="animate-spin {className}"
	role="status"
	aria-label="Loading"
>
	<circle
		cx="12"
		cy="12"
		r="10"
		stroke={color}
		stroke-width={strokeWidth}
		fill="none"
		stroke-dasharray="31.4 31.4"
		stroke-linecap="round"
	/>
</svg>

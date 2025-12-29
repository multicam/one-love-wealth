<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		title?: string;
		message: string;
		buttonText?: string;
		variant?: 'info' | 'warning' | 'error';
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Alert',
		message,
		buttonText = 'OK',
		variant = 'info',
		onclose
	}: Props = $props();

	const icons: Record<string, string> = {
		info: 'ℹ️',
		warning: '⚠️',
		error: '❌'
	};

	const variantClasses: Record<string, string> = {
		info: 'text-blue-400',
		warning: 'text-amber-400',
		error: 'text-red-400'
	};

	function handleClose() {
		open = false;
		onclose?.();
	}
</script>

<Modal bind:open {title} size="sm" onclose={handleClose}>
	<div class="flex items-start gap-4">
		<span class="text-2xl {variantClasses[variant]}">{icons[variant]}</span>
		<p class="text-slate-300 m-0 leading-relaxed">{message}</p>
	</div>

	{#snippet footer()}
		<Button onclick={handleClose}>
			{#snippet children()}{buttonText}{/snippet}
		</Button>
	{/snippet}
</Modal>

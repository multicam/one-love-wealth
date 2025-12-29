<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'danger';
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Confirm',
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'default',
		onconfirm,
		oncancel
	}: Props = $props();

	function handleConfirm() {
		open = false;
		onconfirm?.();
	}

	function handleCancel() {
		open = false;
		oncancel?.();
	}
</script>

<Modal bind:open {title} size="sm" onclose={handleCancel}>
	<p class="text-slate-300 m-0 leading-relaxed">{message}</p>

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel}>
			{#snippet children()}{cancelText}{/snippet}
		</Button>
		<Button variant={variant === 'danger' ? 'danger' : 'primary'} onclick={handleConfirm}>
			{#snippet children()}{confirmText}{/snippet}
		</Button>
	{/snippet}
</Modal>

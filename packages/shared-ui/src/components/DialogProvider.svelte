<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dialogStore } from '../stores/dialogStore.js';
	import AlertDialog from './AlertDialog.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children()}

{#if $dialogStore.alert}
	<AlertDialog
		open={true}
		title={$dialogStore.alert.title}
		message={$dialogStore.alert.message}
		buttonText={$dialogStore.alert.buttonText}
		variant={$dialogStore.alert.variant}
		onclose={$dialogStore.alert.onClose}
	/>
{/if}

{#if $dialogStore.confirm}
	<ConfirmDialog
		open={true}
		title={$dialogStore.confirm.title}
		message={$dialogStore.confirm.message}
		confirmText={$dialogStore.confirm.confirmText}
		cancelText={$dialogStore.confirm.cancelText}
		variant={$dialogStore.confirm.variant}
		onconfirm={$dialogStore.confirm.onConfirm}
		oncancel={$dialogStore.confirm.onCancel}
	/>
{/if}

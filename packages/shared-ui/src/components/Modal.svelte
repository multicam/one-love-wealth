<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		closeOnBackdrop?: boolean;
		closeOnEscape?: boolean;
		showCloseButton?: boolean;
		class?: string;
		children: Snippet;
		footer?: Snippet;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		size = 'md',
		closeOnBackdrop = true,
		closeOnEscape = true,
		showCloseButton = true,
		class: className = '',
		children,
		footer,
		onclose
	}: Props = $props();

	let dialogElement: HTMLDialogElement;
	const modalId = `modal-${crypto.randomUUID().slice(0, 8)}`;

	function close() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === dialogElement) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (closeOnEscape && e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	$effect(() => {
		if (open && dialogElement) {
			dialogElement.showModal();
			document.body.style.overflow = 'hidden';
		} else if (dialogElement) {
			dialogElement.close();
			document.body.style.overflow = '';
		}
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});

	const sizeClasses: Record<string, string> = {
		sm: 'w-[min(400px,90vw)]',
		md: 'w-[min(500px,90vw)]',
		lg: 'w-[min(700px,90vw)]',
		xl: 'w-[min(900px,90vw)]'
	};
</script>

<dialog
	bind:this={dialogElement}
	class="p-0 border-none rounded-xl bg-slate-800 text-slate-100 shadow-2xl max-h-[90vh] overflow-hidden backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-[scaleIn_0.2s_ease] {sizeClasses[size]} {className}"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	aria-labelledby={title ? `${modalId}-title` : undefined}
>
	<div class="flex flex-col max-h-[90vh]">
		{#if title || showCloseButton}
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
				{#if title}
					<h2 id="{modalId}-title" class="m-0 text-xl font-semibold text-slate-100">{title}</h2>
				{/if}
				{#if showCloseButton}
					<button
						class="flex items-center justify-center w-8 h-8 p-0 bg-transparent border-none rounded text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
						onclick={close}
						aria-label="Close modal"
						type="button"
					>
						✕
					</button>
				{/if}
			</div>
		{/if}

		<div class="p-6 overflow-y-auto flex-1">
			{@render children()}
		</div>

		{#if footer}
			<div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-700">
				{@render footer()}
			</div>
		{/if}
	</div>
</dialog>

<style>
	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>

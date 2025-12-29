<!--
  DEPRECATED: This component has been replaced by @one-love-wealth/shared-ui Toast.
  
  Migration guide:
  1. Import from shared-ui: import { Toast, toastStore } from '@one-love-wealth/shared-ui';
  2. Add <Toast /> to your layout
  3. Use toastStore.success(), toastStore.error(), toastStore.info(), toastStore.warning()
  
  This file is kept for backward compatibility. New code should use shared-ui.
-->
<script lang="ts" module>
	// Re-export from shared-ui for backward compatibility
	import { toastStore } from '@one-love-wealth/shared-ui';

	export interface Toast {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info';
	}

	// Legacy API - wraps the new store
	export const toasts = toastStore;

	export function addToast(message: string, type: Toast['type'] = 'info') {
		toastStore.show(message, type);
	}
</script>

<!-- Component rendering is now handled by shared-ui Toast in +layout.svelte -->

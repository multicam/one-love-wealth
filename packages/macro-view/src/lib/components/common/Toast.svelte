<!--
  DEPRECATED: Use @one-love-wealth/shared-ui Toast directly.
  
  Migration:
  1. Import Toast and toastStore from '@one-love-wealth/shared-ui'
  2. Add <Toast /> to your layout
  3. Use toastStore.success(), toastStore.error(), etc.
-->
<script lang="ts" module>
	// Re-export from shared-ui for backward compatibility
	import { toastStore as sharedToastStore, type ToastType } from '@one-love-wealth/shared-ui';

	export const toastStore = sharedToastStore;
	export type Toast = ToastType;

	// Legacy API adapter
	export function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
		sharedToastStore.show(message, type);
	}
</script>

<script lang="ts">
	import { Toast as SharedToast } from '@one-love-wealth/shared-ui';
</script>

<SharedToast position="bottom-right" />

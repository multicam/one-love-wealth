import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,

    /**
     * Show a toast notification
     */
    show(message: string, type: Toast['type'] = 'info', duration = 5000): string {
      const id = crypto.randomUUID();
      const toast: Toast = { id, message, type, duration };

      update(toasts => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          this.dismiss(id);
        }, duration);
      }

      return id;
    },

    /**
     * Show an info toast
     */
    info(message: string, duration = 5000): string {
      return this.show(message, 'info', duration);
    },

    /**
     * Show a success toast
     */
    success(message: string, duration = 5000): string {
      return this.show(message, 'success', duration);
    },

    /**
     * Show a warning toast
     */
    warning(message: string, duration = 5000): string {
      return this.show(message, 'warning', duration);
    },

    /**
     * Show an error toast
     */
    error(message: string, duration = 5000): string {
      return this.show(message, 'error', duration);
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss(id: string): void {
      update(toasts => toasts.filter(t => t.id !== id));
    },

    /**
     * Clear all toasts
     */
    clear(): void {
      update(() => []);
    }
  };
}

export const toastStore = createToastStore();

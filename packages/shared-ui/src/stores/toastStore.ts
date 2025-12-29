import { writable, type Writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastStore {
  subscribe: Writable<Toast[]>['subscribe'];
  show(message: string, type?: Toast['type'], duration?: number): string;
  info(message: string, duration?: number): string;
  success(message: string, duration?: number): string;
  warning(message: string, duration?: number): string;
  error(message: string, duration?: number): string;
  dismiss(id: string): void;
  clear(): void;
}

// Use globalThis to ensure singleton across module instances
const STORE_KEY = '__shared_ui_toast_store__';

function createToastStore(): ToastStore {
  const { subscribe, update } = writable<Toast[]>([]);

  const store: ToastStore = {
    subscribe,

    show(message: string, type: Toast['type'] = 'info', duration = 5000): string {
      const id = crypto.randomUUID();
      const toast: Toast = { id, message, type, duration };

      update(toasts => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          store.dismiss(id);
        }, duration);
      }

      return id;
    },

    info(message: string, duration = 5000): string {
      return store.show(message, 'info', duration);
    },

    success(message: string, duration = 5000): string {
      return store.show(message, 'success', duration);
    },

    warning(message: string, duration = 5000): string {
      return store.show(message, 'warning', duration);
    },

    error(message: string, duration = 5000): string {
      return store.show(message, 'error', duration);
    },

    dismiss(id: string): void {
      update(toasts => toasts.filter(t => t.id !== id));
    },

    clear(): void {
      update(() => []);
    }
  };

  return store;
}

// Singleton pattern using globalThis for cross-module consistency
function getToastStore(): ToastStore {
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any)[STORE_KEY]) {
      (globalThis as any)[STORE_KEY] = createToastStore();
    }
    return (globalThis as any)[STORE_KEY];
  }
  return createToastStore();
}

export const toastStore = getToastStore();

import { writable } from 'svelte/store';

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'warning' | 'error';
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface AlertState extends AlertOptions {
  onClose: () => void;
}

interface ConfirmState extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

interface DialogStoreState {
  alert: AlertState | null;
  confirm: ConfirmState | null;
}

const STORE_KEY = '__shared_ui_dialog_store__';

function createDialogStore() {
  const { subscribe, set } = writable<DialogStoreState>({
    alert: null,
    confirm: null
  });

  const store = {
    subscribe,

    alert(options: AlertOptions | string): Promise<void> {
      const opts: AlertOptions = typeof options === 'string' 
        ? { message: options } 
        : options;

      return new Promise((resolve) => {
        set({
          alert: {
            title: opts.title ?? 'Alert',
            message: opts.message,
            buttonText: opts.buttonText ?? 'OK',
            variant: opts.variant ?? 'info',
            onClose: () => {
              set({ alert: null, confirm: null });
              resolve();
            }
          },
          confirm: null
        });
      });
    },

    confirm(options: ConfirmOptions | string): Promise<boolean> {
      const opts: ConfirmOptions = typeof options === 'string' 
        ? { message: options } 
        : options;

      return new Promise((resolve) => {
        set({
          alert: null,
          confirm: {
            title: opts.title ?? 'Confirm',
            message: opts.message,
            confirmText: opts.confirmText ?? 'Confirm',
            cancelText: opts.cancelText ?? 'Cancel',
            variant: opts.variant ?? 'default',
            onConfirm: () => {
              set({ alert: null, confirm: null });
              resolve(true);
            },
            onCancel: () => {
              set({ alert: null, confirm: null });
              resolve(false);
            }
          }
        });
      });
    },

    clear(): void {
      set({ alert: null, confirm: null });
    }
  };

  return store;
}

function getDialogStore() {
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as unknown as Record<string, unknown>)[STORE_KEY]) {
      (globalThis as unknown as Record<string, unknown>)[STORE_KEY] = createDialogStore();
    }
    return (globalThis as unknown as Record<string, ReturnType<typeof createDialogStore>>)[STORE_KEY];
  }
  return createDialogStore();
}

export const dialogStore = getDialogStore();

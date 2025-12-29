<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { toastStore, type Toast } from '../stores/toastStore.js';

  interface Props {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }

  let { position = 'bottom-right' }: Props = $props();

  const positionClasses: Record<string, string> = {
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8',
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8'
  };

  const typeClasses: Record<Toast['type'], { container: string; icon: string }> = {
    info: {
      container: 'bg-blue-900/80 border-blue-500/50 text-blue-200',
      icon: 'ℹ️'
    },
    success: {
      container: 'bg-green-900/80 border-green-500/50 text-green-200',
      icon: '✅'
    },
    warning: {
      container: 'bg-amber-900/80 border-amber-500/50 text-amber-200',
      icon: '⚠️'
    },
    error: {
      container: 'bg-red-900/80 border-red-500/50 text-red-200',
      icon: '❌'
    }
  };

  function dismiss(id: string) {
    toastStore.dismiss(id);
  }
</script>

<div class="fixed z-[100] pointer-events-none flex flex-col gap-3 {positionClasses[position]}">
  {#each $toastStore as toast (toast.id)}
    {@const styles = typeClasses[toast.type]}
    <div
      in:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 300 }}
      out:fade={{ duration: 200 }}
      class="pointer-events-auto flex items-center px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[300px] border {styles.container}"
    >
      <span class="mr-3 text-xl">
        {styles.icon}
      </span>
      <div class="font-semibold text-sm flex-1">
        {toast.message}
      </div>
      <button
        onclick={() => dismiss(toast.id)}
        class="ml-4 p-1 bg-transparent border-none text-white/40 hover:text-white cursor-pointer text-base transition-colors"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

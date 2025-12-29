<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { toastStore, type Toast } from '../stores/toastStore.js';

  interface Props {
    /** Position of the toast container */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }

  let { position = 'bottom-right' }: Props = $props();

  const positionClasses: Record<string, string> = {
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8',
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8'
  };

  const typeStyles: Record<Toast['type'], { bg: string; border: string; text: string; icon: string }> = {
    info: {
      bg: 'rgba(30, 64, 175, 0.8)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: '#bfdbfe',
      icon: 'ℹ️'
    },
    success: {
      bg: 'rgba(6, 78, 59, 0.8)',
      border: 'rgba(34, 197, 94, 0.5)',
      text: '#bbf7d0',
      icon: '✅'
    },
    warning: {
      bg: 'rgba(120, 53, 15, 0.8)',
      border: 'rgba(245, 158, 11, 0.5)',
      text: '#fde68a',
      icon: '⚠️'
    },
    error: {
      bg: 'rgba(127, 29, 29, 0.8)',
      border: 'rgba(239, 68, 68, 0.5)',
      text: '#fecaca',
      icon: '❌'
    }
  };

  function dismiss(id: string) {
    toastStore.dismiss(id);
  }
</script>

<div class="fixed z-[100] pointer-events-none {positionClasses[position]}" style="display: flex; flex-direction: column; gap: 0.75rem;">
  {#each $toastStore as toast (toast.id)}
    {@const styles = typeStyles[toast.type]}
    <div
      in:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 300 }}
      out:fade={{ duration: 200 }}
      class="pointer-events-auto"
      style="
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(12px);
        min-width: 300px;
        background-color: {styles.bg};
        border: 1px solid {styles.border};
        color: {styles.text};
      "
    >
      <span style="margin-right: 0.75rem; font-size: 1.25rem;">
        {styles.icon}
      </span>
      <div style="font-weight: 600; font-size: 0.875rem; flex: 1;">
        {toast.message}
      </div>
      <button
        onclick={() => dismiss(toast.id)}
        style="
          margin-left: 1rem;
          padding: 0.25rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.2s;
        "
        onmouseenter={(e) => (e.currentTarget.style.color = 'white')}
        onmouseleave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

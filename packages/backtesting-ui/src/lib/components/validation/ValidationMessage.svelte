<script lang="ts">
  import type { ValidationSeverity } from '$lib/validation/types';

  interface Props {
    /** Validation message */
    message: string | null;
    /** Severity level */
    severity?: ValidationSeverity | null;
    /** Show icon? */
    showIcon?: boolean;
  }

  let { message, severity = null, showIcon = true }: Props = $props();

  const icons = {
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };
</script>

{#if message && severity}
  <div class="flex items-start gap-2 text-sm {colors[severity]} mt-1">
    {#if showIcon}
      <span class="mt-0.5">{icons[severity]}</span>
    {/if}
    <span>{message}</span>
  </div>
{/if}

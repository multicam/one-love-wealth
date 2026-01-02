<script lang="ts">
  import { Card } from '@one-love-wealth/shared-ui';
  import type { ValidationState } from '$lib/validation/types';

  interface Props {
    /** Validation state */
    validation: ValidationState;
    /** Show when valid? */
    showWhenValid?: boolean;
  }

  let { validation, showWhenValid = false }: Props = $props();

  const errors = $derived(validation.results.filter((r) => r.severity === 'error'));
  const warnings = $derived(validation.results.filter((r) => r.severity === 'warning'));
  const hasIssues = $derived(errors.length > 0 || warnings.length > 0);
</script>

{#if hasIssues || showWhenValid}
  <Card
    class={`border p-4 ${
      errors.length > 0
        ? 'bg-red-950 border-red-800 text-red-400'
        : warnings.length > 0
          ? 'bg-yellow-950 border-yellow-800 text-yellow-400'
          : 'bg-green-950 border-green-800 text-green-400'
    }`}
  >
    <div class="flex items-start gap-3">
      <div class="text-2xl mt-0.5">
        {#if errors.length > 0}
          ✕
        {:else if warnings.length > 0}
          ⚠
        {:else}
          ✓
        {/if}
      </div>

      <div class="flex-1">
        <h3 class="font-semibold text-base mb-2">
          {#if errors.length > 0}
            Configuration has {errors.length} error{errors.length !== 1 ? 's' : ''}
          {:else if warnings.length > 0}
            Configuration has {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          {:else}
            Configuration is valid
          {/if}
        </h3>

        {#if errors.length > 0}
          <ul class="space-y-1 text-sm">
            {#each errors as error}
              <li class="flex items-start gap-2">
                <span class="opacity-50">•</span>
                <span>{error.message}</span>
              </li>
            {/each}
          </ul>
        {/if}

        {#if warnings.length > 0}
          <div class={errors.length > 0 ? 'mt-3' : ''}>
            <p class="text-sm font-medium mb-1">Warnings:</p>
            <ul class="space-y-1 text-sm opacity-90">
              {#each warnings as warning}
                <li class="flex items-start gap-2">
                  <span class="opacity-50">•</span>
                  <span>{warning.message}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  </Card>
{/if}

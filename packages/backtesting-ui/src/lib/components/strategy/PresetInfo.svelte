<script lang="ts">
  import { Button, Card } from '@one-love-wealth/shared-ui';
  import type { PresetInfo } from '$lib/strategies/types';

  interface Props {
    /** Preset information */
    preset: PresetInfo;
    /** Is user currently using recommended params? */
    isUsing: boolean;
    /** Callback to reset to recommended */
    onReset?: () => void;
  }

  let { preset, isUsing, onReset }: Props = $props();
</script>

<Card class="bg-surface-light p-4">
  <div class="flex items-start justify-between gap-3 mb-3">
    <div>
      <h3 class="font-semibold text-base flex items-center gap-2">
        {#if isUsing}
          <span class="text-green-400">✓</span>
        {/if}
        {preset.name} Preset
      </h3>
      <p class="text-sm text-text-secondary mt-1">{preset.rationale}</p>
    </div>

    {#if onReset && !isUsing}
      <Button variant="secondary" size="sm" onclick={onReset}>
        {#snippet children()}Reset to Recommended{/snippet}
      </Button>
    {/if}
  </div>

  <!-- Optimized For -->
  {#if preset.optimizedFor && preset.optimizedFor.length > 0}
    <div class="mb-3">
      <p class="text-xs font-medium text-text-secondary mb-1">Optimized For:</p>
      <div class="flex flex-wrap gap-1">
        {#each preset.optimizedFor as item}
          <span class="text-xs bg-blue-950 text-blue-400 px-2 py-0.5 rounded">{item}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Expected Metrics -->
  {#if preset.expectedMetrics}
    <div class="mb-3">
      <p class="text-xs font-medium text-text-secondary mb-1">Expected Performance:</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        {#if preset.expectedMetrics.sharpe}
          <div>
            <span class="text-text-secondary">Sharpe:</span>
            <span class="ml-1 font-medium">{preset.expectedMetrics.sharpe}</span>
          </div>
        {/if}
        {#if preset.expectedMetrics.maxDrawdown}
          <div>
            <span class="text-text-secondary">Max DD:</span>
            <span class="ml-1 font-medium">{preset.expectedMetrics.maxDrawdown}</span>
          </div>
        {/if}
        {#if preset.expectedMetrics.winRate}
          <div>
            <span class="text-text-secondary">Win Rate:</span>
            <span class="ml-1 font-medium">{preset.expectedMetrics.winRate}</span>
          </div>
        {/if}
        {#if preset.expectedMetrics.annualReturn}
          <div>
            <span class="text-text-secondary">Annual Return:</span>
            <span class="ml-1 font-medium">{preset.expectedMetrics.annualReturn}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Backtested Period -->
  {#if preset.backtestedPeriod}
    <p class="text-xs text-text-secondary">
      <span class="font-medium">Backtested:</span>
      {preset.backtestedPeriod}
    </p>
  {/if}

  <!-- Suitable For -->
  {#if preset.suitableFor && preset.suitableFor.length > 0}
    <details class="mt-3 text-sm">
      <summary class="cursor-pointer text-blue-400 text-xs font-medium">
        Suitable For ({preset.suitableFor.length})
      </summary>
      <ul class="mt-1 ml-4 list-disc text-xs text-text-secondary space-y-0.5">
        {#each preset.suitableFor as item}
          <li>{item}</li>
        {/each}
      </ul>
    </details>
  {/if}

  <!-- Modified Warning -->
  {#if !isUsing}
    <div class="mt-3 text-xs text-yellow-400 flex items-start gap-2">
      <span>⚠</span>
      <span>You've modified the recommended parameters. Click "Reset" to restore defaults.</span>
    </div>
  {/if}
</Card>

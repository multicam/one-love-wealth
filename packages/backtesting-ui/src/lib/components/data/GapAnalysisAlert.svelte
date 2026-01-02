<script lang="ts">
  import { Modal, Button, Card } from '@one-love-wealth/shared-ui';
  import type { GapAnalysis } from '$lib/utils/gap-analysis';
  import { getGapSeverity, getGapRecommendations } from '$lib/utils/gap-analysis';

  interface Props {
    analysis: GapAnalysis;
    symbols: string[];
    onReload?: () => void;
  }

  let { analysis, symbols, onReload }: Props = $props();

  let showDetails = $state(false);

  const severity = $derived(getGapSeverity(analysis));
  const recommendations = $derived(getGapRecommendations(analysis));

  // Severity styling
  const severityColors = {
    excellent: 'text-green-400 bg-green-950 border-green-800',
    good: 'text-blue-400 bg-blue-950 border-blue-800',
    warning: 'text-yellow-400 bg-yellow-950 border-yellow-800',
    error: 'text-red-400 bg-red-950 border-red-800',
  };

  const severityIcons = {
    excellent: '✓',
    good: 'ℹ',
    warning: '⚠',
    error: '✕',
  };

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<!-- Main Alert -->
<Card class={`${severityColors[severity]} border p-4`}>
  <div class="flex items-start gap-3">
    <div class="text-2xl mt-0.5">{severityIcons[severity]}</div>

    <div class="flex-1">
      <h3 class="font-semibold text-base mb-2">
        Data Quality: {analysis.qualityScore.toFixed(0)}/100
      </h3>

      <div class="text-sm space-y-1 opacity-90">
        <p>
          Loaded {analysis.totalBars.toLocaleString()} bars for {symbols.join(', ')}
        </p>

        {#if analysis.filledGaps > 0}
          <p>
            Filled {analysis.filledGaps.toLocaleString()} gaps ({analysis.gapPercentage.toFixed(
              1
            )}%)
          </p>
        {/if}

        {#if analysis.droppedBars > 0}
          <p>Dropped {analysis.droppedBars.toLocaleString()} bars</p>
        {/if}
      </div>

      {#if recommendations.length > 0}
        <div class="mt-3 text-sm">
          <p class="font-medium mb-1">Recommendations:</p>
          <ul class="list-disc list-inside space-y-0.5 opacity-90">
            {#each recommendations as rec}
              <li>{rec}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <Button variant="ghost" size="sm" onclick={() => (showDetails = true)}>
        {#snippet children()}View Details{/snippet}
      </Button>

      {#if onReload}
        <Button variant="secondary" size="sm" onclick={onReload}>
          {#snippet children()}Reload{/snippet}
        </Button>
      {/if}
    </div>
  </div>
</Card>

<!-- Details Modal -->
<Modal bind:open={showDetails} title="Gap Analysis Details" size="lg">
  {#snippet children()}
    <div class="space-y-6">
      <!-- Summary Stats -->
      <div>
        <h4 class="font-semibold mb-3">Summary</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-text-secondary">Quality Score</p>
            <p class="text-2xl font-semibold">{analysis.qualityScore.toFixed(0)}/100</p>
          </div>
          <div>
            <p class="text-sm text-text-secondary">Total Bars</p>
            <p class="text-2xl font-semibold">{analysis.totalBars.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-sm text-text-secondary">Filled Gaps</p>
            <p class="text-2xl font-semibold">
              {analysis.filledGaps.toLocaleString()}
              <span class="text-sm text-text-secondary">
                ({analysis.gapPercentage.toFixed(2)}%)
              </span>
            </p>
          </div>
          <div>
            <p class="text-sm text-text-secondary">Dropped Bars</p>
            <p class="text-2xl font-semibold">{analysis.droppedBars.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <!-- Gaps by Type -->
      <div>
        <h4 class="font-semibold mb-3">Gaps by Type</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm">Weekends</span>
            <span class="font-medium">{analysis.byReason.weekend.toLocaleString()}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm">Holidays</span>
            <span class="font-medium">{analysis.byReason.holiday.toLocaleString()}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-yellow-400">Missing Data</span>
            <span class="font-medium text-yellow-400">
              {analysis.byReason.missing.toLocaleString()}
            </span>
          </div>
          {#if analysis.byReason['multi-symbol'] > 0}
            <div class="flex justify-between items-center">
              <span class="text-sm text-yellow-400">Multi-Symbol Alignment</span>
              <span class="font-medium text-yellow-400">
                {analysis.byReason['multi-symbol'].toLocaleString()}
              </span>
            </div>
          {/if}
          {#if analysis.byReason.unknown > 0}
            <div class="flex justify-between items-center">
              <span class="text-sm text-red-400">Unknown</span>
              <span class="font-medium text-red-400">
                {analysis.byReason.unknown.toLocaleString()}
              </span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Individual Gaps -->
      {#if analysis.gaps.length > 0}
        <div>
          <h4 class="font-semibold mb-3">
            Gap Details ({analysis.gaps.length} gap{analysis.gaps.length !== 1 ? 's' : ''})
          </h4>
          <div class="max-h-64 overflow-y-auto space-y-2">
            {#each analysis.gaps.slice(0, 20) as gap}
              <div class="text-sm border border-border rounded p-2">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">
                      {formatDate(gap.startTime)} → {formatDate(gap.endTime)}
                    </p>
                    <p class="text-text-secondary text-xs">
                      {gap.barsMissing} bar{gap.barsMissing !== 1 ? 's' : ''} missing
                    </p>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded text-xs {gap.reason === 'weekend' ||
                    gap.reason === 'holiday'
                      ? 'bg-blue-950 text-blue-400'
                      : 'bg-yellow-950 text-yellow-400'}"
                  >
                    {gap.reason}
                  </span>
                </div>
              </div>
            {/each}
            {#if analysis.gaps.length > 20}
              <p class="text-sm text-text-secondary text-center py-2">
                ... and {analysis.gaps.length - 20} more gaps
              </p>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Common Causes -->
      <div class="bg-surface-light rounded p-4">
        <h4 class="font-semibold mb-2">Common Causes of Gaps</h4>
        <ul class="text-sm space-y-1 text-text-secondary">
          <li>• <strong>Weekends & Holidays:</strong> Expected, markets closed</li>
          <li>• <strong>Missing Data:</strong> Data provider issues or symbol unavailability</li>
          <li>
            • <strong>Multi-Symbol:</strong> Different trading hours or data availability across
            symbols
          </li>
          <li>• <strong>Trading Halts:</strong> Circuit breakers or regulatory halts</li>
        </ul>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <Button variant="primary" onclick={() => (showDetails = false)}>
      {#snippet children()}Close{/snippet}
    </Button>
  {/snippet}
</Modal>

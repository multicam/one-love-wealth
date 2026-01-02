<script lang="ts">
  import { walkforward } from '$lib/stores/walkforward.svelte';
  import { strategy } from '$lib/stores/strategy.svelte';
  import { config } from '$lib/stores/config.svelte';
  import { toastStore } from '@one-love-wealth/shared-ui';
  import { executeWalkForward } from '$lib/services/walkforward.service';

  let startTime = $state<number>(0);

  // Computed - estimated time remaining
  const estimatedTimeRemaining = $derived(() => {
    if (!walkforward.isRunning || walkforward.currentWindow === 0) return null;

    const elapsed = Date.now() - startTime;
    const avgTimePerWindow = elapsed / walkforward.currentWindow;
    const remaining = walkforward.totalWindows - walkforward.currentWindow;
    const eta = avgTimePerWindow * remaining;

    return eta;
  });

  // Format ETA
  function formatETA(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // Calculate total windows based on config
  const totalWindowsEstimate = $derived(() => {
    const { stepSizePercent } = walkforward.config;
    if (stepSizePercent <= 0) return 0;

    // Simplified calculation - actual will depend on data length
    const maxWindows = Math.floor(100 / stepSizePercent);
    return maxWindows;
  });

  // Handle run walk-forward
  async function handleRunWalkForward() {
    if (!strategy.selectedStrategy || !strategy.selectedStrategyId) {
      toastStore.error('Please select a strategy first');
      return;
    }

    if (walkforward.config.inSamplePercent + walkforward.config.outSamplePercent !== 100) {
      toastStore.error('In-sample and out-sample percentages must sum to 100%');
      return;
    }

    if (walkforward.config.stepSizePercent <= 0 || walkforward.config.stepSizePercent > 100) {
      toastStore.error('Step size must be between 1% and 100%');
      return;
    }

    startTime = Date.now();

    try {
      const result = await executeWalkForward(
        {
          strategy: strategy.selectedStrategy,
          strategyParams: strategy.params,
          wfConfig: walkforward.config,
          dateRange: config.dateRange,
          interval: config.interval,
          initialCapital: config.initialCapital,
          gapFillStrategy: config.gapFillStrategy,
          symbols: config.symbols,
        },
        (windowNumber, total) => {
          walkforward.updateProgress(windowNumber);
        }
      );

      walkforward.setResult(result, strategy.selectedStrategyId, strategy.selectedStrategy.name);
      toastStore.success(`Walk-forward analysis complete! ${result.windows.length} windows analyzed.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      walkforward.setError(message);
      toastStore.error(`Walk-forward failed: ${message}`);
    }
  }

  // Handle stop
  function handleStop() {
    walkforward.stopAnalysis();
    toastStore.info('Walk-forward analysis stopped');
  }

  // Handle reset config
  function handleResetConfig() {
    walkforward.resetConfig();
    toastStore.info('Configuration reset to defaults');
  }
</script>

<div class="h-full flex flex-col p-6 bg-surface-secondary overflow-y-auto">
  <h2 class="text-2xl font-bold mb-6 text-text-primary">Walk-Forward Analysis</h2>

  {#if walkforward.error}
    <div class="mb-4 p-4 bg-error/10 border border-error rounded-lg text-error text-sm">
      <strong>Error:</strong> {walkforward.error}
    </div>
  {/if}

  <!-- Window Configuration -->
  <div class="mb-6">
    <h3 class="text-lg font-semibold mb-3 text-text-primary">Window Configuration</h3>

    <div class="space-y-4">
      <!-- In-Sample Percentage -->
      <div>
        <label class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-primary">In-Sample Period</span>
          <span class="text-sm text-text-secondary">{walkforward.config.inSamplePercent}%</span>
        </label>
        <input
          type="range"
          min="20"
          max="80"
          step="5"
          bind:value={walkforward.config.inSamplePercent}
          onchange={() => {
            // Auto-adjust out-sample to maintain 100% total
            walkforward.config.outSamplePercent = 100 - walkforward.config.inSamplePercent;
          }}
          disabled={walkforward.isRunning}
          class="w-full"
        />
        <p class="text-xs text-text-tertiary mt-1">
          Period used for parameter optimization
        </p>
      </div>

      <!-- Out-Sample Percentage -->
      <div>
        <label class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-primary">Out-of-Sample Period</span>
          <span class="text-sm text-text-secondary">{walkforward.config.outSamplePercent}%</span>
        </label>
        <input
          type="range"
          min="20"
          max="80"
          step="5"
          bind:value={walkforward.config.outSamplePercent}
          onchange={() => {
            // Auto-adjust in-sample to maintain 100% total
            walkforward.config.inSamplePercent = 100 - walkforward.config.outSamplePercent;
          }}
          disabled={walkforward.isRunning}
          class="w-full"
        />
        <p class="text-xs text-text-tertiary mt-1">
          Period used for testing optimized parameters
        </p>
      </div>

      <!-- Step Size -->
      <div>
        <label class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-primary">Step Size</span>
          <span class="text-sm text-text-secondary">{walkforward.config.stepSizePercent}%</span>
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          bind:value={walkforward.config.stepSizePercent}
          disabled={walkforward.isRunning}
          class="w-full"
        />
        <p class="text-xs text-text-tertiary mt-1">
          How far to advance each window (smaller = more windows)
        </p>
      </div>

      <!-- Anchored vs Rolling -->
      <div>
        <label class="flex items-center gap-3">
          <input
            type="checkbox"
            bind:checked={walkforward.config.anchored}
            disabled={walkforward.isRunning}
            class="w-4 h-4"
          />
          <span class="text-sm font-medium text-text-primary">Anchored Windows</span>
        </label>
        <p class="text-xs text-text-tertiary mt-1 ml-7">
          {#if walkforward.config.anchored}
            Start of in-sample period remains fixed at the beginning
          {:else}
            Windows roll forward, maintaining fixed window size
          {/if}
        </p>
      </div>

      <!-- Estimated Windows -->
      <div class="p-3 bg-surface-tertiary rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm text-text-secondary">Estimated Windows:</span>
          <span class="text-sm font-semibold text-text-primary">
            ~{totalWindowsEstimate()}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Progress -->
  {#if walkforward.isRunning}
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-text-primary">
          Window {walkforward.currentWindow} of {walkforward.totalWindows}
        </span>
        <span class="text-sm text-text-secondary">
          {Math.round(walkforward.progress())}%
        </span>
      </div>
      <div class="w-full bg-surface-tertiary rounded-full h-2 overflow-hidden">
        <div
          class="bg-primary h-full transition-all duration-300"
          style="width: {walkforward.progress()}%"
        ></div>
      </div>
      {#if estimatedTimeRemaining()}
        <p class="text-xs text-text-tertiary mt-1 text-center">
          Estimated time remaining: {formatETA(estimatedTimeRemaining()!)}
        </p>
      {/if}
    </div>
  {/if}

  <!-- Actions -->
  <div class="mt-auto space-y-3">
    {#if !walkforward.isRunning}
      <button
        onclick={handleRunWalkForward}
        disabled={!strategy.selectedStrategy}
        class="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg
               hover:bg-primary-hover transition-colors disabled:opacity-50
               disabled:cursor-not-allowed"
      >
        Run Walk-Forward Analysis
      </button>

      <button
        onclick={handleResetConfig}
        class="w-full px-4 py-2 bg-surface-tertiary text-text-secondary font-medium
               rounded-lg hover:bg-surface-hover transition-colors text-sm"
      >
        Reset to Defaults
      </button>
    {:else}
      <button
        onclick={handleStop}
        class="w-full px-6 py-3 bg-error text-white font-semibold rounded-lg
               hover:bg-error/90 transition-colors"
      >
        Stop Analysis
      </button>
    {/if}
  </div>

  {#if !strategy.selectedStrategy}
    <p class="text-xs text-text-tertiary mt-4 text-center">
      Select a strategy from the left panel to begin
    </p>
  {/if}
</div>

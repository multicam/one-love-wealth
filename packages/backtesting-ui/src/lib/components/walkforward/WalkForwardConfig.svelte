<script lang="ts">
  import { walkforward } from "$lib/stores/walkforward.svelte";
  import { strategy } from "$lib/stores/strategy.svelte";
  import { config } from "$lib/stores/config.svelte";
  import { toastStore } from "@one-love-wealth/shared-ui";
  import { executeWalkForward } from "$lib/services/walkforward.service";

  let startTime = $state<number>(0);

  // Computed - estimated time remaining
  const estimatedTimeRemaining = $derived.by(() => {
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
  const totalWindowsEstimate = $derived.by(() => {
    const stepSizePercent = walkforward.config.stepSizePercent ?? 0;
    if (stepSizePercent <= 0) return 0;

    // Simplified calculation - actual will depend on data length
    const maxWindows = Math.floor(100 / stepSizePercent);
    return maxWindows;
  });

  // Handle run walk-forward
  async function handleRunWalkForward() {
    console.log("[WalkForwardConfig] handleRunWalkForward called");

    const currentStrategy = strategy.selectedStrategy;
    if (!currentStrategy || !strategy.selectedStrategyId) {
      console.error("[WalkForwardConfig] No strategy selected");
      toastStore.error("Please select a strategy first");
      return;
    }

    if (
      walkforward.config.inSamplePercent +
        walkforward.config.outSamplePercent !==
      100
    ) {
      console.error("[WalkForwardConfig] Invalid percentages");
      toastStore.error("In-sample and out-sample percentages must sum to 100%");
      return;
    }

    if (
      walkforward.config.stepSizePercent <= 0 ||
      walkforward.config.stepSizePercent > 100
    ) {
      console.error("[WalkForwardConfig] Invalid step size");
      toastStore.error("Step size must be between 1% and 100%");
      return;
    }

    console.log("[WalkForwardConfig] Starting walk-forward analysis");
    startTime = Date.now();

    try {
      const result = await executeWalkForward(
        {
          strategy: currentStrategy as any,
          strategyParams: strategy.params,
          wfConfig: walkforward.config,
          dateRange: {
            start: config.dateRange.start.toISOString().split("T")[0],
            end: config.dateRange.end.toISOString().split("T")[0],
          },
          interval: config.interval,
          initialCapital: config.initialCapital,
          gapFillStrategy: config.gapFillStrategy as any,
          symbols: config.symbols,
        },
        (windowNumber) => {
          walkforward.updateProgress(windowNumber);
        },
      );

      console.log("[WalkForwardConfig] Analysis complete, setting result");
      walkforward.setResult(
        result,
        strategy.selectedStrategyId,
        currentStrategy.name,
      );
      console.log("[WalkForwardConfig] Result set in store");
      toastStore.success(
        `Walk-forward analysis complete! ${result.windows.length} windows analyzed.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[WalkForwardConfig] Analysis failed:", error);
      walkforward.setError(message);
      toastStore.error(`Walk-forward failed: ${message}`);
    }
  }

  // Handle stop
  function handleStop() {
    walkforward.stopAnalysis();
    toastStore.info("Walk-forward analysis stopped");
  }

  // Handle reset config
  function handleResetConfig() {
    walkforward.resetConfig();
    toastStore.info("Configuration reset to defaults");
  }
</script>

<div class="h-full flex flex-col p-6 bg-surface-secondary overflow-y-auto">
  <h2 class="text-2xl font-bold mb-6 text-text-primary">
    Walk-Forward Analysis
  </h2>

  {#if walkforward.error}
    <div
      class="mb-4 p-4 bg-error/10 border border-error rounded-lg text-error text-sm"
    >
      <strong>Error:</strong>
      {walkforward.error}
    </div>
  {/if}

  <!-- Window Configuration -->
  <div class="mb-6">
    <h3 class="text-lg font-semibold mb-3 text-text-primary">
      Window Configuration
    </h3>

    <div class="space-y-4">
      <!-- In-Sample Percentage -->
      <div>
        <label
          for="in-sample-percent"
          class="flex items-center justify-between mb-2"
        >
          <span class="text-sm font-medium text-text-primary"
            >In-Sample Period</span
          >
          <span class="text-sm text-text-secondary"
            >{walkforward.config.inSamplePercent}%</span
          >
        </label>
        <input
          id="in-sample-percent"
          type="range"
          min="20"
          max="80"
          step="5"
          value={walkforward.config.inSamplePercent}
          oninput={(e) => {
            const val = parseInt(e.currentTarget.value);
            walkforward.updateConfig({
              inSamplePercent: val,
              outSamplePercent: 100 - val,
            });
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
        <label
          for="out-sample-percent"
          class="flex items-center justify-between mb-2"
        >
          <span class="text-sm font-medium text-text-primary"
            >Out-of-Sample Period</span
          >
          <span class="text-sm text-text-secondary"
            >{walkforward.config.outSamplePercent}%</span
          >
        </label>
        <input
          id="out-sample-percent"
          type="range"
          min="20"
          max="80"
          step="5"
          value={walkforward.config.outSamplePercent}
          oninput={(e) => {
            const val = parseInt(e.currentTarget.value);
            walkforward.updateConfig({
              outSamplePercent: val,
              inSamplePercent: 100 - val,
            });
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
        <label for="step-size" class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-primary">Step Size</span>
          <span class="text-sm text-text-secondary"
            >{walkforward.config.stepSizePercent}%</span
          >
        </label>
        <input
          id="step-size"
          type="range"
          min="5"
          max="50"
          step="5"
          value={walkforward.config.stepSizePercent}
          oninput={(e) =>
            walkforward.updateConfig({
              stepSizePercent: parseInt(e.currentTarget.value),
            })}
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
            checked={walkforward.config.anchored}
            onchange={(e) =>
              walkforward.updateConfig({ anchored: e.currentTarget.checked })}
            disabled={walkforward.isRunning}
            class="w-4 h-4"
          />
          <span class="text-sm font-medium text-text-primary"
            >Anchored Windows</span
          >
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
            ~{totalWindowsEstimate}
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
          {walkforward.totalWindows > 0
            ? Math.round(
                (walkforward.currentWindow / walkforward.totalWindows) * 100,
              )
            : 0}%
        </span>
      </div>
      <div class="w-full bg-surface-tertiary rounded-full h-2 overflow-hidden">
        <div
          class="bg-primary h-full transition-all duration-300"
          style="width: {walkforward.totalWindows > 0
            ? (walkforward.currentWindow / walkforward.totalWindows) * 100
            : 0}%"
        ></div>
      </div>
      {#if estimatedTimeRemaining}
        <p class="text-xs text-text-tertiary mt-1 text-center">
          Estimated time remaining: {formatETA(estimatedTimeRemaining!)}
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

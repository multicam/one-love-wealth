<script lang="ts">
  import { walkforward, hasResult } from '$lib/stores/walkforward';
  import WalkForwardTimeline from './WalkForwardTimeline.svelte';
  import WindowResults from './WindowResults.svelte';
  import EquityCurve from '../charts/EquityCurve.svelte';
  import type { WalkForwardWindow } from '$lib/stores/walkforward';

  let activeTab = $state<'overview' | 'timeline' | 'windows' | 'equity'>('overview');
  let selectedWindow = $state<WalkForwardWindow | null>(null);

  // Handle window click from timeline
  function handleWindowClick(window: WalkForwardWindow) {
    selectedWindow = window;
  }

  // Format percentage
  function formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  // Format number
  function formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }
</script>

{#if !$hasResult}
  <div class="h-full flex flex-col items-center justify-center p-6">
    <svg
      class="w-16 h-16 text-text-tertiary mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <h3 class="text-xl font-semibold mb-2 text-text-primary">No Results Yet</h3>
    <p class="text-text-secondary text-center max-w-md">
      Configure your walk-forward parameters and run an analysis to see results here.
    </p>
  </div>
{:else}
  <div class="h-full flex flex-col bg-surface-primary">
    <!-- Header -->
    <div class="border-b border-border bg-surface/50 px-6 py-3">
      <h2 class="text-lg font-semibold text-text-primary">Walk-Forward Analysis Results</h2>
      <p class="text-sm text-text-secondary mt-1">
        {#if $walkforward.result.symbols && $walkforward.result.symbols.length > 0}
          {$walkforward.result.symbols.join(', ')} •
        {/if}
        {$walkforward.result.windows.length} windows
        {#if $walkforward.result.aggregateOutSample}
          • {formatPercent($walkforward.result.aggregateOutSample.totalReturn)} out-of-sample return
        {/if}
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-border flex items-center gap-1 px-4 py-2">
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {activeTab === 'overview'
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-surface-hover'}"
        onclick={() => (activeTab = 'overview')}
      >
        Overview
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {activeTab === 'timeline'
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-surface-hover'}"
        onclick={() => (activeTab = 'timeline')}
      >
        Timeline
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {activeTab === 'windows'
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-surface-hover'}"
        onclick={() => (activeTab = 'windows')}
      >
        Windows
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {activeTab === 'equity'
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-surface-hover'}"
        onclick={() => (activeTab = 'equity')}
      >
        Equity Curve
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      {#if activeTab === 'overview'}
        <!-- Aggregate Metrics -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-text-primary">Aggregate Performance</h3>
            <div
              class="px-3 py-1 rounded-full text-sm font-semibold {$walkforward.result!.passFailStatus ===
              'pass'
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error'}"
            >
              {$walkforward.result!.passFailStatus === 'pass' ? 'PASS' : 'FAIL'}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6 mb-6">
            <!-- In-Sample Metrics -->
            <div class="p-4 bg-surface-secondary rounded-lg border border-border">
              <h4 class="text-xs font-medium text-text-tertiary uppercase mb-3">In-Sample Average</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Sharpe Ratio:</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {formatNumber($walkforward.result.aggregateInSample.sharpe)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Total Return:</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {formatPercent($walkforward.result.aggregateInSample.totalReturn)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Max Drawdown:</span>
                  <span class="text-sm font-semibold text-error">
                    {formatPercent($walkforward.result.aggregateInSample.maxDrawdown)}
                  </span>
                </div>
              </div>
            </div>

            <!-- Out-Sample Metrics -->
            <div class="p-4 bg-surface-secondary rounded-lg border border-border">
              <h4 class="text-xs font-medium text-text-tertiary uppercase mb-3">
                Out-of-Sample Average
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Sharpe Ratio:</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {formatNumber($walkforward.result.aggregateOutSample.sharpe)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Total Return:</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {formatPercent($walkforward.result.aggregateOutSample.totalReturn)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Max Drawdown:</span>
                  <span class="text-sm font-semibold text-error">
                    {formatPercent($walkforward.result.aggregateOutSample.maxDrawdown)}
                  </span>
                </div>
              </div>
            </div>

            <!-- Degradation -->
            <div class="p-4 bg-surface-secondary rounded-lg border border-border">
              <h4 class="text-xs font-medium text-text-tertiary uppercase mb-3">Degradation Analysis</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Average Degradation:</span>
                  <span
                    class="text-sm font-semibold {$walkforward.result.averageDegradation < 20
                      ? 'text-success'
                      : 'text-error'}"
                  >
                    {formatNumber($walkforward.result.averageDegradation, 1)}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Total Windows:</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {$walkforward.result.windows.length}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-text-secondary">Strategy:</span>
                  <span class="text-sm font-semibold text-text-primary truncate">
                    {$walkforward.result.strategyName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Interpretation -->
          <div
            class="p-4 rounded-lg border {$walkforward.result.passFailStatus === 'pass'
              ? 'bg-success/5 border-success/30'
              : 'bg-error/5 border-error/30'}"
          >
            <h4 class="text-sm font-semibold mb-2 {$walkforward.result.passFailStatus === 'pass' ? 'text-success' : 'text-error'}">
              {#if $walkforward.result.passFailStatus === 'pass'}
                ✓ Strategy Shows Robustness
              {:else}
                ✗ Strategy Shows Degradation
              {/if}
            </h4>
            <p class="text-sm text-text-secondary">
              {#if $walkforward.result.passFailStatus === 'pass'}
                Average degradation is below 20%, indicating the strategy maintains performance on
                out-of-sample data. This suggests the strategy is not overfitted and may generalize well to
                future data.
              {:else}
                Average degradation exceeds 20%, indicating significant performance drop on out-of-sample
                data. This suggests potential overfitting. Consider simplifying the strategy or adjusting
                parameters.
              {/if}
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-surface-secondary rounded-lg">
            <div class="text-xs text-text-tertiary uppercase mb-1">Best Window (Out-Sample)</div>
            <div class="text-xl font-bold text-text-primary">
              {formatNumber(
                Math.max(...$walkforward.result.windows.map((w) => w.outSampleMetrics.sharpe))
              )}
            </div>
            <div class="text-xs text-text-secondary">Sharpe Ratio</div>
          </div>

          <div class="p-4 bg-surface-secondary rounded-lg">
            <div class="text-xs text-text-tertiary uppercase mb-1">Worst Window (Out-Sample)</div>
            <div class="text-xl font-bold text-text-primary">
              {formatNumber(
                Math.min(...$walkforward.result.windows.map((w) => w.outSampleMetrics.sharpe))
              )}
            </div>
            <div class="text-xs text-text-secondary">Sharpe Ratio</div>
          </div>
        </div>
      {:else if activeTab === 'timeline'}
        <WalkForwardTimeline windows={$walkforward.result.windows} {handleWindowClick} />

        {#if selectedWindow}
          <div class="mt-6 p-4 bg-surface-secondary rounded-lg border border-border">
            <h4 class="text-sm font-semibold mb-3 text-text-primary">
              Window {selectedWindow.windowNumber} Details
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-text-tertiary mb-1">In-Sample Period</div>
                <div class="text-text-primary">
                  {selectedWindow.inSampleStart} to {selectedWindow.inSampleEnd}
                </div>
              </div>
              <div>
                <div class="text-text-tertiary mb-1">Out-of-Sample Period</div>
                <div class="text-text-primary">
                  {selectedWindow.outSampleStart} to {selectedWindow.outSampleEnd}
                </div>
              </div>
              <div>
                <div class="text-text-tertiary mb-1">In-Sample Sharpe</div>
                <div class="text-text-primary font-semibold">
                  {formatNumber(selectedWindow.inSampleMetrics.sharpe)}
                </div>
              </div>
              <div>
                <div class="text-text-tertiary mb-1">Out-Sample Sharpe</div>
                <div class="text-text-primary font-semibold">
                  {formatNumber(selectedWindow.outSampleMetrics.sharpe)}
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-text-tertiary mb-1">Degradation</div>
                <div
                  class="font-semibold {selectedWindow.degradationPercent < 20
                    ? 'text-success'
                    : 'text-error'}"
                >
                  {formatNumber(selectedWindow.degradationPercent, 1)}%
                </div>
              </div>
            </div>
          </div>
        {/if}
      {:else if activeTab === 'windows'}
        <WindowResults windows={$walkforward.result.windows} />
      {:else if activeTab === 'equity'}
        <div>
          <h3 class="text-lg font-semibold mb-3 text-text-primary">
            Stitched Out-of-Sample Equity Curve
          </h3>
          <p class="text-sm text-text-secondary mb-4">
            This shows the equity curve created by stitching together all out-of-sample periods. This
            represents how the strategy would have performed in "live" trading.
          </p>
          {#if $walkforward.result.equityCurveStitched.length > 0}
            <EquityCurve data={$walkforward.result.equityCurveStitched} />
          {:else}
            <div class="h-64 flex items-center justify-center bg-surface-secondary rounded-lg">
              <p class="text-text-secondary">No equity curve data available</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

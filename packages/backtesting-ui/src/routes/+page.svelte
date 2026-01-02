<script lang="ts">
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';
    import StrategyList from '$lib/components/strategy/StrategyList.svelte';
    import ParameterForm from '$lib/components/strategy/ParameterForm.svelte';
    import ResultsView from '$lib/components/results/ResultsView.svelte';
    import OptimizationConfig from '$lib/components/optimize/OptimizationConfig.svelte';
    import OptimizationResults from '$lib/components/optimize/OptimizationResults.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import { strategy } from '$lib/stores/strategy.svelte';
    import { backtest } from '$lib/stores/backtest.svelte';
    import { optimization } from '$lib/stores/optimization.svelte';
    import { config } from '$lib/stores/config.svelte';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            // Load persisted config, strategy, and history
            config.load();
            strategy.load();
            backtest.loadHistory();
            optimization.loadHistory();

            // Show welcome toast on app load
            toastStore.info('Backtesting UI loaded successfully!');
        }
    });

    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        // Enter key to run backtest (when not in input/textarea/select)
        if (event.key === 'Enter' && !backtest.isRunning) {
            const target = event.target as HTMLElement;
            const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Only trigger if not in a form element and strategy is selected
            if (!isFormElement && strategy.selectedStrategyId) {
                event.preventDefault();
                // Dispatch custom event that RunBacktestButton will listen to
                window.dispatchEvent(new CustomEvent('run-backtest'));
            }
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />


<div class="h-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <AppHeader />

    <!-- Three-Column Layout -->
    <ThreeColumnLayout>
        {#snippet left()}
            <!-- Left Panel: Strategy Selector -->
            <ErrorBoundary name="Strategy List">
                <StrategyList />
            </ErrorBoundary>
        {/snippet}

        {#snippet center()}
            <!-- Center Panel: Results View (mode-dependent) -->
            {#if ui.mode === 'backtest'}
                <ErrorBoundary name="Results View">
                    <ResultsView />
                </ErrorBoundary>
            {:else if ui.mode === 'optimize'}
                <ErrorBoundary name="Optimization Results">
                    <OptimizationResults />
                </ErrorBoundary>
            {:else}
                <!-- Walk-forward mode (Phase 3) -->
                <div class="h-full flex items-center justify-center p-6">
                    <p class="text-text-secondary">Walk-forward analysis coming in Phase 3</p>
                </div>
            {/if}
        {/snippet}

        {#snippet right()}
            <!-- Right Panel: Config (mode-dependent) -->
            {#if ui.mode === 'backtest'}
                <ErrorBoundary name="Parameter Form">
                    <ParameterForm />
                </ErrorBoundary>
            {:else if ui.mode === 'optimize'}
                <ErrorBoundary name="Optimization Config">
                    <OptimizationConfig />
                </ErrorBoundary>
            {:else}
                <!-- Walk-forward mode (Phase 3) -->
                <div class="h-full flex items-center justify-center p-6">
                    <p class="text-text-secondary">Walk-forward config coming in Phase 3</p>
                </div>
            {/if}
        {/snippet}
    </ThreeColumnLayout>
</div>

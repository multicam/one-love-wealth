<script lang="ts">
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';
    import StrategyList from '$lib/components/strategy/StrategyList.svelte';
    import ParameterForm from '$lib/components/strategy/ParameterForm.svelte';
    import { strategy } from '$lib/stores/strategy.svelte';
    import { backtest } from '$lib/stores/backtest.svelte';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
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
            <StrategyList />
        {/snippet}

        {#snippet center()}
            <!-- Center Panel: Results View -->
            <div class="p-6">
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        {#if strategy.selectedStrategyId}
                            <h2 class="text-2xl font-bold mb-2">
                                {strategy.selectedStrategy?.name}
                            </h2>
                            <p class="text-text-secondary mb-6">
                                {strategy.selectedStrategy?.description}
                            </p>
                            <div class="text-sm text-text-secondary">
                                Configure parameters on the right, then run your backtest
                            </div>
                        {:else}
                            <h2 class="text-2xl font-bold mb-2">Welcome to Backtesting UI</h2>
                            <p class="text-text-secondary">
                                Select a strategy from the left panel to begin
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        {/snippet}

        {#snippet right()}
            <!-- Right Panel: Parameters & Config -->
            <ParameterForm />
        {/snippet}
    </ThreeColumnLayout>
</div>

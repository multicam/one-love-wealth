<script>
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';
    import StrategyList from '$lib/components/strategy/StrategyList.svelte';
    import { strategy } from '$lib/stores/strategy.svelte';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            // Show welcome toast on app load
            toastStore.info('Backtesting UI loaded successfully!');
        }
    });
</script>

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
            <div class="p-4">
                {#if strategy.selectedStrategyId}
                    <h2 class="text-lg font-semibold mb-4">Configuration</h2>
                    <p class="text-sm text-text-secondary">
                        Parameter form will go here
                    </p>
                {:else}
                    <div class="flex items-center justify-center h-full">
                        <p class="text-sm text-text-secondary text-center">
                            Select a strategy to configure parameters
                        </p>
                    </div>
                {/if}
            </div>
        {/snippet}
    </ThreeColumnLayout>
</div>

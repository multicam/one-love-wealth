<script>
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';

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
            <div class="p-4">
                <h2 class="text-lg font-semibold mb-4">Strategies</h2>
                <p class="text-sm text-text-secondary">
                    Strategy selector will go here
                </p>
            </div>
        {/snippet}

        {#snippet center()}
            <!-- Center Panel: Results View -->
            <div class="p-6">
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold mb-2">Welcome to Backtesting UI</h2>
                        <p class="text-text-secondary">
                            Select a strategy from the left panel to begin
                        </p>
                    </div>
                </div>
            </div>
        {/snippet}

        {#snippet right()}
            <!-- Right Panel: Parameters & Config -->
            <div class="p-4">
                <h2 class="text-lg font-semibold mb-4">Configuration</h2>
                <p class="text-sm text-text-secondary">
                    Parameter form will go here
                </p>
            </div>
        {/snippet}
    </ThreeColumnLayout>
</div>

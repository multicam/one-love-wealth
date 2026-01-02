<script lang="ts">
    import { browser } from '$app/environment';
    import PageLayout from '$lib/components/layout/PageLayout.svelte';
    import OptimizationConfig from '$lib/components/optimize/OptimizationConfig.svelte';
    import OptimizationResults from '$lib/components/optimize/OptimizationResults.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
    import { strategy } from '$lib/stores/strategy.svelte';
    import { config } from '$lib/stores/config.svelte';

    // Load persisted state on mount
    $effect(() => {
        if (browser) {
            config.load();
            strategy.load();
        }
    });
</script>

<PageLayout>
    {#snippet centerContent()}
        <ErrorBoundary name="Optimization Results">
            <OptimizationResults />
        </ErrorBoundary>
    {/snippet}

    {#snippet rightContent()}
        <ErrorBoundary name="Optimization Config">
            <OptimizationConfig />
        </ErrorBoundary>
    {/snippet}
</PageLayout>

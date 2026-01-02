<script lang="ts">
    import { onMount } from 'svelte';
    import PageLayout from '$lib/components/layout/PageLayout.svelte';
    import OptimizationConfig from '$lib/components/optimize/OptimizationConfig.svelte';
    import OptimizationResults from '$lib/components/optimize/OptimizationResults.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
    import { strategy } from '$lib/stores/strategy';
    import { config } from '$lib/stores/config';

    // Load persisted state on mount
    onMount(() => {
        config.load();
        strategy.load();
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

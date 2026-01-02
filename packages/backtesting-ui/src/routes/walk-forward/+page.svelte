<script lang="ts">
    import { onMount } from 'svelte';
    import PageLayout from '$lib/components/layout/PageLayout.svelte';
    import WalkForwardConfig from '$lib/components/walkforward/WalkForwardConfig.svelte';
    import WalkForwardResults from '$lib/components/walkforward/WalkForwardResults.svelte';
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
        <ErrorBoundary name="Walk-Forward Results">
            <WalkForwardResults />
        </ErrorBoundary>
    {/snippet}

    {#snippet rightContent()}
        <ErrorBoundary name="Walk-Forward Config">
            <WalkForwardConfig />
        </ErrorBoundary>
    {/snippet}
</PageLayout>

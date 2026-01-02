<script lang="ts">
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import PageLayout from '$lib/components/layout/PageLayout.svelte';
    import ParameterForm from '$lib/components/strategy/ParameterForm.svelte';
    import ResultsView from '$lib/components/results/ResultsView.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
    import { strategy, selectedStrategy } from '$lib/stores/strategy.svelte';
    import { backtest } from '$lib/stores/backtest.svelte';
    import { optimization } from '$lib/stores/optimization.svelte';
    import { walkforward } from '$lib/stores/walkforward.svelte';
    import { config } from '$lib/stores/config.svelte';

    // Load persisted state on mount
    $effect(() => {
        if (browser) {
            config.load();
            strategy.load();
            backtest.loadHistory();
            optimization.loadHistory();
            walkforward.loadHistory();

            toastStore.info('Backtesting UI loaded successfully!');
        }
    });

    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !$backtest.isRunning) {
            const target = event.target as HTMLElement;
            const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
            if (!isFormElement && $selectedStrategy) {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('run-backtest'));
            }
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<PageLayout>
    {#snippet centerContent()}
        <ErrorBoundary name="Results View">
            <ResultsView />
        </ErrorBoundary>
    {/snippet}

    {#snippet rightContent()}
        <ErrorBoundary name="Parameter Form">
            <ParameterForm />
        </ErrorBoundary>
    {/snippet}
</PageLayout>

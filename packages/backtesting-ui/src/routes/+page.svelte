<script lang="ts">
    import { onMount } from "svelte";
    import { toastStore } from "@one-love-wealth/shared-ui";
    import PageLayout from "$lib/components/layout/PageLayout.svelte";
    import ParameterForm from "$lib/components/strategy/ParameterForm.svelte";
    import ResultsView from "$lib/components/results/ResultsView.svelte";
    import ErrorBoundary from "$lib/components/common/ErrorBoundary.svelte";
    import { strategy } from "$lib/stores/strategy";
    import { backtest } from "$lib/stores/backtest";
    import { optimization } from "$lib/stores/optimization";
    import { walkforward } from "$lib/stores/walkforward";
    import { config } from "$lib/stores/config";

    // Load persisted state on mount
    onMount(() => {
        config.load();
        strategy.load();
        backtest.loadHistory();
        optimization.loadHistory();
        walkforward.loadHistory();

        toastStore.info("Backtesting UI loaded successfully!");
    });

    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && !backtest.isRunning) {
            const target = event.target as HTMLElement;
            const isFormElement = ["INPUT", "TEXTAREA", "SELECT"].includes(
                target.tagName,
            );
            if (!isFormElement && strategy.selectedStrategyId) {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent("run-backtest"));
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

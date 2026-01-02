<script lang="ts">
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import StrategyList from '$lib/components/strategy/StrategyList.svelte';
    import ParameterForm from '$lib/components/strategy/ParameterForm.svelte';
    import ResultsView from '$lib/components/results/ResultsView.svelte';
    import OptimizationConfig from '$lib/components/optimize/OptimizationConfig.svelte';
    import OptimizationResults from '$lib/components/optimize/OptimizationResults.svelte';
    import WalkForwardConfig from '$lib/components/walkforward/WalkForwardConfig.svelte';
    import WalkForwardResults from '$lib/components/walkforward/WalkForwardResults.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import { strategy } from '$lib/stores/strategy.svelte';
    import { backtest } from '$lib/stores/backtest.svelte';
    import { optimization } from '$lib/stores/optimization.svelte';
    import { walkforward } from '$lib/stores/walkforward.svelte';
    import { config } from '$lib/stores/config.svelte';

    // Right panel state
    const STORAGE_KEY = 'backtesting-ui:right-panel-width';
    const DEFAULT_WIDTH = 320;
    const MIN_WIDTH = 280;
    const MAX_WIDTH = 500;

    let rightPanelWidth = $state(DEFAULT_WIDTH);
    let isDragging = $state(false);

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            // Load persisted config, strategy, and history
            config.load();
            strategy.load();
            backtest.loadHistory();
            optimization.loadHistory();
            walkforward.loadHistory();

            // Load right panel width
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const width = parseInt(stored, 10);
                if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
                    rightPanelWidth = width;
                }
            }

            // Show welcome toast on app load
            toastStore.info('Backtesting UI loaded successfully!');
        }
    });

    // Handle drag
    function handleMouseDown(event: MouseEvent) {
        event.preventDefault();
        isDragging = true;
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        const newWidth = window.innerWidth - event.clientX;
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        rightPanelWidth = clampedWidth;
        if (browser) {
            localStorage.setItem(STORAGE_KEY, clampedWidth.toString());
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    $effect(() => {
        if (browser) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    });

    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !backtest.isRunning) {
            const target = event.target as HTMLElement;
            const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
            if (!isFormElement && strategy.selectedStrategyId) {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('run-backtest'));
            }
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <AppHeader />

    <!-- Inline Three-Column Layout (No Snippets) -->
    <div class="flex-1 flex overflow-hidden bg-background">
        <!-- Left Column -->
        <div class="w-[200px] flex-shrink-0 border-r border-border overflow-y-auto">
            <ErrorBoundary name="Strategy List">
                <StrategyList />
            </ErrorBoundary>
        </div>

        <!-- Center Column -->
        <div class="flex-1 overflow-y-auto">
            {#if $ui.mode === 'backtest'}
                <ErrorBoundary name="Results View">
                    <ResultsView />
                </ErrorBoundary>
            {:else if $ui.mode === 'optimize'}
                <ErrorBoundary name="Optimization Results">
                    <OptimizationResults />
                </ErrorBoundary>
            {:else if $ui.mode === 'walk-forward'}
                <ErrorBoundary name="Walk-Forward Results">
                    <WalkForwardResults />
                </ErrorBoundary>
            {/if}
        </div>

        <!-- Drag Handle -->
        <div
            class="w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
            class:bg-primary={isDragging}
            onmousedown={handleMouseDown}
        ></div>

        <!-- Right Column -->
        <div
            class="flex-shrink-0 border-l border-border overflow-y-auto"
            style="width: {rightPanelWidth}px;"
        >
            {#if $ui.mode === 'backtest'}
                <ErrorBoundary name="Parameter Form">
                    <ParameterForm />
                </ErrorBoundary>
            {:else if $ui.mode === 'optimize'}
                <ErrorBoundary name="Optimization Config">
                    <OptimizationConfig />
                </ErrorBoundary>
            {:else if $ui.mode === 'walk-forward'}
                <ErrorBoundary name="Walk-Forward Config">
                    <WalkForwardConfig />
                </ErrorBoundary>
            {/if}
        </div>
    </div>
</div>

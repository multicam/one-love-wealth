<script lang="ts">
    import { browser } from '$app/environment';
    import AppHeader from './AppHeader.svelte';
    import StrategyList from '$lib/components/strategy/StrategyList.svelte';
    import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';

    // Right panel width state
    const STORAGE_KEY = 'backtesting-ui:right-panel-width';
    const DEFAULT_WIDTH = 320;
    const MIN_WIDTH = 280;
    const MAX_WIDTH = 500;

    let rightPanelWidth = $state(DEFAULT_WIDTH);
    let isDragging = $state(false);

    // Load persisted width on mount
    $effect(() => {
        if (browser) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const width = parseInt(stored, 10);
                if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
                    rightPanelWidth = width;
                }
            }
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

    interface Props {
        centerContent: import('svelte').Snippet;
        rightContent: import('svelte').Snippet;
    }

    let { centerContent, rightContent }: Props = $props();
</script>

<div class="h-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <AppHeader />

    <!-- Three-Column Layout -->
    <div class="flex-1 flex overflow-hidden bg-background">
        <!-- Left Column: Strategy List -->
        <div class="w-[200px] flex-shrink-0 border-r border-border overflow-y-auto">
            <ErrorBoundary name="Strategy List">
                <StrategyList />
            </ErrorBoundary>
        </div>

        <!-- Center Column: Main Content -->
        <div class="flex-1 overflow-y-auto">
            {@render centerContent()}
        </div>

        <!-- Drag Handle -->
        <div
            class="w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
            class:bg-primary={isDragging}
            onmousedown={handleMouseDown}
        ></div>

        <!-- Right Column: Configuration Panel -->
        <div
            class="flex-shrink-0 border-l border-border overflow-y-auto"
            style="width: {rightPanelWidth}px;"
        >
            {@render rightContent()}
        </div>
    </div>
</div>

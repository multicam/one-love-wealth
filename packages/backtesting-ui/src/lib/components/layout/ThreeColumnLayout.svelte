<script lang="ts">
    import { browser } from '$app/environment';

    // Props for slot content
    let { left, center, right } = $props();

    // Right panel state (Svelte 5 runes)
    const STORAGE_KEY = 'backtesting-ui:right-panel-width';
    const DEFAULT_WIDTH = 320;
    const MIN_WIDTH = 280;
    const MAX_WIDTH = 500;

    let rightPanelWidth = $state(DEFAULT_WIDTH);
    let isDragging = $state(false);

    // Load persisted width from localStorage
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

    // Save width to localStorage (debounced via requestAnimationFrame)
    function saveWidth(width: number) {
        if (browser) {
            requestAnimationFrame(() => {
                localStorage.setItem(STORAGE_KEY, width.toString());
            });
        }
    }

    // Handle drag start
    function handleMouseDown(event: MouseEvent) {
        event.preventDefault();
        isDragging = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    // Handle drag move
    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;

        // Calculate new width based on distance from right edge
        const newWidth = window.innerWidth - event.clientX;

        // Clamp to min/max
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

        rightPanelWidth = clampedWidth;
        saveWidth(clampedWidth);
    }

    // Handle drag end
    function handleMouseUp() {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }

    // Attach global event listeners for drag
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
</script>

<div class="h-screen flex overflow-hidden bg-background">
    <!-- Left Column (Fixed 200px) -->
    <div class="w-[200px] flex-shrink-0 border-r border-border overflow-y-auto">
        {@render left?.()}
    </div>

    <!-- Center Column (Flexible) -->
    <div class="flex-1 overflow-y-auto">
        {@render center?.()}
    </div>

    <!-- Drag Handle -->
    <div
        role="separator"
        aria-label="Resize right panel"
        aria-orientation="vertical"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={rightPanelWidth}
        class="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors relative group"
        class:bg-primary={isDragging}
        onmousedown={handleMouseDown}
    >
        <!-- Visual feedback on hover -->
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
            <div class="w-0.5 h-8 bg-border group-hover:bg-primary/70 rounded-full transition-colors"></div>
        </div>
    </div>

    <!-- Right Column (Resizable) -->
    <div
        class="flex-shrink-0 border-l border-border overflow-y-auto"
        style="width: {rightPanelWidth}px;"
    >
        {@render right?.()}
    </div>
</div>

<style>
    /* Prevent text selection while dragging */
    :global(body.dragging) {
        user-select: none;
        cursor: col-resize !important;
    }
</style>

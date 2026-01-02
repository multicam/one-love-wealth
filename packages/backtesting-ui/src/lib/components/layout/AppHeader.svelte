<script lang="ts">
    import { ui, type AppMode } from '$lib/stores/ui.svelte';
    import { backtest } from '$lib/stores/backtest.svelte';
    import { optimization } from '$lib/stores/optimization.svelte';

    // Derived state: is any operation currently loading?
    const isAnyLoading = $derived(
        backtest.isRunning || optimization.isRunning
    );

    // Handle mode switch
    function switchMode(newMode: AppMode) {
        ui.setMode(newMode);

        // Clear results when switching modes (Q14 decision)
        backtest.clearResult();
        optimization.clearResult();
    }

    const modes: { value: AppMode; label: string }[] = [
        { value: 'backtest', label: 'Backtest' },
        { value: 'optimize', label: 'Optimize' },
        { value: 'validate', label: 'Walk-Forward' }
    ];
</script>

<header class="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
    <!-- Logo/Title -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
                class="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        </div>
        <div>
            <h1 class="text-lg font-semibold text-text-primary">Backtesting UI</h1>
            <p class="text-xs text-text-secondary">Strategy Analysis & Optimization</p>
        </div>
    </div>

    <!-- Mode Tabs -->
    <nav class="flex gap-1 bg-background rounded-lg p-1">
        {#each modes as { value, label }}
            <button
                type="button"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                class:bg-primary={ui.mode === value}
                class:text-white={ui.mode === value}
                class:text-text-secondary={ui.mode !== value}
                class:hover:text-text-primary={ui.mode !== value}
                class:hover:bg-surface={ui.mode !== value}
                onclick={() => switchMode(value)}
            >
                {label}
            </button>
        {/each}
    </nav>

    <!-- Right Section: Loading Indicator & Settings -->
    <div class="flex items-center gap-4">
        <!-- Global Loading Indicator -->
        {#if isAnyLoading}
            <div class="flex items-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
            </div>
        {/if}

        <!-- Settings Button (Future) -->
        <button
            type="button"
            class="w-10 h-10 rounded-lg hover:bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            title="Settings (Coming Soon)"
            disabled
        >
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        </button>
    </div>
</header>

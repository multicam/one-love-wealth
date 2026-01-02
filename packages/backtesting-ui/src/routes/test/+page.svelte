<script lang="ts">
    import { browser } from '$app/environment';
    import { toastStore } from '@one-love-wealth/shared-ui';
    import AppHeader from '$lib/components/layout/AppHeader.svelte';
    import WalkForwardConfig from '$lib/components/walkforward/WalkForwardConfig.svelte';
    import WalkForwardResults from '$lib/components/walkforward/WalkForwardResults.svelte';
    import { ui } from '$lib/stores/ui';
    import { strategy } from '$lib/stores/strategy';
    import { backtest } from '$lib/stores/backtest';
    import { optimization } from '$lib/stores/optimization';
    import { walkforward } from '$lib/stores/walkforward';
    import { config } from '$lib/stores/config';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            config.load();
            strategy.load();
            backtest.loadHistory();
            optimization.loadHistory();
            walkforward.loadHistory();
            toastStore.info('Test page loaded!');
        }
    });

    // Debug: log mode changes
    $effect(() => {
        console.log('[TEST PAGE] $ui.mode =', $ui.mode);
    });
</script>

<div class="h-screen flex flex-col overflow-hidden bg-background text-text-primary">
    <!-- Header -->
    <AppHeader />

    <!-- Simple test: render based on mode WITHOUT snippets -->
    <div class="flex-1 flex overflow-hidden">
        <div class="w-64 bg-surface-secondary p-4 overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">Test Debug Panel</h2>
            <div class="space-y-2 text-sm">
                <p><strong>Current Mode:</strong></p>
                <p class="text-2xl font-bold text-primary">{$ui.mode}</p>
                <hr class="my-4 border-border" />
                <p><strong>Expected:</strong> walk-forward</p>
                <p><strong>Test:</strong> Click Walk-Forward button</p>
            </div>
        </div>

        <div class="flex-1 bg-surface-primary p-4 overflow-y-auto border-l border-r border-border">
            <h2 class="text-xl font-bold mb-4">Center Panel Test</h2>

            {#if $ui.mode === 'walk-forward'}
                <div class="border-4 border-green-500 p-4 rounded-lg">
                    <h3 class="text-2xl font-bold text-green-500 mb-4">✅ WALK-FORWARD MODE ACTIVE!</h3>
                    <p class="mb-4">If you see this, reactivity is working!</p>
                    <WalkForwardResults />
                </div>
            {:else if $ui.mode === 'optimize'}
                <div class="border-4 border-blue-500 p-4 rounded-lg">
                    <h3 class="text-2xl font-bold text-blue-500">OPTIMIZE MODE</h3>
                </div>
            {:else}
                <div class="border-4 border-red-500 p-4 rounded-lg">
                    <h3 class="text-2xl font-bold text-red-500">❌ BACKTEST MODE (or other)</h3>
                    <p class="mt-2">Current mode: {$ui.mode}</p>
                </div>
            {/if}
        </div>

        <div class="w-80 bg-surface-tertiary p-4 overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">Right Panel Test</h2>

            {#if $ui.mode === 'walk-forward'}
                <div class="border-4 border-green-500 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-green-500 mb-4">✅ CONFIG VISIBLE</h3>
                    <WalkForwardConfig />
                </div>
            {:else}
                <div class="border-4 border-red-500 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-red-500">❌ Wrong mode: {$ui.mode}</h3>
                </div>
            {/if}
        </div>
    </div>
</div>

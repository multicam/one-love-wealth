<script>
    import { settings } from '$lib/stores/settings.js';
    import { loadCryptoData } from '$lib/stores/crypto.js';
    import { TIMEFRAMES, getAvailableIntervals, getDefaultInterval } from '$lib/utils/constants.js';

    function selectTimeframe(days) {
        const defaultInterval = getDefaultInterval($settings.dataSource, days);
        settings.update(s => ({ ...s, timeframe: days, interval: defaultInterval?.id || null }));
        loadCryptoData();
    }

    function selectInterval(intervalId) {
        settings.update(s => ({ ...s, interval: intervalId }));
        loadCryptoData();
    }

    $: availableIntervals = getAvailableIntervals($settings.dataSource, $settings.timeframe);
    $: currentInterval = availableIntervals.find(i => i.id === $settings.interval) || availableIntervals[0];
</script>

<div class="flex flex-col gap-2">
    <div class="flex items-center gap-3">
        <span class="text-xs text-text-secondary w-16">Range:</span>
        <div class="flex flex-wrap gap-1">
            {#each TIMEFRAMES as tf}
                <button
                    class="px-2 py-1 text-xs rounded transition-colors
                           {$settings.timeframe === tf.days 
                               ? 'bg-accent text-white' 
                               : 'bg-surface-light text-text-secondary hover:text-text-primary'}"
                    on:click={() => selectTimeframe(tf.days)}
                    title="{tf.label}"
                >
                    {tf.label}
                </button>
            {/each}
        </div>
    </div>
    {#if availableIntervals.length > 1}
        <div class="flex items-center gap-3">
            <span class="text-xs text-text-secondary w-16">Candle:</span>
            <div class="flex flex-wrap gap-1">
                {#each availableIntervals as interval}
                    <button
                        class="px-2 py-1 text-xs rounded transition-colors
                               {$settings.interval === interval.id || (!$settings.interval && interval === availableIntervals[0])
                                   ? 'bg-accent text-white' 
                                   : 'bg-surface-light text-text-secondary hover:text-text-primary'}"
                        on:click={() => selectInterval(interval.id)}
                    >
                        {interval.label}
                    </button>
                {/each}
            </div>
        </div>
    {:else if currentInterval}
        <div class="flex items-center gap-3">
            <span class="text-xs text-text-secondary w-16">Candle:</span>
            <span class="text-xs text-text-primary">{currentInterval.label}</span>
        </div>
    {/if}
</div>

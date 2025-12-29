<script>
    import { ohlcData, selectedCrypto, lastUpdated, isLoading } from '$lib/stores/crypto.js';
    import { SUPPORTED_CRYPTOS, TIMEFRAMES, DATA_SOURCES, getAvailableIntervals } from '$lib/utils/constants.js';
    import { settings } from '$lib/stores/settings.js';
    import { derived } from 'svelte/store';

    $: currentTimeframe = TIMEFRAMES.find(tf => tf.days === $settings.timeframe) || TIMEFRAMES[3];
    $: currentSource = DATA_SOURCES[$settings.dataSource] || DATA_SOURCES.coingecko;
    $: availableIntervals = getAvailableIntervals($settings.dataSource, $settings.timeframe);
    $: currentInterval = availableIntervals.find(i => i.id === $settings.interval) || availableIntervals[0];

    const tickerData = derived(ohlcData, ($ohlcData) => {
        if (!$ohlcData || $ohlcData.length === 0) {
            return null;
        }

        const latest = $ohlcData[$ohlcData.length - 1];
        const first = $ohlcData[0];
        
        // Calculate stats from the data range
        let high = -Infinity;
        let low = Infinity;
        let volume = 0;
        
        for (const candle of $ohlcData) {
            if (candle.high > high) high = candle.high;
            if (candle.low < low) low = candle.low;
        }

        const open = first.open;
        const close = latest.close;
        const change = close - open;
        const changePercent = ((change / open) * 100).toFixed(2);

        return {
            open,
            high,
            low,
            close,
            change,
            changePercent,
            isPositive: change >= 0
        };
    });

    const cryptoName = derived(selectedCrypto, ($selectedCrypto) => {
        const crypto = SUPPORTED_CRYPTOS.find(c => c.id === $selectedCrypto);
        return crypto ? crypto.name : $selectedCrypto;
    });

    function formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (price >= 1) {
            return price.toFixed(2);
        } else {
            return price.toFixed(4);
        }
    }

    function formatTime(date) {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
</script>

<div class="flex items-center gap-6 px-4 py-2 bg-surface border-b border-border text-sm">
    {#if $isLoading}
        <span class="text-text-secondary">Loading...</span>
    {:else if $tickerData}
        <div class="flex items-center gap-2">
            <span class="text-text-secondary">O:</span>
            <span class="text-text-primary font-mono">${formatPrice($tickerData.open)}</span>
        </div>
        
        <div class="flex items-center gap-2">
            <span class="text-text-secondary">H:</span>
            <span class="text-green-400 font-mono">${formatPrice($tickerData.high)}</span>
        </div>
        
        <div class="flex items-center gap-2">
            <span class="text-text-secondary">L:</span>
            <span class="text-red-400 font-mono">${formatPrice($tickerData.low)}</span>
        </div>
        
        <div class="flex items-center gap-2">
            <span class="text-text-secondary">C:</span>
            <span class="text-text-primary font-mono">${formatPrice($tickerData.close)}</span>
        </div>
        
        <div class="flex items-center gap-2">
            <span class="text-text-secondary">Chg:</span>
            <span class="font-mono {$tickerData.isPositive ? 'text-green-400' : 'text-red-400'}">
                {$tickerData.isPositive ? '+' : ''}{formatPrice($tickerData.change)} ({$tickerData.changePercent}%)
            </span>
        </div>

        <div class="ml-auto flex items-center gap-4 text-text-secondary">
            <span class="text-xs">{currentSource.name} • {currentTimeframe.label} • {currentInterval?.label || 'auto'}</span>
            {#if $lastUpdated}
                <span class="text-xs">Updated: {formatTime($lastUpdated)}</span>
            {/if}
        </div>
    {:else}
        <span class="text-text-secondary">No data</span>
    {/if}
</div>

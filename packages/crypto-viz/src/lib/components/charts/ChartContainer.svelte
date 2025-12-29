<script>
    import { onMount } from 'svelte';
    import CandlestickChart from './CandlestickChart.svelte';
    import IndicatorChart from './IndicatorChart.svelte';
    import KalmanChart from './KalmanChart.svelte';
    import Spinner from '$lib/components/common/Spinner.svelte';
    import { ohlcData, isLoading, error, loadCryptoData } from '$lib/stores/crypto.js';
    import { stochasticData, stochasticRSIData, kalmanData } from '$lib/stores/indicators.js';
    import { settings } from '$lib/stores/settings.js';

    let isDragging = false;
    let startY = 0;
    let startHeight = 0;

    onMount(() => {
        console.log('ChartContainer mounted, loading data...');
        loadCryptoData();
    });

    function handleResizeStart(e) {
        isDragging = true;
        startY = e.clientY;
        startHeight = $settings.candlestickHeight || 400;
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
        e.preventDefault();
    }

    function handleResizeMove(e) {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
        settings.update(s => ({ ...s, candlestickHeight: newHeight }));
    }

    function handleResizeEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    }

    // Debug: log when data changes
    $: console.log('ohlcData changed:', $ohlcData?.length, 'points');
    $: console.log('stochasticData changed:', $stochasticData?.length, 'points');
</script>

<div class="space-y-2">
    {#if $isLoading}
        <div class="h-[400px] flex items-center justify-center bg-surface rounded-lg">
            <div class="flex flex-col items-center gap-3">
                <Spinner size={32} />
                <span class="text-text-secondary text-sm">Loading chart data...</span>
            </div>
        </div>
    {:else if $error}
        <div class="h-[400px] flex items-center justify-center bg-surface rounded-lg">
            <div class="text-danger">{$error}</div>
        </div>
    {:else if $ohlcData && $ohlcData.length > 0}
        <div class="relative">
            {#key $ohlcData.length}
                <CandlestickChart data={$ohlcData} height={$settings.candlestickHeight || 400} />
            {/key}
            <div 
                class="absolute -bottom-5 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center group z-10"
                on:mousedown={handleResizeStart}
                role="separator"
                aria-orientation="horizontal"
                tabindex="0"
            >
                <div class="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-light border border-border group-hover:bg-accent group-hover:border-accent transition-colors">
                    <svg class="w-4 h-4 text-text-secondary group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
                    </svg>
                    <span class="text-xs text-text-secondary group-hover:text-white select-none">Drag</span>
                </div>
            </div>
        </div>
        
        {#if $settings?.indicators?.stochastic?.enabled && $stochasticData?.length > 0}
            {#key $stochasticData.length}
                <IndicatorChart 
                    data={$stochasticData} 
                    title="Stochastic" 
                    height={150}
                />
            {/key}
        {/if}
        
        {#if $settings?.indicators?.stochasticRSI?.enabled && $stochasticRSIData?.length > 0}
            <IndicatorChart 
                data={$stochasticRSIData} 
                title="Stochastic RSI" 
                height={150}
            />
        {/if}
        
        {#if $settings?.indicators?.kalman?.enabled && $kalmanData?.length > 0}
            <KalmanChart 
                data={$kalmanData} 
                height={200}
            />
        {/if}
    {:else}
        <div class="h-[400px] flex items-center justify-center bg-surface rounded-lg">
            <div class="text-text-secondary">No data available</div>
        </div>
    {/if}
</div>

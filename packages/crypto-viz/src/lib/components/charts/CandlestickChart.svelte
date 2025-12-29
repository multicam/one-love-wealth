<script>
    import { browser } from '$app/environment';
    import { createChart } from 'lightweight-charts';
    import { crosshairPosition, visibleTimeRange } from '$lib/stores/ui.js';
    import { chartMarkers } from '$lib/stores/events.js';

    /**
     * @typedef {import('lightweight-charts').IChartApi} IChartApi
     * @typedef {import('lightweight-charts').ISeriesApi<'Candlestick'>} ICandlestickSeriesApi
     * @typedef {import('lightweight-charts').Time} Time
     */

    let { data = [], height = 400 } = $props();

    /** @type {HTMLDivElement | undefined} */
    let chartContainer;
    /** @type {IChartApi | null} */
    let chart = null;
    /** @type {ICandlestickSeriesApi | null} */
    let candlestickSeries = null;
    /** @type {ResizeObserver | null} */
    let resizeObserver = null;
    let initialized = false;
    /** @type {(() => void) | null} */
    let unsubscribeTimeRange = null;
    /** @type {(() => void) | null} */
    let unsubscribeCrosshair = null;
    let isUpdatingTimeRange = false;

    function initChart() {
        if (!browser || !chartContainer || initialized) return;
        
        const containerWidth = chartContainer.clientWidth || chartContainer.offsetWidth || 800;
        console.log('CandlestickChart: Creating chart with width', containerWidth);
        
        chart = createChart(chartContainer, {
            width: containerWidth,
            height,
            layout: {
                background: { color: '#1a1a2e' },
                textColor: '#d1d5db',
                attributionLogo: false
            },
            grid: {
                vertLines: { color: '#2d2d44' },
                horzLines: { color: '#2d2d44' }
            },
            crosshair: {
                mode: 1
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#2d2d44'
            },
            rightPriceScale: {
                borderColor: '#2d2d44'
            }
        });

        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444'
        });

        chart.subscribeCrosshairMove((param) => {
            if (param.time !== undefined) {
                crosshairPosition.set({ time: /** @type {number} */ (param.time), price: param.point?.y ?? null });
            }
        });

        // Sync crosshair from indicator charts
        unsubscribeCrosshair = crosshairPosition.subscribe((pos) => {
            if (pos && pos.time && chart && candlestickSeries) {
                try {
                    chart.setCrosshairPosition(pos.price ?? 0, /** @type {Time} */ (pos.time), candlestickSeries);
                } catch (e) {
                    // Ignore errors when time is not in visible range
                }
            }
        });

        // Publish time range changes to sync other charts
        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && !isUpdatingTimeRange) {
                visibleTimeRange.set({ from: /** @type {number} */ (range.from), to: /** @type {number} */ (range.to) });
            }
        });

        // Subscribe to time range changes from other charts
        unsubscribeTimeRange = visibleTimeRange.subscribe((range) => {
            if (range && chart && !isUpdatingTimeRange) {
                isUpdatingTimeRange = true;
                try {
                    chart.timeScale().setVisibleRange({ from: /** @type {Time} */ (range.from), to: /** @type {Time} */ (range.to) });
                } catch (e) {
                    // Ignore errors from invalid ranges
                }
                isUpdatingTimeRange = false;
            }
        });

        resizeObserver = new ResizeObserver(() => {
            if (chart && chartContainer) {
                chart.applyOptions({ width: chartContainer.clientWidth });
            }
        });
        resizeObserver.observe(chartContainer);
        
        initialized = true;
        
        // Set initial data if available
        if (data.length > 0) {
            candlestickSeries.setData(data);
            chart.timeScale().fitContent();
        }
    }

    // Svelte 5: Initialize chart when container is bound
    $effect(() => {
        if (browser && chartContainer && !initialized) {
            initChart();
        }
    });

    // Svelte 5: Update data reactively
    $effect(() => {
        if (candlestickSeries && data && data.length > 0) {
            console.log('CandlestickChart: Setting data', data.length, 'points');
            candlestickSeries.setData(data);
            chart?.timeScale().fitContent();
        }
    });

    // Svelte 5: Update markers reactively
    $effect(() => {
        if (candlestickSeries && $chartMarkers) {
            candlestickSeries.setMarkers(/** @type {import('lightweight-charts').SeriesMarker<Time>[]} */ ($chartMarkers));
        }
    });

    // Svelte 5: Update height reactively
    $effect(() => {
        if (chart && height) {
            chart.applyOptions({ height });
        }
    });

    // Svelte 5: Cleanup on destroy
    $effect(() => {
        return () => {
            if (unsubscribeCrosshair) {
                unsubscribeCrosshair();
                unsubscribeCrosshair = null;
            }
            if (unsubscribeTimeRange) {
                unsubscribeTimeRange();
                unsubscribeTimeRange = null;
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            if (chart) {
                chart.remove();
                chart = null;
                candlestickSeries = null;
            }
            initialized = false;
        };
    });
</script>

<div class="bg-surface rounded-lg overflow-hidden w-full">
    <div bind:this={chartContainer} class="w-full" style="height: {height}px; min-width: 300px;"></div>
</div>

<script>
    import { browser } from '$app/environment';
    import { createChart } from 'lightweight-charts';
    import { crosshairPosition, visibleTimeRange } from '$lib/stores/ui.js';
    import { resizeObserver } from '@splendidlabz/utils/dom';

    /**
     * @typedef {import('lightweight-charts').IChartApi} IChartApi
     * @typedef {import('lightweight-charts').ISeriesApi<'Line'>} ILineSeriesApi
     * @typedef {import('lightweight-charts').Time} Time
     */

    let { data = [], title = '', height = 150 } = $props();

    /** @type {HTMLDivElement | undefined} */
    let chartContainer;
    /** @type {IChartApi | null} */
    let chart = null;
    /** @type {ILineSeriesApi | null} */
    let kSeries = null;
    /** @type {ILineSeriesApi | null} */
    let dSeries = null;
    /** @type {ReturnType<typeof resizeObserver> | null} */
    let resizeObs = null;
    let initialized = false;
    /** @type {(() => void) | null} */
    let unsubscribeCrosshair = null;
    /** @type {(() => void) | null} */
    let unsubscribeTimeRange = null;
    let isUpdatingTimeRange = false;

    function initChart() {
        if (!browser || !chartContainer || initialized) return;
        
        const containerWidth = chartContainer.clientWidth || chartContainer.offsetWidth || 800;
        console.log('IndicatorChart: Creating chart with width', containerWidth);
        
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
                borderColor: '#2d2d44',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            }
        });

        kSeries = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 1,
            title: '%K'
        });

        dSeries = chart.addLineSeries({
            color: '#f59e0b',
            lineWidth: 1,
            title: '%D'
        });

        // Add reference lines at 20 and 80
        chart.addLineSeries({
            color: '#22c55e',
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false
        });

        chart.addLineSeries({
            color: '#ef4444',
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false
        });

        chart.subscribeCrosshairMove((param) => {
            if (param.time !== undefined) {
                crosshairPosition.set({ time: /** @type {number} */ (param.time), price: param.point?.y ?? null });
            }
        });

        // Sync crosshair from other charts
        unsubscribeCrosshair = crosshairPosition.subscribe((pos) => {
            if (pos && pos.time && chart && kSeries) {
                try {
                    chart.setCrosshairPosition(pos.price ?? 0, /** @type {Time} */ (pos.time), kSeries);
                } catch (e) {
                    // Ignore errors when time is not in visible range or series has no data
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

        resizeObs = resizeObserver(chartContainer, {
            callback: () => {
                if (chart && chartContainer) {
                    chart.applyOptions({ width: chartContainer.clientWidth });
                }
            }
        });
        
        initialized = true;

        if (data.length > 0) {
            updateData(data);
        }
    }

    /** @param {Array<{time: number, k: number, d: number}>} newData */
    function updateData(newData) {
        if (!kSeries || !dSeries) return;
        
        const kData = newData.map((d) => ({ time: /** @type {Time} */ (d.time), value: d.k }));
        const dData = newData.map((d) => ({ time: /** @type {Time} */ (d.time), value: d.d }));
        
        kSeries.setData(kData);
        dSeries.setData(dData);
        chart?.timeScale().fitContent();
    }

    // Svelte 5: Initialize chart when container is bound
    $effect(() => {
        if (browser && chartContainer && !initialized) {
            initChart();
        }
    });

    // Svelte 5: Update data reactively
    $effect(() => {
        if (kSeries && dSeries && data && data.length > 0) {
            console.log('IndicatorChart: Setting data', data.length, 'points');
            updateData(data);
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
            if (resizeObs) {
                resizeObs.disconnect();
                resizeObs = null;
            }
            if (chart) {
                chart.remove();
                chart = null;
                kSeries = null;
                dSeries = null;
            }
            initialized = false;
        };
    });
</script>

<div class="bg-surface rounded-lg overflow-hidden w-full">
    <div class="px-3 py-1 text-xs text-text-secondary border-b border-border">{title}</div>
    <div bind:this={chartContainer} class="w-full" style="height: {height}px; min-width: 300px;"></div>
</div>

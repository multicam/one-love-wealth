<script>
    import { browser } from '$app/environment';
    import { createChart } from 'lightweight-charts';
    import { crosshairPosition, visibleTimeRange } from '$lib/stores/ui.js';

    let { data = [], title = '', height = 150 } = $props();

    let chartContainer;
    let chart = null;
    let kSeries = null;
    let dSeries = null;
    let resizeObserver = null;
    let initialized = false;
    let unsubscribeCrosshair = null;
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
            if (param.time) {
                crosshairPosition.set({ time: param.time, price: param.point?.y });
            }
        });

        // Sync crosshair from other charts
        unsubscribeCrosshair = crosshairPosition.subscribe((pos) => {
            if (pos && pos.time && chart && kSeries) {
                try {
                    chart.setCrosshairPosition(pos.price || 0, pos.time, kSeries);
                } catch (e) {
                    // Ignore errors when time is not in visible range or series has no data
                }
            }
        });

        // Publish time range changes to sync other charts
        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && !isUpdatingTimeRange) {
                visibleTimeRange.set(range);
            }
        });

        // Subscribe to time range changes from other charts
        unsubscribeTimeRange = visibleTimeRange.subscribe((range) => {
            if (range && chart && !isUpdatingTimeRange) {
                isUpdatingTimeRange = true;
                try {
                    chart.timeScale().setVisibleRange(range);
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

        if (data.length > 0) {
            updateData(data);
        }
    }

    function updateData(newData) {
        if (!kSeries || !dSeries) return;
        
        const kData = newData.map(d => ({ time: d.time, value: d.k }));
        const dData = newData.map(d => ({ time: d.time, value: d.d }));
        
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
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
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

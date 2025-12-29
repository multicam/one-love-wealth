<script>
    import { browser } from '$app/environment';
    import { createChart } from 'lightweight-charts';
    import { crosshairPosition, visibleTimeRange } from '$lib/stores/ui.js';

    let { data = [], height = 200 } = $props();

    let chartContainer;
    let chart = null;
    let priceSeries = null;
    let filteredSeries = null;
    let resizeObserver = null;
    let initialized = false;
    let unsubscribeCrosshair = null;
    let unsubscribeTimeRange = null;
    let isUpdatingTimeRange = false;
    let markers = [];

    function initChart() {
        if (!browser || !chartContainer || initialized) return;
        
        const containerWidth = chartContainer.clientWidth || chartContainer.offsetWidth || 800;
        console.log('KalmanChart: Creating chart with width', containerWidth);
        
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

        priceSeries = chart.addLineSeries({
            color: '#6b7280',
            lineWidth: 1,
            title: 'Price',
            priceLineVisible: false,
            lastValueVisible: false
        });

        filteredSeries = chart.addLineSeries({
            color: '#8b5cf6',
            lineWidth: 2,
            title: 'Kalman'
        });

        chart.subscribeCrosshairMove((param) => {
            if (param.time) {
                crosshairPosition.set({ time: param.time, price: param.point?.y });
            }
        });

        unsubscribeCrosshair = crosshairPosition.subscribe((pos) => {
            if (pos && pos.time && chart && priceSeries) {
                try {
                    chart.setCrosshairPosition(pos.price || 0, pos.time, priceSeries);
                } catch (e) {
                }
            }
        });

        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && !isUpdatingTimeRange) {
                visibleTimeRange.set(range);
            }
        });

        unsubscribeTimeRange = visibleTimeRange.subscribe((range) => {
            if (range && chart && !isUpdatingTimeRange) {
                isUpdatingTimeRange = true;
                try {
                    chart.timeScale().setVisibleRange(range);
                } catch (e) {
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
        if (!priceSeries || !filteredSeries) return;
        
        const priceData = newData.map(d => ({ time: d.time, value: d.price }));
        const filteredData = newData.map(d => ({ time: d.time, value: d.filtered }));
        
        priceSeries.setData(priceData);
        filteredSeries.setData(filteredData);
        
        // Add markers for crossovers
        markers = newData
            .filter(d => d.crossover !== null)
            .map(d => ({
                time: d.time,
                position: d.crossover === 'up' ? 'belowBar' : 'aboveBar',
                color: d.crossover === 'up' ? '#22c55e' : '#ef4444',
                shape: d.crossover === 'up' ? 'arrowUp' : 'arrowDown',
                text: d.crossover === 'up' ? '↑' : '↓'
            }));
        
        filteredSeries.setMarkers(markers);
        chart?.timeScale().fitContent();
    }

    $effect(() => {
        if (browser && chartContainer && !initialized) {
            initChart();
        }
    });

    $effect(() => {
        if (priceSeries && filteredSeries && data && data.length > 0) {
            console.log('KalmanChart: Setting data', data.length, 'points');
            updateData(data);
        }
    });

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
                priceSeries = null;
                filteredSeries = null;
            }
            initialized = false;
        };
    });

    let upCrossovers = $derived(data.filter(d => d.crossover === 'up').length);
    let downCrossovers = $derived(data.filter(d => d.crossover === 'down').length);
</script>

<div class="bg-surface rounded-lg overflow-hidden w-full">
    <div class="px-3 py-1 text-xs text-text-secondary border-b border-border flex justify-between items-center">
        <span>Kalman Filter</span>
        <span class="flex gap-3">
            <span class="text-green-400">↑ {upCrossovers}</span>
            <span class="text-red-400">↓ {downCrossovers}</span>
        </span>
    </div>
    <div bind:this={chartContainer} class="w-full" style="height: {height}px; min-width: 300px;"></div>
</div>

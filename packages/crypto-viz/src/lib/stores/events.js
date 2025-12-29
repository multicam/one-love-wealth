import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { stochasticData, stochasticRSIData } from './indicators.js';
import { detectCrossover, detectThreshold, createEvent } from '$lib/services/eventService.js';
import { saveEvents, loadEvents } from '$lib/services/storageService.js';

function createEventsStore() {
    const initial = browser ? loadEvents() : [];
    const { subscribe, set, update } = writable(initial);

    return {
        subscribe,
        set: (value) => {
            set(value);
            if (browser) saveEvents(value);
        },
        update: (fn) => {
            update(fn);
            if (browser) saveEvents(get({ subscribe }));
        },
        add: (event) => {
            update(events => [...events, event]);
        },
        remove: (id) => {
            update(events => events.filter(e => e.id !== id));
        },
        clear: () => {
            set([]);
            if (browser) saveEvents([]);
        }
    };
}

export const strategyEvents = createEventsStore();

// Auto-detect events based on indicator data
export const detectedEvents = derived(
    [stochasticData, stochasticRSIData],
    ([$stoch, $stochRSI]) => {
        const events = [];

        if ($stoch.length > 0) {
            // Stochastic %K crosses above %D (bullish)
            const bullishCross = detectCrossover($stoch, 'above');
            if (bullishCross.length > 0) {
                events.push({
                    type: 'crossover',
                    indicator: 'Stochastic',
                    name: '%K crosses above %D',
                    signal: 'bullish',
                    timestamps: bullishCross
                });
            }

            // Stochastic %K crosses below %D (bearish)
            const bearishCross = detectCrossover($stoch, 'below');
            if (bearishCross.length > 0) {
                events.push({
                    type: 'crossover',
                    indicator: 'Stochastic',
                    name: '%K crosses below %D',
                    signal: 'bearish',
                    timestamps: bearishCross
                });
            }

            // Oversold exit (crosses above 20)
            const oversoldExit = detectThreshold($stoch, 20, 'above', 'k');
            if (oversoldExit.length > 0) {
                events.push({
                    type: 'threshold',
                    indicator: 'Stochastic',
                    name: '%K exits oversold (>20)',
                    signal: 'bullish',
                    timestamps: oversoldExit
                });
            }

            // Overbought exit (crosses below 80)
            const overboughtExit = detectThreshold($stoch, 80, 'below', 'k');
            if (overboughtExit.length > 0) {
                events.push({
                    type: 'threshold',
                    indicator: 'Stochastic',
                    name: '%K exits overbought (<80)',
                    signal: 'bearish',
                    timestamps: overboughtExit
                });
            }
        }

        if ($stochRSI.length > 0) {
            // StochRSI bullish crossover
            const rsiCrossUp = detectCrossover($stochRSI, 'above');
            if (rsiCrossUp.length > 0) {
                events.push({
                    type: 'crossover',
                    indicator: 'StochRSI',
                    name: '%K crosses above %D',
                    signal: 'bullish',
                    timestamps: rsiCrossUp
                });
            }

            // StochRSI bearish crossover
            const rsiCrossDown = detectCrossover($stochRSI, 'below');
            if (rsiCrossDown.length > 0) {
                events.push({
                    type: 'crossover',
                    indicator: 'StochRSI',
                    name: '%K crosses below %D',
                    signal: 'bearish',
                    timestamps: rsiCrossDown
                });
            }
        }

        return events;
    }
);

// Flatten all detected events into chart markers
export const chartMarkers = derived(
    [detectedEvents],
    ([$events]) => {
        const markers = [];

        for (const event of $events) {
            for (const time of event.timestamps) {
                markers.push({
                    time,
                    position: event.signal === 'bullish' ? 'belowBar' : 'aboveBar',
                    color: event.signal === 'bullish' ? '#22c55e' : '#ef4444',
                    shape: event.signal === 'bullish' ? 'arrowUp' : 'arrowDown',
                    text: `${event.indicator}: ${event.name}`
                });
            }
        }

        // Sort by time
        markers.sort((a, b) => a.time - b.time);

        return markers;
    }
);

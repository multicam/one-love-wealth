import { derived } from 'svelte/store';
import { ohlcData } from './crypto.js';
import { settings } from './settings.js';
import { calculateStochastic } from '$lib/indicators/stochastic.js';
import { calculateStochasticRSI } from '$lib/indicators/stochasticRSI.js';
import { calculateKalman } from '$lib/indicators/kalman.js';
import { DEFAULT_SETTINGS } from '$lib/utils/constants.js';

export const stochasticData = derived(
    [ohlcData, settings],
    ([$ohlc, $settings]) => {
        if (!$ohlc?.length) return [];
        const stochSettings = $settings?.indicators?.stochastic ?? DEFAULT_SETTINGS.indicators.stochastic;
        if (!stochSettings.enabled) return [];
        const { kPeriod, dPeriod, smooth } = stochSettings;
        return calculateStochastic($ohlc, kPeriod, dPeriod, smooth);
    }
);

export const stochasticRSIData = derived(
    [ohlcData, settings],
    ([$ohlc, $settings]) => {
        if (!$ohlc?.length) return [];
        const rsiSettings = $settings?.indicators?.stochasticRSI ?? DEFAULT_SETTINGS.indicators.stochasticRSI;
        if (!rsiSettings.enabled) return [];
        const { rsiPeriod, stochPeriod, kPeriod, dPeriod } = rsiSettings;
        return calculateStochasticRSI($ohlc, rsiPeriod, stochPeriod, kPeriod, dPeriod);
    }
);

export const kalmanData = derived(
    [ohlcData, settings],
    ([$ohlc, $settings]) => {
        if (!$ohlc?.length) return [];
        const kalmanSettings = $settings?.indicators?.kalman ?? DEFAULT_SETTINGS.indicators.kalman;
        if (!kalmanSettings.enabled) return [];
        const { processNoise, measurementNoise } = kalmanSettings;
        return calculateKalman($ohlc, processNoise, measurementNoise);
    }
);

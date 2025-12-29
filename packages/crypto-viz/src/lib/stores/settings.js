import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_SETTINGS } from '$lib/utils/constants.js';
import { saveSettings, loadSettings } from '$lib/services/storageService.js';

function mergeWithDefaults(stored) {
    if (!stored) return DEFAULT_SETTINGS;
    return {
        ...DEFAULT_SETTINGS,
        ...stored,
        candlestickHeight: stored.candlestickHeight ?? DEFAULT_SETTINGS.candlestickHeight,
        indicators: {
            stochastic: { ...DEFAULT_SETTINGS.indicators.stochastic, ...stored.indicators?.stochastic },
            stochasticRSI: { ...DEFAULT_SETTINGS.indicators.stochasticRSI, ...stored.indicators?.stochasticRSI },
            kalman: { ...DEFAULT_SETTINGS.indicators.kalman, ...stored.indicators?.kalman }
        }
    };
}

function createSettingsStore() {
    // Load initial settings from localStorage if in browser, merge with defaults
    const stored = browser ? loadSettings() : null;
    const initial = mergeWithDefaults(stored);
    const { subscribe, set, update } = writable(initial);

    // Auto-save on changes (debounced)
    let saveTimeout;
    subscribe((value) => {
        if (browser) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveSettings(value), 500);
        }
    });

    return {
        subscribe,
        set,
        update,
        reset: () => set(DEFAULT_SETTINGS)
    };
}

export const settings = createSettingsStore();

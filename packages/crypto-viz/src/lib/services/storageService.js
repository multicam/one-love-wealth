import { browser } from '$app/environment';

const SETTINGS_KEY = 'crypto-viz-settings';
const EVENTS_KEY = 'crypto-viz-events';
const CRYPTO_KEY = 'crypto-viz-selected-crypto';
const OHLC_KEY_PREFIX = 'crypto-viz-ohlc-';

/**
 * @typedef {Object} IndicatorSettings
 * @property {boolean} enabled
 * @property {number} [kPeriod]
 * @property {number} [dPeriod]
 * @property {number} [smooth]
 * @property {number} [rsiPeriod]
 * @property {number} [stochPeriod]
 * @property {number} [processNoise]
 * @property {number} [measurementNoise]
 */

/**
 * @typedef {Object} Settings
 * @property {number} timeframe
 * @property {string | null} interval
 * @property {number} refreshInterval
 * @property {number} candlestickHeight
 * @property {string} dataSource
 * @property {{stochastic: IndicatorSettings, stochasticRSI: IndicatorSettings, kalman: IndicatorSettings}} indicators
 */

/**
 * @typedef {Object} StrategyEvent
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {Object} condition
 * @property {number[]} detectedAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OHLCPoint
 * @property {number} time
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */

/**
 * @typedef {Object} OHLCPayload
 * @property {OHLCPoint[]} data
 * @property {number} timestamp
 * @property {number | null} lastDataTime
 */

/**
 * Save settings to localStorage
 * @param {Settings} settings
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

/**
 * Load settings from localStorage
 * @returns {Settings | null}
 */
export function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Failed to load settings:', e);
        return null;
    }
}

/**
 * Save events to localStorage
 * @param {StrategyEvent[]} events
 */
export function saveEvents(events) {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('Failed to save events:', e);
    }
}

/**
 * Load events from localStorage
 * @returns {StrategyEvent[]}
 */
export function loadEvents() {
    try {
        const stored = localStorage.getItem(EVENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load events:', e);
        return [];
    }
}

/**
 * Save selected crypto to localStorage
 * @param {string} cryptoId
 */
export function saveSelectedCrypto(cryptoId) {
    try {
        localStorage.setItem(CRYPTO_KEY, cryptoId);
    } catch (e) {
        console.error('Failed to save selected crypto:', e);
    }
}

/**
 * Load selected crypto from localStorage
 * @returns {string}
 */
export function loadSelectedCrypto() {
    try {
        return localStorage.getItem(CRYPTO_KEY) || 'bitcoin';
    } catch (e) {
        console.error('Failed to load selected crypto:', e);
        return 'bitcoin';
    }
}

/**
 * Clear all storage
 */
export function clearAllStorage() {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(CRYPTO_KEY);
    // Clear all OHLC data
    Object.keys(localStorage)
        .filter(key => key.startsWith(OHLC_KEY_PREFIX))
        .forEach(key => localStorage.removeItem(key));
}

/**
 * Save OHLC data to localStorage
 * @param {string} cryptoId
 * @param {string} timeframe
 * @param {OHLCPoint[]} data
 */
export function saveOHLCData(cryptoId, timeframe, data) {
    if (!browser) return;
    try {
        const key = `${OHLC_KEY_PREFIX}${cryptoId}-${timeframe}`;
        /** @type {OHLCPayload} */
        const payload = {
            data,
            timestamp: Date.now(),
            lastDataTime: data.length > 0 ? data[data.length - 1].time : null
        };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.error('Failed to save OHLC data:', e);
        // If storage is full, try to clear old data
        if (e instanceof Error && e.name === 'QuotaExceededError') {
            clearOldOHLCData();
        }
    }
}

/**
 * Load OHLC data from localStorage
 * @param {string} cryptoId
 * @param {string} timeframe
 * @returns {OHLCPayload | null}
 */
export function loadOHLCData(cryptoId, timeframe) {
    if (!browser) return null;
    try {
        const key = `${OHLC_KEY_PREFIX}${cryptoId}-${timeframe}`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        
        /** @type {OHLCPayload} */
        const payload = JSON.parse(stored);
        return {
            data: payload.data,
            timestamp: payload.timestamp,
            lastDataTime: payload.lastDataTime
        };
    } catch (e) {
        console.error('Failed to load OHLC data:', e);
        return null;
    }
}

/**
 * Clear old OHLC data from localStorage
 */
export function clearOldOHLCData() {
    if (!browser) return;
    // Remove OHLC data older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    Object.keys(localStorage)
        .filter(key => key.startsWith(OHLC_KEY_PREFIX))
        .forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    /** @type {OHLCPayload} */
                    const payload = JSON.parse(stored);
                    if (now - payload.timestamp > maxAge) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        });
}

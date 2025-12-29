import { browser } from '$app/environment';

const SETTINGS_KEY = 'crypto-viz-settings';
const EVENTS_KEY = 'crypto-viz-events';
const CRYPTO_KEY = 'crypto-viz-selected-crypto';
const OHLC_KEY_PREFIX = 'crypto-viz-ohlc-';

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

export function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Failed to load settings:', e);
        return null;
    }
}

export function saveEvents(events) {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('Failed to save events:', e);
    }
}

export function loadEvents() {
    try {
        const stored = localStorage.getItem(EVENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load events:', e);
        return [];
    }
}

export function saveSelectedCrypto(cryptoId) {
    try {
        localStorage.setItem(CRYPTO_KEY, cryptoId);
    } catch (e) {
        console.error('Failed to save selected crypto:', e);
    }
}

export function loadSelectedCrypto() {
    try {
        return localStorage.getItem(CRYPTO_KEY) || 'bitcoin';
    } catch (e) {
        console.error('Failed to load selected crypto:', e);
        return 'bitcoin';
    }
}

export function clearAllStorage() {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(CRYPTO_KEY);
    // Clear all OHLC data
    Object.keys(localStorage)
        .filter(key => key.startsWith(OHLC_KEY_PREFIX))
        .forEach(key => localStorage.removeItem(key));
}

// OHLC Data Persistence
export function saveOHLCData(cryptoId, timeframe, data) {
    if (!browser) return;
    try {
        const key = `${OHLC_KEY_PREFIX}${cryptoId}-${timeframe}`;
        const payload = {
            data,
            timestamp: Date.now(),
            lastDataTime: data.length > 0 ? data[data.length - 1].time : null
        };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.error('Failed to save OHLC data:', e);
        // If storage is full, try to clear old data
        if (e.name === 'QuotaExceededError') {
            clearOldOHLCData();
        }
    }
}

export function loadOHLCData(cryptoId, timeframe) {
    if (!browser) return null;
    try {
        const key = `${OHLC_KEY_PREFIX}${cryptoId}-${timeframe}`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        
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

export function clearOldOHLCData() {
    if (!browser) return;
    // Remove OHLC data older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    Object.keys(localStorage)
        .filter(key => key.startsWith(OHLC_KEY_PREFIX))
        .forEach(key => {
            try {
                const payload = JSON.parse(localStorage.getItem(key));
                if (now - payload.timestamp > maxAge) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        });
}

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { fetchOHLC } from '$lib/services/dataService.js';
import { settings } from './settings.js';
import { saveSelectedCrypto, loadSelectedCrypto } from '$lib/services/storageService.js';
import { crosshairPosition } from './ui.js';

/**
 * @typedef {Object} OHLCPoint
 * @property {number} time
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */

function createSelectedCryptoStore() {
    const initial = browser ? loadSelectedCrypto() : 'bitcoin';
    const { subscribe, set, update } = writable(initial);

    return {
        subscribe,
        /**
         * @param {string} value
         */
        set: (value) => {
            set(value);
            if (browser) saveSelectedCrypto(value);
        },
        update
    };
}

export const selectedCrypto = createSelectedCryptoStore();

/** @type {import('svelte/store').Writable<OHLCPoint[]>} */
export const ohlcData = writable([]);

/** @type {import('svelte/store').Writable<boolean>} */
export const isLoading = writable(false);

/** @type {import('svelte/store').Writable<Date | null>} */
export const lastUpdated = writable(null);

/** @type {import('svelte/store').Writable<string | null>} */
export const error = writable(null);

/**
 * Load crypto data from the API
 */
export async function loadCryptoData() {
    const cryptoId = get(selectedCrypto);
    const currentSettings = get(settings);
    const timeframe = currentSettings?.timeframe ?? 30;
    const dataSource = currentSettings?.dataSource ?? 'coingecko';
    const interval = currentSettings?.interval ?? null;
    
    console.log('loadCryptoData: Loading', cryptoId, 'timeframe:', timeframe, 'source:', dataSource, 'interval:', interval);
    
    isLoading.set(true);
    error.set(null);
    
    // Reset crosshair position to prevent stale data errors when switching crypto
    crosshairPosition.set(null);
    
    try {
        const data = await fetchOHLC(cryptoId, timeframe, dataSource, interval);
        console.log('loadCryptoData: Received', data?.length, 'data points');
        if (data && data.length > 0) {
            console.log('loadCryptoData: First point:', data[0]);
        }
        ohlcData.set(data);
        lastUpdated.set(new Date());
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data';
        error.set(message);
        console.error('Failed to load crypto data:', err);
    } finally {
        isLoading.set(false);
    }
}

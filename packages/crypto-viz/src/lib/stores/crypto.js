import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { fetchOHLC } from '$lib/services/dataService.js';
import { settings } from './settings.js';
import { saveSelectedCrypto, loadSelectedCrypto } from '$lib/services/storageService.js';
import { crosshairPosition, visibleTimeRange } from './ui.js';

function createSelectedCryptoStore() {
    const initial = browser ? loadSelectedCrypto() : 'bitcoin';
    const { subscribe, set, update } = writable(initial);

    return {
        subscribe,
        set: (value) => {
            set(value);
            if (browser) saveSelectedCrypto(value);
        },
        update
    };
}

export const selectedCrypto = createSelectedCryptoStore();
export const ohlcData = writable([]);
export const isLoading = writable(false);
export const lastUpdated = writable(null);
export const error = writable(null);

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
        error.set(err.message || 'Failed to fetch data');
        console.error('Failed to load crypto data:', err);
    } finally {
        isLoading.set(false);
    }
}

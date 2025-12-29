import { DATA_SOURCES, SUPPORTED_CRYPTOS, getDefaultInterval } from '$lib/utils/constants.js';
import { saveOHLCData, loadOHLCData } from './storageService.js';

/**
 * @typedef {Object} OHLCPoint
 * @property {number} time
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */

/**
 * @typedef {Object} CacheEntry
 * @property {OHLCPoint[]} data
 * @property {number} timestamp
 */

/**
 * @typedef {Object} APIError
 * @property {number} status
 * @property {string} message
 */

/** @type {Map<string, CacheEntry>} */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for memory cache
const STORAGE_TTL = 30 * 60 * 1000; // 30 minutes before attempting API refresh
const RETRY_DELAY = 60 * 1000; // 1 minute retry delay after 429

let lastRateLimitTime = 0;

/**
 * Generate cache key
 * @param {string} cryptoId
 * @param {number} days
 * @param {string} source
 * @param {string | null} intervalId
 * @returns {string}
 */
function getCacheKey(cryptoId, days, source, intervalId) {
    return `${source}-${cryptoId}-${days}-${intervalId || 'default'}`;
}

/**
 * Get data source configuration
 * @param {string} sourceId
 * @returns {import('$lib/utils/constants.js').DataSource}
 */
function getDataSource(sourceId) {
    return DATA_SOURCES[sourceId] || DATA_SOURCES.coingecko;
}

/**
 * Get crypto symbol from ID
 * @param {string} cryptoId
 * @returns {string}
 */
function getCryptoSymbol(cryptoId) {
    const crypto = SUPPORTED_CRYPTOS.find(c => c.id === cryptoId);
    return crypto ? crypto.symbol : cryptoId.toUpperCase();
}

/**
 * Check if cache entry is valid
 * @param {CacheEntry | undefined} entry
 * @returns {boolean}
 */
function isCacheValid(entry) {
    return !!entry && (Date.now() - entry.timestamp) < CACHE_TTL;
}

/**
 * Check if storage data is stale
 * @param {number | undefined} timestamp
 * @returns {boolean}
 */
function isStorageStale(timestamp) {
    return !timestamp || (Date.now() - timestamp) > STORAGE_TTL;
}

/**
 * Check if we're rate limited
 * @returns {boolean}
 */
function isRateLimited() {
    return (Date.now() - lastRateLimitTime) < RETRY_DELAY;
}

/**
 * Transform CoinGecko OHLC data
 * @param {Array<[number, number, number, number, number]>} rawData
 * @returns {OHLCPoint[]}
 */
function transformCoinGeckoData(rawData) {
    return rawData.map(([timestamp, open, high, low, close]) => ({
        time: Math.floor(timestamp / 1000),
        open,
        high,
        low,
        close
    }));
}

/**
 * Transform Binance OHLC data
 * @param {Array<any[]>} rawData
 * @returns {OHLCPoint[]}
 */
function transformBinanceData(rawData) {
    return rawData.map(candle => ({
        time: Math.floor(Number(candle[0]) / 1000),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4])
    }));
}

/**
 * Fetch OHLC data from CoinGecko
 * @param {string} cryptoId
 * @param {number} days
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
async function fetchFromCoinGecko(cryptoId, days, intervalId) {
    const source = getDataSource('coingecko');
    const url = `${source.baseUrl}/coins/${cryptoId}/ohlc?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw /** @type {APIError} */ ({ status: 429, message: 'Rate limited (429)' });
    }
    if (!response.ok) {
        throw /** @type {APIError} */ ({ status: response.status, message: `API error: ${response.status}` });
    }
    
    const rawData = await response.json();
    return transformCoinGeckoData(rawData);
}

/**
 * Fetch OHLC data from Binance
 * @param {string} cryptoId
 * @param {number} days
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
async function fetchFromBinance(cryptoId, days, intervalId) {
    const source = getDataSource('binance');
    const symbol = getCryptoSymbol(cryptoId) + 'USDT';
    const interval = intervalId || getDefaultInterval('binance', days)?.id || '4h';
    const limit = Math.min(1000, days * (days <= 1 ? 48 : days <= 30 ? 6 : 1));
    
    const url = `${source.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw /** @type {APIError} */ ({ status: 429, message: 'Rate limited (429)' });
    }
    if (!response.ok) {
        throw /** @type {APIError} */ ({ status: response.status, message: `API error: ${response.status}` });
    }
    
    const rawData = await response.json();
    return transformBinanceData(rawData);
}

/** @type {Record<string, string>} */
const coinbaseSymbolMap = {
    'bitcoin': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'ripple': 'XRP-USD',
    'solana': 'SOL-USD',
    'sui': 'SUI-USD'
};

/**
 * Get Coinbase symbol
 * @param {string} cryptoId
 * @returns {string}
 */
function getCoinbaseSymbol(cryptoId) {
    return coinbaseSymbolMap[cryptoId] || `${getCryptoSymbol(cryptoId)}-USD`;
}

/**
 * Transform Coinbase OHLC data
 * @param {Array<[number, number, number, number, number, number]>} rawData
 * @returns {OHLCPoint[]}
 */
function transformCoinbaseData(rawData) {
    return rawData.map(candle => ({
        time: candle[0],
        low: candle[1],
        high: candle[2],
        open: candle[3],
        close: candle[4]
    })).reverse();
}

/**
 * Fetch OHLC data from Coinbase
 * @param {string} cryptoId
 * @param {number} days
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
async function fetchFromCoinbase(cryptoId, days, intervalId) {
    const source = getDataSource('coinbase');
    const symbol = getCoinbaseSymbol(cryptoId);
    const granularity = intervalId || getDefaultInterval('coinbase', days)?.id || '21600';
    
    const url = `${source.baseUrl}/products/${symbol}/candles?granularity=${granularity}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw /** @type {APIError} */ ({ status: 429, message: 'Rate limited (429)' });
    }
    if (!response.ok) {
        throw /** @type {APIError} */ ({ status: response.status, message: `API error: ${response.status}` });
    }
    
    const rawData = await response.json();
    return transformCoinbaseData(rawData);
}

/** @type {Record<string, string>} */
const hyperliquidSymbolMap = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'ripple': 'XRP',
    'solana': 'SOL',
    'sui': 'SUI'
};

/**
 * Get Hyperliquid symbol
 * @param {string} cryptoId
 * @returns {string}
 */
function getHyperliquidSymbol(cryptoId) {
    return hyperliquidSymbolMap[cryptoId] || getCryptoSymbol(cryptoId);
}

/**
 * Transform Hyperliquid OHLC data
 * @param {Array<{t: number, o: string, h: string, l: string, c: string}> | null} rawData
 * @returns {OHLCPoint[]}
 */
function transformHyperliquidData(rawData) {
    if (!rawData || !Array.isArray(rawData)) return [];
    return rawData.map(candle => ({
        time: Math.floor(candle.t / 1000),
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c)
    }));
}

/**
 * Fetch OHLC data from Hyperliquid
 * @param {string} cryptoId
 * @param {number} days
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
async function fetchFromHyperliquid(cryptoId, days, intervalId) {
    const source = getDataSource('hyperliquid');
    const symbol = getHyperliquidSymbol(cryptoId);
    const interval = intervalId || getDefaultInterval('hyperliquid', days)?.id || '4h';
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);
    
    const url = `${source.baseUrl}/info`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'candleSnapshot',
            req: {
                coin: symbol,
                interval: interval,
                startTime: startTime,
                endTime: endTime
            }
        })
    });
    
    if (response.status === 429) {
        throw /** @type {APIError} */ ({ status: 429, message: 'Rate limited (429)' });
    }
    if (!response.ok) {
        throw /** @type {APIError} */ ({ status: response.status, message: `API error: ${response.status}` });
    }
    
    const rawData = await response.json();
    return transformHyperliquidData(rawData);
}

/** @type {Record<string, string>} */
const yahooSymbolMap = {
    'bitcoin': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'ripple': 'XRP-USD',
    'solana': 'SOL-USD',
    'sui': 'SUI-USD'
};

/**
 * Get Yahoo symbol
 * @param {string} cryptoId
 * @returns {string}
 */
function getYahooSymbol(cryptoId) {
    return yahooSymbolMap[cryptoId] || `${getCryptoSymbol(cryptoId)}-USD`;
}

/**
 * Transform Yahoo OHLC data
 * @param {{result?: Array<{timestamp?: number[], indicators?: {quote?: Array<{open?: number[], high?: number[], low?: number[], close?: number[]}>}}>}} chart
 * @returns {OHLCPoint[]}
 */
function transformYahooData(chart) {
    const quotes = chart.result?.[0];
    if (!quotes) return [];
    
    const timestamps = quotes.timestamp || [];
    const ohlc = quotes.indicators?.quote?.[0] || {};
    
    return timestamps.map((ts, i) => ({
        time: ts,
        open: ohlc.open?.[i] || 0,
        high: ohlc.high?.[i] || 0,
        low: ohlc.low?.[i] || 0,
        close: ohlc.close?.[i] || 0
    })).filter(c => c.open && c.high && c.low && c.close);
}

/**
 * Fetch OHLC data from Yahoo
 * @param {string} cryptoId
 * @param {number} days
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
async function fetchFromYahoo(cryptoId, days, intervalId) {
    const source = getDataSource('yahoo');
    const symbol = getYahooSymbol(cryptoId);
    const interval = intervalId || getDefaultInterval('yahoo', days)?.id || '1h';
    const range = days <= 1 ? '1d' : days <= 7 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
    
    const url = `${source.baseUrl}/chart/${symbol}?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw /** @type {APIError} */ ({ status: 429, message: 'Rate limited (429)' });
    }
    if (!response.ok) {
        throw /** @type {APIError} */ ({ status: response.status, message: `API error: ${response.status}` });
    }
    
    const data = await response.json();
    return transformYahooData(data.chart);
}

/**
 * Merge existing and new OHLC data
 * @param {OHLCPoint[] | undefined} existingData
 * @param {OHLCPoint[]} newData
 * @returns {OHLCPoint[]}
 */
function mergeOHLCData(existingData, newData) {
    if (!existingData || existingData.length === 0) return newData;
    if (!newData || newData.length === 0) return existingData;
    
    const lastExistingTime = existingData[existingData.length - 1].time;
    const newPoints = newData.filter(point => point.time > lastExistingTime);
    
    if (newPoints.length === 0) {
        const lastNewPoint = newData[newData.length - 1];
        if (lastNewPoint && lastNewPoint.time === lastExistingTime) {
            return [...existingData.slice(0, -1), lastNewPoint];
        }
        return existingData;
    }
    
    return [...existingData, ...newPoints];
}

/**
 * Fetch OHLC data with caching
 * @param {string} cryptoId
 * @param {number} days
 * @param {string} sourceId
 * @param {string | null} intervalId
 * @returns {Promise<OHLCPoint[]>}
 */
export async function fetchOHLC(cryptoId, days = 30, sourceId = 'coingecko', intervalId = null) {
    const cacheKey = getCacheKey(cryptoId, days, sourceId, intervalId);
    
    // Check memory cache first
    const cached = cache.get(cacheKey);
    if (isCacheValid(cached) && cached) {
        console.log('fetchOHLC: Using memory cache');
        return cached.data;
    }
    
    // Check persistent storage
    const storageKey = `${sourceId}-${days}-${intervalId || 'default'}`;
    const stored = loadOHLCData(cryptoId, storageKey);
    
    // If rate limited, return stored data if available
    if (isRateLimited()) {
        console.log('fetchOHLC: Rate limited, using stored data');
        if (stored && stored.data) {
            cache.set(cacheKey, { data: stored.data, timestamp: Date.now() });
            return stored.data;
        }
        throw new Error('Rate limited (429). Please wait before retrying.');
    }
    
    // If storage is fresh enough, use it without API call
    if (stored && !isStorageStale(stored.timestamp)) {
        console.log('fetchOHLC: Using fresh stored data');
        cache.set(cacheKey, { data: stored.data, timestamp: Date.now() });
        return stored.data;
    }
    
    // Try to fetch from API based on source
    try {
        console.log(`fetchOHLC: Fetching from ${sourceId} with interval ${intervalId || 'default'}`);
        
        /** @type {OHLCPoint[]} */
        let newData;
        if (sourceId === 'binance') {
            newData = await fetchFromBinance(cryptoId, days, intervalId);
        } else if (sourceId === 'coinbase') {
            newData = await fetchFromCoinbase(cryptoId, days, intervalId);
        } else if (sourceId === 'hyperliquid') {
            newData = await fetchFromHyperliquid(cryptoId, days, intervalId);
        } else if (sourceId === 'yahoo') {
            newData = await fetchFromYahoo(cryptoId, days, intervalId);
        } else {
            newData = await fetchFromCoinGecko(cryptoId, days, intervalId);
        }
        
        // Merge with existing data if we have it (incremental update)
        /** @type {OHLCPoint[]} */
        let finalData;
        if (stored && stored.data && stored.data.length > 0) {
            finalData = mergeOHLCData(stored.data, newData);
            console.log(`fetchOHLC: Merged ${newData.length} new points with ${stored.data.length} existing`);
        } else {
            finalData = newData;
            console.log(`fetchOHLC: Fresh data with ${newData.length} points`);
        }
        
        // Update both caches
        cache.set(cacheKey, { data: finalData, timestamp: Date.now() });
        saveOHLCData(cryptoId, storageKey, finalData);
        
        return finalData;
    } catch (err) {
        const apiError = /** @type {APIError} */ (err);
        if (apiError.status === 429) {
            lastRateLimitTime = Date.now();
            console.warn('fetchOHLC: Rate limited (429)');
        }
        
        // Try to use stored data on any error
        if (stored && stored.data) {
            console.log('fetchOHLC: Error, using stored data');
            cache.set(cacheKey, { data: stored.data, timestamp: Date.now() });
            return stored.data;
        }
        throw apiError.message ? new Error(apiError.message) : err;
    }
}

/**
 * Clear the memory cache
 */
export function clearCache() {
    cache.clear();
}

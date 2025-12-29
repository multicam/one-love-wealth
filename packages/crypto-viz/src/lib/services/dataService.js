import { DATA_SOURCES, SUPPORTED_CRYPTOS, getDefaultInterval } from '$lib/utils/constants.js';
import { saveOHLCData, loadOHLCData } from './storageService.js';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for memory cache
const STORAGE_TTL = 30 * 60 * 1000; // 30 minutes before attempting API refresh
const RETRY_DELAY = 60 * 1000; // 1 minute retry delay after 429

let lastRateLimitTime = 0;

function getCacheKey(cryptoId, days, source, intervalId) {
    return `${source}-${cryptoId}-${days}-${intervalId || 'default'}`;
}

function getDataSource(sourceId) {
    return DATA_SOURCES[sourceId] || DATA_SOURCES.coingecko;
}

function getCryptoSymbol(cryptoId) {
    const crypto = SUPPORTED_CRYPTOS.find(c => c.id === cryptoId);
    return crypto ? crypto.symbol : cryptoId.toUpperCase();
}

function isCacheValid(entry) {
    return entry && (Date.now() - entry.timestamp) < CACHE_TTL;
}

function isStorageStale(timestamp) {
    return !timestamp || (Date.now() - timestamp) > STORAGE_TTL;
}

function isRateLimited() {
    return (Date.now() - lastRateLimitTime) < RETRY_DELAY;
}

function transformCoinGeckoData(rawData) {
    return rawData.map(([timestamp, open, high, low, close]) => ({
        time: Math.floor(timestamp / 1000),
        open,
        high,
        low,
        close
    }));
}

function transformBinanceData(rawData) {
    return rawData.map(candle => ({
        time: Math.floor(candle[0] / 1000),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4])
    }));
}

async function fetchFromCoinGecko(cryptoId, days, intervalId) {
    const source = getDataSource('coingecko');
    const url = `${source.baseUrl}/coins/${cryptoId}/ohlc?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw { status: 429, message: 'Rate limited (429)' };
    }
    if (!response.ok) {
        throw { status: response.status, message: `API error: ${response.status}` };
    }
    
    const rawData = await response.json();
    return transformCoinGeckoData(rawData);
}

async function fetchFromBinance(cryptoId, days, intervalId) {
    const source = getDataSource('binance');
    const symbol = getCryptoSymbol(cryptoId) + 'USDT';
    const interval = intervalId || getDefaultInterval('binance', days)?.id || '4h';
    const limit = Math.min(1000, days * (days <= 1 ? 48 : days <= 30 ? 6 : 1));
    
    const url = `${source.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw { status: 429, message: 'Rate limited (429)' };
    }
    if (!response.ok) {
        throw { status: response.status, message: `API error: ${response.status}` };
    }
    
    const rawData = await response.json();
    return transformBinanceData(rawData);
}

function getCoinbaseSymbol(cryptoId) {
    const symbolMap = {
        'bitcoin': 'BTC-USD',
        'ethereum': 'ETH-USD',
        'ripple': 'XRP-USD',
        'solana': 'SOL-USD',
        'sui': 'SUI-USD'
    };
    return symbolMap[cryptoId] || `${getCryptoSymbol(cryptoId)}-USD`;
}

function transformCoinbaseData(rawData) {
    return rawData.map(candle => ({
        time: candle[0],
        low: candle[1],
        high: candle[2],
        open: candle[3],
        close: candle[4]
    })).reverse();
}

async function fetchFromCoinbase(cryptoId, days, intervalId) {
    const source = getDataSource('coinbase');
    const symbol = getCoinbaseSymbol(cryptoId);
    const granularity = intervalId || getDefaultInterval('coinbase', days)?.id || '21600';
    
    // Coinbase API returns max 300 candles, so we just use granularity without start/end
    // The API will return the most recent candles
    const url = `${source.baseUrl}/products/${symbol}/candles?granularity=${granularity}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw { status: 429, message: 'Rate limited (429)' };
    }
    if (!response.ok) {
        throw { status: response.status, message: `API error: ${response.status}` };
    }
    
    const rawData = await response.json();
    return transformCoinbaseData(rawData);
}

function getHyperliquidSymbol(cryptoId) {
    const symbolMap = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'ripple': 'XRP',
        'solana': 'SOL',
        'sui': 'SUI'
    };
    return symbolMap[cryptoId] || getCryptoSymbol(cryptoId);
}

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
        throw { status: 429, message: 'Rate limited (429)' };
    }
    if (!response.ok) {
        throw { status: response.status, message: `API error: ${response.status}` };
    }
    
    const rawData = await response.json();
    return transformHyperliquidData(rawData);
}

function getYahooSymbol(cryptoId) {
    const symbolMap = {
        'bitcoin': 'BTC-USD',
        'ethereum': 'ETH-USD',
        'ripple': 'XRP-USD',
        'solana': 'SOL-USD',
        'sui': 'SUI-USD'
    };
    return symbolMap[cryptoId] || `${getCryptoSymbol(cryptoId)}-USD`;
}

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

async function fetchFromYahoo(cryptoId, days, intervalId) {
    const source = getDataSource('yahoo');
    const symbol = getYahooSymbol(cryptoId);
    const interval = intervalId || getDefaultInterval('yahoo', days)?.id || '1h';
    const range = days <= 1 ? '1d' : days <= 7 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
    
    const url = `${source.baseUrl}/chart/${symbol}?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
        throw { status: 429, message: 'Rate limited (429)' };
    }
    if (!response.ok) {
        throw { status: response.status, message: `API error: ${response.status}` };
    }
    
    const data = await response.json();
    return transformYahooData(data.chart);
}

function mergeOHLCData(existingData, newData) {
    if (!existingData || existingData.length === 0) return newData;
    if (!newData || newData.length === 0) return existingData;
    
    // Get the last timestamp from existing data
    const lastExistingTime = existingData[existingData.length - 1].time;
    
    // Filter new data to only include points after the last existing point
    const newPoints = newData.filter(point => point.time > lastExistingTime);
    
    if (newPoints.length === 0) {
        // Update the last candle if times match (it may have updated)
        const lastNewPoint = newData[newData.length - 1];
        if (lastNewPoint && lastNewPoint.time === lastExistingTime) {
            return [...existingData.slice(0, -1), lastNewPoint];
        }
        return existingData;
    }
    
    // Merge existing data with new points
    return [...existingData, ...newPoints];
}

export async function fetchOHLC(cryptoId, days = 30, sourceId = 'coingecko', intervalId = null) {
    const cacheKey = getCacheKey(cryptoId, days, sourceId, intervalId);
    
    // Check memory cache first
    const cached = cache.get(cacheKey);
    if (isCacheValid(cached)) {
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
        if (err.status === 429) {
            lastRateLimitTime = Date.now();
            console.warn('fetchOHLC: Rate limited (429)');
        }
        
        // Try to use stored data on any error
        if (stored && stored.data) {
            console.log('fetchOHLC: Error, using stored data');
            cache.set(cacheKey, { data: stored.data, timestamp: Date.now() });
            return stored.data;
        }
        throw err.message ? new Error(err.message) : err;
    }
}

export function clearCache() {
    cache.clear();
}

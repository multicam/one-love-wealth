import { sma, highest, lowest } from './utils.js';

/**
 * Calculate Stochastic Oscillator
 * @param {Array<{time: number, open: number, high: number, low: number, close: number}>} candles
 * @param {number} kPeriod - %K period (default 14)
 * @param {number} dPeriod - %D period (default 3)
 * @param {number} smooth - %K smoothing (default 3)
 * @returns {Array<{time: number, k: number, d: number}>}
 */
export function calculateStochastic(candles, kPeriod = 14, dPeriod = 3, smooth = 3) {
    if (candles.length < kPeriod + smooth + dPeriod) {
        return [];
    }

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);

    // Calculate raw %K
    const rawK = [];
    for (let i = kPeriod - 1; i < candles.length; i++) {
        const highestHigh = highest(highs, kPeriod, i);
        const lowestLow = lowest(lows, kPeriod, i);
        const range = highestHigh - lowestLow;
        
        if (range === 0) {
            rawK.push(50); // Avoid division by zero
        } else {
            rawK.push(((closes[i] - lowestLow) / range) * 100);
        }
    }

    // Smooth %K with SMA
    const smoothedK = sma(rawK, smooth);

    // Calculate %D as SMA of smoothed %K
    const dValues = sma(smoothedK, dPeriod);

    // Build result with aligned timestamps
    const result = [];
    const startIndex = kPeriod - 1 + smooth - 1 + dPeriod - 1;
    
    for (let i = 0; i < dValues.length; i++) {
        const candleIndex = startIndex + i;
        if (candleIndex < candles.length) {
            result.push({
                time: candles[candleIndex].time,
                k: smoothedK[i + dPeriod - 1],
                d: dValues[i]
            });
        }
    }

    return result;
}

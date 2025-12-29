import { sma, highest, lowest } from './utils.js';

/**
 * @typedef {Object} Candle
 * @property {number} time
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */

/**
 * @typedef {Object} StochasticPoint
 * @property {number} time
 * @property {number} k
 * @property {number} d
 */

/**
 * Calculate Stochastic Oscillator
 * @param {Candle[]} candles
 * @param {number} kPeriod - %K period (default 14)
 * @param {number} dPeriod - %D period (default 3)
 * @param {number} smooth - %K smoothing (default 3)
 * @returns {StochasticPoint[]}
 */
export function calculateStochastic(candles, kPeriod = 14, dPeriod = 3, smooth = 3) {
    if (candles.length < kPeriod + smooth + dPeriod) {
        return [];
    }

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);

    // Calculate raw %K
    /** @type {number[]} */
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
    /** @type {StochasticPoint[]} */
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

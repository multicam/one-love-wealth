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
 * Calculate RSI
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - RSI period
 * @returns {number[]} RSI values
 */
function calculateRSI(closes, period) {
    if (closes.length < period + 1) {
        return [];
    }

    /** @type {number[]} */
    const gains = [];
    /** @type {number[]} */
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? -change : 0);
    }

    /** @type {number[]} */
    const rsiValues = [];
    
    // First RSI value using SMA
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < period; i++) {
        avgGain += gains[i];
        avgLoss += losses[i];
    }
    avgGain /= period;
    avgLoss /= period;

    if (avgLoss === 0) {
        rsiValues.push(100);
    } else {
        const rs = avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
    }

    // Subsequent RSI values using smoothed averages
    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        if (avgLoss === 0) {
            rsiValues.push(100);
        } else {
            const rs = avgGain / avgLoss;
            rsiValues.push(100 - (100 / (1 + rs)));
        }
    }

    return rsiValues;
}

/**
 * Calculate Stochastic RSI
 * @param {Candle[]} candles
 * @param {number} rsiPeriod - RSI period (default 14)
 * @param {number} stochPeriod - Stochastic period (default 14)
 * @param {number} kPeriod - %K smoothing (default 3)
 * @param {number} dPeriod - %D smoothing (default 3)
 * @returns {StochasticPoint[]}
 */
export function calculateStochasticRSI(candles, rsiPeriod = 14, stochPeriod = 14, kPeriod = 3, dPeriod = 3) {
    const minLength = rsiPeriod + stochPeriod + kPeriod + dPeriod;
    if (candles.length < minLength) {
        return [];
    }

    const closes = candles.map(c => c.close);
    
    // Calculate RSI
    const rsiValues = calculateRSI(closes, rsiPeriod);
    
    if (rsiValues.length < stochPeriod) {
        return [];
    }

    // Apply Stochastic formula to RSI values
    /** @type {number[]} */
    const stochRSI = [];
    for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
        const highestRSI = highest(rsiValues, stochPeriod, i);
        const lowestRSI = lowest(rsiValues, stochPeriod, i);
        const range = highestRSI - lowestRSI;
        
        if (range === 0) {
            stochRSI.push(50);
        } else {
            stochRSI.push(((rsiValues[i] - lowestRSI) / range) * 100);
        }
    }

    // Smooth with SMA for %K
    const kValues = sma(stochRSI, kPeriod);
    
    // Calculate %D as SMA of %K
    const dValues = sma(kValues, dPeriod);

    // Build result with aligned timestamps
    /** @type {StochasticPoint[]} */
    const result = [];
    const startIndex = rsiPeriod + stochPeriod - 1 + kPeriod - 1 + dPeriod - 1;
    
    for (let i = 0; i < dValues.length; i++) {
        const candleIndex = startIndex + i;
        if (candleIndex < candles.length) {
            result.push({
                time: candles[candleIndex].time,
                k: kValues[i + dPeriod - 1],
                d: dValues[i]
            });
        }
    }

    return result;
}

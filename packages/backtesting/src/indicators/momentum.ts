/**
 * Momentum indicators: RSI, MACD, Stochastic, ROC
 */

import { ema, emaSeries, sma } from './trend';
import type { MACDResult, StochasticResult } from './types';

/**
 * Relative Strength Index (RSI)
 * Measures momentum on a 0-100 scale
 * 
 * @param values - Array of price values
 * @param period - RSI period (default: 14)
 * @returns RSI value (0-100) or undefined if insufficient data
 */
export function rsi(values: number[], period: number = 14): number | undefined {
  if (values.length < period + 1) return undefined;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === undefined || curr === undefined) continue;
    
    const change = curr - prev;
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Smooth average using Wilder's method for remaining values
  for (let i = period + 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === undefined || curr === undefined) continue;
    
    const change = curr - prev;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate RSI for entire series
 * 
 * @param values - Array of price values
 * @param period - RSI period (default: 14)
 * @returns Array of RSI values (undefined until period+1 is reached)
 */
export function rsiSeries(values: number[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  if (values.length < period + 1) {
    return values.map(() => undefined);
  }
  
  // Fill with undefined until we have enough data
  for (let i = 0; i < period; i++) {
    result.push(undefined);
  }
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev !== undefined && curr !== undefined) {
      const change = curr - prev;
      if (change > 0) gains += change;
      else losses -= change;
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // First RSI value
  if (avgLoss === 0) {
    result.push(100);
  } else {
    const rs = avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  
  // Calculate remaining RSI values
  for (let i = period + 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    
    if (prev !== undefined && curr !== undefined) {
      const change = curr - prev;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  
  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 * 
 * @param values - Array of price values
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line EMA period (default: 9)
 * @returns MACD result or undefined if insufficient data
 */
export function macd(
  values: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult | undefined {
  const minLength = slowPeriod + signalPeriod - 1;
  if (values.length < minLength) return undefined;
  
  const fastEMA = ema(values, fastPeriod);
  const slowEMA = ema(values, slowPeriod);
  
  if (fastEMA === undefined || slowEMA === undefined) return undefined;
  
  // Calculate MACD line series to get signal
  const macdLine = fastEMA - slowEMA;
  
  // We need MACD history for signal calculation
  const fastSeries = emaSeries(values, fastPeriod);
  const slowSeries = emaSeries(values, slowPeriod);
  
  const macdSeries: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const fast = fastSeries[i];
    const slow = slowSeries[i];
    if (fast !== undefined && slow !== undefined) {
      macdSeries.push(fast - slow);
    }
  }
  
  const signal = ema(macdSeries, signalPeriod);
  if (signal === undefined) return undefined;
  
  return {
    macd: macdLine,
    signal,
    histogram: macdLine - signal,
  };
}

/**
 * Calculate MACD for entire series
 * 
 * @param values - Array of price values
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line EMA period (default: 9)
 * @returns Array of MACD results
 */
export function macdSeries(
  values: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): (MACDResult | undefined)[] {
  const result: (MACDResult | undefined)[] = [];
  
  const fastSeries = emaSeries(values, fastPeriod);
  const slowSeries = emaSeries(values, slowPeriod);
  
  // Calculate MACD line series
  const macdLineSeries: (number | undefined)[] = [];
  for (let i = 0; i < values.length; i++) {
    const fast = fastSeries[i];
    const slow = slowSeries[i];
    if (fast !== undefined && slow !== undefined) {
      macdLineSeries.push(fast - slow);
    } else {
      macdLineSeries.push(undefined);
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const validMacd = macdLineSeries.filter((v): v is number => v !== undefined);
  const signalSeries = emaSeries(validMacd, signalPeriod);
  
  // Map signal values back to original indices
  let signalIdx = 0;
  const signalMap: (number | undefined)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (macdLineSeries[i] !== undefined) {
      signalMap.push(signalSeries[signalIdx++]);
    } else {
      signalMap.push(undefined);
    }
  }
  
  // Build result
  for (let i = 0; i < values.length; i++) {
    const macdValue = macdLineSeries[i];
    const signalValue = signalMap[i];
    
    if (macdValue !== undefined && signalValue !== undefined) {
      result.push({
        macd: macdValue,
        signal: signalValue,
        histogram: macdValue - signalValue,
      });
    } else {
      result.push(undefined);
    }
  }
  
  return result;
}

/**
 * Stochastic Oscillator
 * Compares closing price to price range over a period
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param kPeriod - %K period (default: 14)
 * @param dPeriod - %D smoothing period (default: 3)
 * @returns Stochastic result or undefined if insufficient data
 */
export function stochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticResult | undefined {
  if (highs.length < kPeriod + dPeriod - 1 || 
      lows.length < kPeriod + dPeriod - 1 || 
      closes.length < kPeriod + dPeriod - 1) {
    return undefined;
  }
  
  // Calculate %K series
  const kSeries: number[] = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    
    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);
    const close = closes[i];
    
    if (close !== undefined && highestHigh !== lowestLow) {
      const k = ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
      kSeries.push(k);
    }
  }
  
  if (kSeries.length < dPeriod) return undefined;
  
  const k = kSeries[kSeries.length - 1];
  const d = sma(kSeries, dPeriod);
  
  if (k === undefined || d === undefined) return undefined;
  
  return { k, d };
}

/**
 * Calculate Stochastic for entire series
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param kPeriod - %K period (default: 14)
 * @param dPeriod - %D smoothing period (default: 3)
 * @returns Array of Stochastic results
 */
export function stochasticSeries(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): (StochasticResult | undefined)[] {
  const result: (StochasticResult | undefined)[] = [];
  const len = Math.min(highs.length, lows.length, closes.length);
  
  // Calculate raw %K series
  const kValues: (number | undefined)[] = [];
  for (let i = 0; i < len; i++) {
    if (i < kPeriod - 1) {
      kValues.push(undefined);
    } else {
      const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
      const periodLows = lows.slice(i - kPeriod + 1, i + 1);
      
      const highestHigh = Math.max(...periodHighs);
      const lowestLow = Math.min(...periodLows);
      const close = closes[i];
      
      if (close !== undefined && highestHigh !== lowestLow) {
        const k = ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
        kValues.push(k);
      } else {
        kValues.push(undefined);
      }
    }
  }
  
  // Calculate %D (SMA of %K)
  for (let i = 0; i < len; i++) {
    const k = kValues[i];
    if (k === undefined || i < kPeriod + dPeriod - 2) {
      result.push(undefined);
    } else {
      const kSlice = kValues.slice(i - dPeriod + 1, i + 1).filter((v): v is number => v !== undefined);
      if (kSlice.length >= dPeriod) {
        const d = kSlice.reduce((a, b) => a + b, 0) / dPeriod;
        result.push({ k, d });
      } else {
        result.push(undefined);
      }
    }
  }
  
  return result;
}

/**
 * Rate of Change (ROC)
 * Measures percentage change over n periods
 * 
 * @param values - Array of price values
 * @param period - Number of periods (default: 12)
 * @returns ROC as percentage or undefined if insufficient data
 */
export function roc(values: number[], period: number = 12): number | undefined {
  if (values.length <= period) return undefined;
  
  const current = values[values.length - 1];
  const past = values[values.length - 1 - period];
  
  if (current === undefined || past === undefined || past === 0) return undefined;
  
  return ((current - past) / past) * 100;
}

/**
 * Calculate ROC for entire series
 * 
 * @param values - Array of price values
 * @param period - Number of periods (default: 12)
 * @returns Array of ROC values
 */
export function rocSeries(values: number[], period: number = 12): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      result.push(undefined);
    } else {
      const current = values[i];
      const past = values[i - period];
      
      if (current !== undefined && past !== undefined && past !== 0) {
        result.push(((current - past) / past) * 100);
      } else {
        result.push(undefined);
      }
    }
  }
  
  return result;
}

/**
 * Williams %R
 * Similar to stochastic but inverted (0 to -100)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param period - Lookback period (default: 14)
 * @returns Williams %R value or undefined if insufficient data
 */
export function williamsR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number | undefined {
  if (highs.length < period || lows.length < period || closes.length < period) {
    return undefined;
  }
  
  const periodHighs = highs.slice(-period);
  const periodLows = lows.slice(-period);
  
  const highestHigh = Math.max(...periodHighs);
  const lowestLow = Math.min(...periodLows);
  const close = closes[closes.length - 1];
  
  if (close === undefined || highestHigh === lowestLow) return undefined;
  
  return ((highestHigh - close) / (highestHigh - lowestLow)) * -100;
}

/**
 * Commodity Channel Index (CCI)
 * Measures price deviation from mean
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param period - Lookback period (default: 20)
 * @returns CCI value or undefined if insufficient data
 */
export function cci(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 20
): number | undefined {
  if (highs.length < period || lows.length < period || closes.length < period) {
    return undefined;
  }
  
  // Calculate Typical Price series
  const typicalPrices: number[] = [];
  for (let i = 0; i < period; i++) {
    const idx = highs.length - period + i;
    const h = highs[idx];
    const l = lows[idx];
    const c = closes[idx];
    if (h !== undefined && l !== undefined && c !== undefined) {
      const tp = (h + l + c) / 3;
      typicalPrices.push(tp);
    }
  }
  
  // SMA of typical price
  const tpSMA = typicalPrices.reduce((a, b) => a + b, 0) / period;
  
  // Mean deviation
  const meanDev = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - tpSMA), 0) / period;
  
  if (meanDev === 0) return 0;
  
  const currentTP = typicalPrices[typicalPrices.length - 1];
  if (currentTP === undefined) return undefined;
  
  return (currentTP - tpSMA) / (0.015 * meanDev);
}

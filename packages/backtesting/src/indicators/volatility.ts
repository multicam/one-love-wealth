/**
 * Volatility indicators: Bollinger Bands, ATR, Standard Deviation
 */

import { sma, smaSeries, ema } from './trend';
import type { BollingerBandsResult, ATRResult } from './types';

/**
 * Standard Deviation
 * 
 * @param values - Array of values
 * @param period - Number of periods (default: 20)
 * @returns Standard deviation or undefined if insufficient data
 */
export function standardDeviation(values: number[], period: number = 20): number | undefined {
  if (values.length < period) return undefined;
  
  const slice = values.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = slice.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  
  return Math.sqrt(variance);
}

/**
 * Calculate Standard Deviation for entire series
 * 
 * @param values - Array of values
 * @param period - Number of periods (default: 20)
 * @returns Array of standard deviation values
 */
export function standardDeviationSeries(values: number[], period: number = 20): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const squaredDiffs = slice.map(v => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      result.push(Math.sqrt(variance));
    }
  }
  
  return result;
}

/**
 * Bollinger Bands
 * 
 * @param values - Array of price values
 * @param period - SMA period (default: 20)
 * @param stdDevMultiplier - Standard deviation multiplier (default: 2)
 * @returns Bollinger Bands result or undefined if insufficient data
 */
export function bollingerBands(
  values: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult | undefined {
  if (values.length < period) return undefined;
  
  const middle = sma(values, period);
  const stdDev = standardDeviation(values, period);
  
  if (middle === undefined || stdDev === undefined) return undefined;
  
  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;
  const currentPrice = values[values.length - 1];
  
  if (currentPrice === undefined) return undefined;
  
  const bandwidth = (upper - lower) / middle;
  const range = upper - lower;
  const percentB = range !== 0 ? (currentPrice - lower) / range : 0.5;
  
  return {
    upper,
    middle,
    lower,
    bandwidth,
    percentB,
  };
}

/**
 * Calculate Bollinger Bands for entire series
 * 
 * @param values - Array of price values
 * @param period - SMA period (default: 20)
 * @param stdDevMultiplier - Standard deviation multiplier (default: 2)
 * @returns Array of Bollinger Bands results
 */
export function bollingerBandsSeries(
  values: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): (BollingerBandsResult | undefined)[] {
  const result: (BollingerBandsResult | undefined)[] = [];
  
  const smaSer = smaSeries(values, period);
  const stdDevSer = standardDeviationSeries(values, period);
  
  for (let i = 0; i < values.length; i++) {
    const middle = smaSer[i];
    const stdDev = stdDevSer[i];
    const price = values[i];
    
    if (middle === undefined || stdDev === undefined || price === undefined) {
      result.push(undefined);
    } else {
      const upper = middle + stdDevMultiplier * stdDev;
      const lower = middle - stdDevMultiplier * stdDev;
      const bandwidth = (upper - lower) / middle;
      const percentB = upper !== lower ? (price - lower) / (upper - lower) : 0.5;
      
      result.push({
        upper,
        middle,
        lower,
        bandwidth,
        percentB,
      });
    }
  }
  
  return result;
}

/**
 * True Range
 * Maximum of: high-low, |high-prevClose|, |low-prevClose|
 * 
 * @param high - Current high
 * @param low - Current low
 * @param prevClose - Previous close
 * @returns True Range value
 */
export function trueRange(high: number, low: number, prevClose: number): number {
  return Math.max(
    high - low,
    Math.abs(high - prevClose),
    Math.abs(low - prevClose)
  );
}

/**
 * Average True Range (ATR)
 * Measures volatility
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param period - ATR period (default: 14)
 * @returns ATR result or undefined if insufficient data
 */
export function atr(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): ATRResult | undefined {
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period + 1) return undefined;
  
  // Calculate True Range series
  const trSeries: number[] = [];
  for (let i = 1; i < len; i++) {
    const high = highs[i];
    const low = lows[i];
    const prevClose = closes[i - 1];
    if (high !== undefined && low !== undefined && prevClose !== undefined) {
      const tr = trueRange(high, low, prevClose);
      trSeries.push(tr);
    }
  }
  
  // First ATR is simple average
  let atrValue = trSeries.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Smooth using Wilder's method
  for (let i = period; i < trSeries.length; i++) {
    const tr = trSeries[i];
    if (tr !== undefined) {
      atrValue = (atrValue * (period - 1) + tr) / period;
    }
  }
  
  const currentTR = trSeries[trSeries.length - 1];
  if (currentTR === undefined) return undefined;
  
  return {
    atr: atrValue,
    trueRange: currentTR,
  } as ATRResult;
}

/**
 * Calculate ATR for entire series
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param period - ATR period (default: 14)
 * @returns Array of ATR results
 */
export function atrSeries(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): (ATRResult | undefined)[] {
  const result: (ATRResult | undefined)[] = [];
  const len = Math.min(highs.length, lows.length, closes.length);
  
  if (len < 2) return Array(len).fill(undefined);
  
  // First value has no TR
  result.push(undefined);
  
  // Calculate True Range series
  const trSeries: number[] = [];
  for (let i = 1; i < len; i++) {
    const high = highs[i];
    const low = lows[i];
    const prevClose = closes[i - 1];
    if (high !== undefined && low !== undefined && prevClose !== undefined) {
      const tr = trueRange(high, low, prevClose);
      trSeries.push(tr);
    }
  }
  
  // Fill undefined until we have enough for first ATR
  for (let i = 1; i < period; i++) {
    result.push(undefined);
  }
  
  if (trSeries.length < period) return result;
  
  // First ATR
  let atrValue = trSeries.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const firstTR = trSeries[period - 1];
  if (firstTR !== undefined) {
    result.push({
      atr: atrValue,
      trueRange: firstTR,
    });
  }
  
  // Smooth remaining ATR values
  for (let i = period; i < trSeries.length; i++) {
    const tr = trSeries[i];
    if (tr !== undefined) {
      atrValue = (atrValue * (period - 1) + tr) / period;
      result.push({
        atr: atrValue,
        trueRange: tr,
      });
    }
  }
  
  return result;
}

/**
 * Keltner Channels
 * Similar to Bollinger Bands but uses ATR instead of standard deviation
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of closing prices
 * @param emaPeriod - EMA period (default: 20)
 * @param atrPeriod - ATR period (default: 10)
 * @param atrMultiplier - ATR multiplier (default: 2)
 * @returns Keltner Channel result or undefined if insufficient data
 */
export function keltnerChannels(
  highs: number[],
  lows: number[],
  closes: number[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  atrMultiplier: number = 2
): { upper: number; middle: number; lower: number } | undefined {
  const middle = ema(closes, emaPeriod);
  const atrResult = atr(highs, lows, closes, atrPeriod);
  
  if (middle === undefined || atrResult === undefined) return undefined;
  
  const upper = middle + atrMultiplier * atrResult.atr;
  const lower = middle - atrMultiplier * atrResult.atr;
  
  return { upper, middle, lower };
}

/**
 * Historical Volatility (Annualized)
 * 
 * @param values - Array of price values
 * @param period - Lookback period (default: 20)
 * @param annualizationFactor - Trading days per year (default: 252)
 * @returns Annualized volatility as decimal or undefined if insufficient data
 */
export function historicalVolatility(
  values: number[],
  period: number = 20,
  annualizationFactor: number = 252
): number | undefined {
  if (values.length < period + 1) return undefined;
  
  // Calculate log returns
  const returns: number[] = [];
  for (let i = values.length - period; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev !== undefined && curr !== undefined && prev > 0) {
      returns.push(Math.log(curr / prev));
    }
  }
  
  if (returns.length < period) return undefined;
  
  // Calculate standard deviation of returns
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
  const dailyVol = Math.sqrt(variance);
  
  // Annualize
  return dailyVol * Math.sqrt(annualizationFactor);
}

/**
 * Chaikin Volatility
 * Measures the rate of change of the trading range
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param emaPeriod - EMA period (default: 10)
 * @param rocPeriod - Rate of change period (default: 10)
 * @returns Chaikin Volatility or undefined if insufficient data
 */
export function chaikinVolatility(
  highs: number[],
  lows: number[],
  emaPeriod: number = 10,
  rocPeriod: number = 10
): number | undefined {
  const len = Math.min(highs.length, lows.length);
  if (len < emaPeriod + rocPeriod) return undefined;
  
  // Calculate high-low spread
  const spreads: number[] = [];
  for (let i = 0; i < len; i++) {
    const h = highs[i];
    const l = lows[i];
    if (h !== undefined && l !== undefined) {
      spreads.push(h - l);
    }
  }
  
  // EMA of spreads
  const currentEMA = ema(spreads, emaPeriod);
  const pastEMA = ema(spreads.slice(0, -rocPeriod), emaPeriod);
  
  if (currentEMA === undefined || pastEMA === undefined || pastEMA === 0) return undefined;
  
  return ((currentEMA - pastEMA) / pastEMA) * 100;
}

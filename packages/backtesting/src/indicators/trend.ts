/**
 * Trend indicators: SMA, EMA, WMA
 */

/**
 * Simple Moving Average (SMA)
 * 
 * @param values - Array of price values
 * @param period - Number of periods to average
 * @returns SMA value or undefined if insufficient data
 */
export function sma(values: number[], period: number): number | undefined {
  if (values.length < period || period <= 0) return undefined;
  
  const slice = values.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate SMA for entire series
 * 
 * @param values - Array of price values
 * @param period - Number of periods to average
 * @returns Array of SMA values (undefined until period is reached)
 */
export function smaSeries(values: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Exponential Moving Average (EMA)
 * 
 * @param values - Array of price values
 * @param period - Number of periods for EMA calculation
 * @returns EMA value or undefined if insufficient data
 */
export function ema(values: number[], period: number): number | undefined {
  if (values.length < period || period <= 0) return undefined;
  
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first period
  let emaValue = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Apply EMA formula for remaining values
  for (let i = period; i < values.length; i++) {
    const value = values[i];
    if (value !== undefined) {
      emaValue = (value - emaValue) * multiplier + emaValue;
    }
  }
  
  return emaValue;
}

/**
 * Calculate EMA for entire series
 * 
 * @param values - Array of price values
 * @param period - Number of periods for EMA calculation
 * @returns Array of EMA values (undefined until period is reached)
 */
export function emaSeries(values: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  if (values.length < period || period <= 0) {
    return values.map(() => undefined);
  }
  
  const multiplier = 2 / (period + 1);
  
  // Fill with undefined until we have enough data
  for (let i = 0; i < period - 1; i++) {
    result.push(undefined);
  }
  
  // First EMA is SMA
  let emaValue = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(emaValue);
  
  // Calculate remaining EMA values
  for (let i = period; i < values.length; i++) {
    const value = values[i];
    if (value !== undefined) {
      emaValue = (value - emaValue) * multiplier + emaValue;
    }
    result.push(emaValue);
  }
  
  return result;
}

/**
 * Weighted Moving Average (WMA)
 * More recent prices have higher weight
 * 
 * @param values - Array of price values
 * @param period - Number of periods
 * @returns WMA value or undefined if insufficient data
 */
export function wma(values: number[], period: number): number | undefined {
  if (values.length < period || period <= 0) return undefined;
  
  const slice = values.slice(-period);
  let weightedSum = 0;
  let weightSum = 0;
  
  for (let i = 0; i < period; i++) {
    const weight = i + 1;
    const value = slice[i];
    if (value !== undefined) {
      weightedSum += value * weight;
      weightSum += weight;
    }
  }
  
  return weightedSum / weightSum;
}

/**
 * Calculate WMA for entire series
 * 
 * @param values - Array of price values
 * @param period - Number of periods
 * @returns Array of WMA values (undefined until period is reached)
 */
export function wmaSeries(values: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      let weightedSum = 0;
      let weightSum = 0;
      
      for (let j = 0; j < period; j++) {
        const weight = j + 1;
        const value = slice[j];
        if (value !== undefined) {
          weightedSum += value * weight;
          weightSum += weight;
        }
      }
      
      result.push(weightedSum / weightSum);
    }
  }
  
  return result;
}

/**
 * Double Exponential Moving Average (DEMA)
 * Reduces lag compared to regular EMA
 * 
 * @param values - Array of price values
 * @param period - Number of periods
 * @returns DEMA value or undefined if insufficient data
 */
export function dema(values: number[], period: number): number | undefined {
  if (values.length < period * 2 - 1) return undefined;
  
  const ema1 = ema(values, period);
  if (ema1 === undefined) return undefined;
  
  // Calculate EMA of EMA
  const ema1Series = emaSeries(values, period);
  const ema1Values = ema1Series.filter((v): v is number => v !== undefined);
  const ema2 = ema(ema1Values, period);
  if (ema2 === undefined) return undefined;
  
  return 2 * ema1 - ema2;
}

/**
 * Triple Exponential Moving Average (TEMA)
 * Further reduces lag compared to DEMA
 * 
 * @param values - Array of price values
 * @param period - Number of periods
 * @returns TEMA value or undefined if insufficient data
 */
export function tema(values: number[], period: number): number | undefined {
  if (values.length < period * 3 - 2) return undefined;
  
  const ema1 = ema(values, period);
  if (ema1 === undefined) return undefined;
  
  const ema1Series = emaSeries(values, period);
  const ema1Values = ema1Series.filter((v): v is number => v !== undefined);
  const ema2 = ema(ema1Values, period);
  if (ema2 === undefined) return undefined;
  
  const ema2Series = emaSeries(ema1Values, period);
  const ema2Values = ema2Series.filter((v): v is number => v !== undefined);
  const ema3 = ema(ema2Values, period);
  if (ema3 === undefined) return undefined;
  
  return 3 * ema1 - 3 * ema2 + ema3;
}

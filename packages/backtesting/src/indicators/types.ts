/**
 * Types for technical indicators
 */

/**
 * MACD indicator result
 */
export interface MACDResult {
  macd: number;         // MACD line (fast EMA - slow EMA)
  signal: number;       // Signal line (EMA of MACD)
  histogram: number;    // MACD - Signal
}

/**
 * Bollinger Bands result
 */
export interface BollingerBandsResult {
  upper: number;        // Upper band (middle + k * stdDev)
  middle: number;       // Middle band (SMA)
  lower: number;        // Lower band (middle - k * stdDev)
  bandwidth: number;    // (upper - lower) / middle
  percentB: number;     // (price - lower) / (upper - lower)
}

/**
 * Stochastic oscillator result
 */
export interface StochasticResult {
  k: number;            // %K line (fast)
  d: number;            // %D line (slow, SMA of %K)
}

/**
 * ATR result with components
 */
export interface ATRResult {
  atr: number;          // Average True Range
  trueRange: number;    // Current True Range
}

/**
 * Indicator series result (for calculating over full history)
 */
export interface IndicatorSeries<T> {
  values: (T | undefined)[];
  latest: T | undefined;
}

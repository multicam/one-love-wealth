/**
 * Technical Indicators Library
 * 
 * Provides standalone indicator functions for use in trading strategies.
 * All functions work with arrays of numbers and return calculated values.
 */

// Types
export type {
  MACDResult,
  BollingerBandsResult,
  StochasticResult,
  ATRResult,
  IndicatorSeries,
} from './types';

// Trend indicators
export {
  sma,
  smaSeries,
  ema,
  emaSeries,
  wma,
  wmaSeries,
  dema,
  tema,
} from './trend';

// Momentum indicators
export {
  rsi,
  rsiSeries,
  macd,
  macdSeries,
  stochastic,
  stochasticSeries,
  roc,
  rocSeries,
  williamsR,
  cci,
} from './momentum';

// Volatility indicators
export {
  standardDeviation,
  standardDeviationSeries,
  bollingerBands,
  bollingerBandsSeries,
  trueRange,
  atr,
  atrSeries,
  keltnerChannels,
  historicalVolatility,
  chaikinVolatility,
} from './volatility';

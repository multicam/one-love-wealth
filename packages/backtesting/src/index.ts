// Types
export type {
  Bar,
  MultiBar,
  BacktestData,
  Signal,
  Trade,
  Position,
  PortfolioState,
  EquityPoint,
  BacktestConfig,
  PerformanceMetrics,
  BacktestResult,
  StrategyContext,
} from './types';

// Engine
export {
  Portfolio,
  TradeExecutor,
  BacktestEngine,
  DEFAULT_BACKTEST_CONFIG,
  runBacktest,
} from './engine';

// Strategies
export { type Strategy, BaseStrategy } from './strategies';

// Example strategies
export {
  MACrossoverStrategy,
  DEFAULT_MA_CROSSOVER_PARAMS,
  type MACrossoverParams,
  RSIReversionStrategy,
  DEFAULT_RSI_REVERSION_PARAMS,
  type RSIReversionParams,
  BuyAndHoldStrategy,
  DEFAULT_BUY_AND_HOLD_PARAMS,
  type BuyAndHoldParams,
  VIXHedgeStrategy,
  DEFAULT_VIX_HEDGE_PARAMS,
  type VIXHedgeParams,
  BollingerBreakoutStrategy,
  DEFAULT_BOLLINGER_BREAKOUT_PARAMS,
  type BollingerBreakoutParams,
  MACDDivergenceStrategy,
  DEFAULT_MACD_DIVERGENCE_PARAMS,
  type MACDDivergenceParams,
  PairsTradingStrategy,
  DEFAULT_PAIRS_TRADING_PARAMS,
  type PairsTradingParams,
} from './strategies';

// Metrics
export { calculateMetrics, formatMetrics } from './metrics';

// Data Loading
export {
  BacktestDataLoader,
  loadBacktestData,
  loadSymbol,
  type DataLoaderConfig,
  type DataLoaderResult,
  type GapFillStrategy,
} from './data';

// Indicators
export {
  // Types
  type MACDResult,
  type BollingerBandsResult,
  type StochasticResult,
  type ATRResult,
  type IndicatorSeries,
  // Trend
  sma,
  smaSeries,
  ema,
  emaSeries,
  wma,
  wmaSeries,
  dema,
  tema,
  // Momentum
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
  // Volatility
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
} from './indicators';

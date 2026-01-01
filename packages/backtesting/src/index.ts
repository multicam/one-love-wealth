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
} from './strategies';

// Metrics
export { calculateMetrics, formatMetrics } from './metrics';

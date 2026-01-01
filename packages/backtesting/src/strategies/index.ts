export { type Strategy, BaseStrategy } from './strategy';

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
} from './examples';

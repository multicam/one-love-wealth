/**
 * RSI Mean Reversion Strategy
 * 
 * Buys when RSI falls below oversold threshold
 * Sells when RSI rises above overbought threshold
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';

export interface RSIReversionParams {
  symbol: string;
  rsiPeriod: number;
  oversold: number;      // Buy threshold (e.g., 30)
  overbought: number;    // Sell threshold (e.g., 70)
  positionSize: number;
}

export const DEFAULT_RSI_REVERSION_PARAMS: RSIReversionParams = {
  symbol: 'SPY',
  rsiPeriod: 14,
  oversold: 30,
  overbought: 70,
  positionSize: 0.95,
};

export class RSIReversionStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: RSIReversionParams;

  constructor(params: Partial<RSIReversionParams> = {}) {
    super();
    this.params = { ...DEFAULT_RSI_REVERSION_PARAMS, ...params };
    this.name = `RSI Reversion (${this.params.oversold}/${this.params.overbought})`;
    this.symbols = [this.params.symbol];
  }

  onBar(ctx: StrategyContext): Signal[] {
    const { symbol, rsiPeriod, oversold, overbought, positionSize } = this.params;
    
    // Get historical closes
    const closes = this.getCloses(ctx, symbol, rsiPeriod + 10);
    if (closes.length < rsiPeriod + 1) return [];

    // Calculate RSI
    const rsi = this.rsi(closes, rsiPeriod);
    if (!rsi) return [];

    const hasPosition = this.hasPosition(ctx, symbol);
    const signals: Signal[] = [];

    // Buy on oversold
    if (rsi < oversold && !hasPosition) {
      signals.push(this.buy(symbol, {
        percentage: positionSize,
        reason: `RSI oversold: ${rsi.toFixed(1)} < ${oversold}`,
      }));
    }

    // Sell on overbought
    if (rsi > overbought && hasPosition) {
      signals.push(this.close(symbol, `RSI overbought: ${rsi.toFixed(1)} > ${overbought}`));
    }

    return signals;
  }
}

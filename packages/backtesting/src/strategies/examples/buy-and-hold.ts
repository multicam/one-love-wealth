/**
 * Buy and Hold Strategy
 * 
 * Simple benchmark strategy that buys on first bar and holds
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';

export interface BuyAndHoldParams {
  symbol: string;
  positionSize: number;
}

export const DEFAULT_BUY_AND_HOLD_PARAMS: BuyAndHoldParams = {
  symbol: 'SPY',
  positionSize: 0.99,
};

export class BuyAndHoldStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: BuyAndHoldParams;
  private hasBought = false;

  constructor(params: Partial<BuyAndHoldParams> = {}) {
    super();
    this.params = { ...DEFAULT_BUY_AND_HOLD_PARAMS, ...params };
    this.name = `Buy and Hold (${this.params.symbol})`;
    this.symbols = [this.params.symbol];
  }

  init(): void {
    this.hasBought = false;
  }

  onBar(ctx: StrategyContext): Signal[] {
    if (this.hasBought) return [];

    const { symbol, positionSize } = this.params;
    const bar = this.getBar(ctx, symbol);
    
    if (!bar) return [];

    this.hasBought = true;
    return [this.buy(symbol, {
      percentage: positionSize,
      reason: 'Initial purchase',
    })];
  }
}

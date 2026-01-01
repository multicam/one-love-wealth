/**
 * Moving Average Crossover Strategy
 * 
 * Buys when fast MA crosses above slow MA (golden cross)
 * Sells when fast MA crosses below slow MA (death cross)
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';

export interface MACrossoverParams {
  symbol: string;
  fastPeriod: number;
  slowPeriod: number;
  positionSize: number; // 0-1 percentage of portfolio
}

export const DEFAULT_MA_CROSSOVER_PARAMS: MACrossoverParams = {
  symbol: 'SPY',
  fastPeriod: 50,
  slowPeriod: 200,
  positionSize: 0.95,
};

export class MACrossoverStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: MACrossoverParams;
  private previousFastAboveSlow: boolean | null = null;

  constructor(params: Partial<MACrossoverParams> = {}) {
    super();
    this.params = { ...DEFAULT_MA_CROSSOVER_PARAMS, ...params };
    this.name = `MA Crossover (${this.params.fastPeriod}/${this.params.slowPeriod})`;
    this.symbols = [this.params.symbol];
  }

  onBar(ctx: StrategyContext): Signal[] {
    const { symbol, fastPeriod, slowPeriod, positionSize } = this.params;
    
    // Get historical closes
    const closes = this.getCloses(ctx, symbol, slowPeriod);
    if (closes.length < slowPeriod) return [];

    // Calculate moving averages
    const fastMA = this.sma(closes, fastPeriod);
    const slowMA = this.sma(closes, slowPeriod);
    
    if (!fastMA || !slowMA) return [];

    const fastAboveSlow = fastMA > slowMA;
    const hasPosition = this.hasPosition(ctx, symbol);
    const signals: Signal[] = [];

    // Check for crossover
    if (this.previousFastAboveSlow !== null) {
      // Golden cross: fast crosses above slow
      if (fastAboveSlow && !this.previousFastAboveSlow && !hasPosition) {
        signals.push(this.buy(symbol, {
          percentage: positionSize,
          reason: `Golden cross: ${fastPeriod}MA > ${slowPeriod}MA`,
        }));
      }

      // Death cross: fast crosses below slow
      if (!fastAboveSlow && this.previousFastAboveSlow && hasPosition) {
        signals.push(this.close(symbol, `Death cross: ${fastPeriod}MA < ${slowPeriod}MA`));
      }
    }

    this.previousFastAboveSlow = fastAboveSlow;
    return signals;
  }

  init(): void {
    this.previousFastAboveSlow = null;
  }
}

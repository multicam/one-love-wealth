/**
 * Bollinger Band Breakout Strategy
 * 
 * Two modes:
 * 1. Breakout mode: Buy when price breaks above upper band, sell when it breaks below
 * 2. Mean reversion mode: Buy when price touches lower band (oversold), sell at upper band
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';
import { bollingerBands, type BollingerBandsResult } from '../../indicators';

export interface BollingerBreakoutParams {
  symbol: string;
  /** Bollinger Band period (default: 20) */
  period: number;
  /** Standard deviation multiplier (default: 2) */
  stdDev: number;
  /** Position size as percentage of portfolio (0-1) */
  positionSize: number;
  /** Strategy mode: 'breakout' or 'reversion' */
  mode: 'breakout' | 'reversion';
  /** For reversion mode: buy when %B is below this (default: 0.1) */
  oversoldThreshold: number;
  /** For reversion mode: sell when %B is above this (default: 0.9) */
  overboughtThreshold: number;
  /** Use stop loss based on middle band */
  useStopLoss: boolean;
}

export const DEFAULT_BOLLINGER_BREAKOUT_PARAMS: BollingerBreakoutParams = {
  symbol: 'SPY',
  period: 20,
  stdDev: 2,
  positionSize: 0.95,
  mode: 'reversion',
  oversoldThreshold: 0.1,
  overboughtThreshold: 0.9,
  useStopLoss: true,
};

export class BollingerBreakoutStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: BollingerBreakoutParams;
  private previousBB: BollingerBandsResult | null = null;

  constructor(params: Partial<BollingerBreakoutParams> = {}) {
    super();
    this.params = { ...DEFAULT_BOLLINGER_BREAKOUT_PARAMS, ...params };
    this.name = `Bollinger ${this.params.mode} (${this.params.period}, ${this.params.stdDev}σ)`;
    this.symbols = [this.params.symbol];
  }

  init(): void {
    this.previousBB = null;
  }

  onBar(ctx: StrategyContext): Signal[] {
    const {
      symbol,
      period,
      stdDev,
      positionSize,
      mode,
      oversoldThreshold,
      overboughtThreshold,
      useStopLoss,
    } = this.params;

    // Get historical closes
    const closes = this.getCloses(ctx, symbol, period + 5);
    if (closes.length < period) return [];

    // Calculate Bollinger Bands
    const bb = bollingerBands(closes, period, stdDev);
    if (!bb) return [];

    const currentPrice = this.getClose(ctx, symbol);
    if (!currentPrice) return [];

    const hasPosition = this.hasPosition(ctx, symbol);
    const signals: Signal[] = [];

    if (mode === 'breakout') {
      // Breakout mode: trade in direction of band break
      if (this.previousBB) {
        const previousClose = closes[closes.length - 2];
        
        // Breakout above upper band
        if (previousClose && previousClose <= this.previousBB.upper && currentPrice > bb.upper) {
          if (!hasPosition) {
            signals.push(this.buy(symbol, {
              percentage: positionSize,
              reason: `Breakout above upper band ($${bb.upper.toFixed(2)})`,
            }));
          }
        }
        
        // Break below lower band - exit long
        if (previousClose && previousClose >= this.previousBB.lower && currentPrice < bb.lower) {
          if (hasPosition) {
            signals.push(this.close(symbol, `Break below lower band ($${bb.lower.toFixed(2)})`));
          }
        }
      }
    } else {
      // Mean reversion mode: buy low, sell high
      const percentB = bb.percentB;

      // Buy when price is near/below lower band (oversold)
      if (percentB < oversoldThreshold && !hasPosition) {
        signals.push(this.buy(symbol, {
          percentage: positionSize,
          reason: `Oversold: %B=${(percentB * 100).toFixed(1)}% < ${oversoldThreshold * 100}%`,
        }));
      }

      // Sell when price is near/above upper band (overbought)
      if (percentB > overboughtThreshold && hasPosition) {
        signals.push(this.close(symbol, 
          `Overbought: %B=${(percentB * 100).toFixed(1)}% > ${overboughtThreshold * 100}%`
        ));
      }

      // Stop loss: exit if price falls below middle band after entry
      if (useStopLoss && hasPosition && currentPrice < bb.middle) {
        // Only trigger stop if we were previously above middle
        const prevClose = closes[closes.length - 2];
        if (this.previousBB && prevClose !== undefined && prevClose > this.previousBB.middle) {
          signals.push(this.close(symbol, `Stop loss: price crossed below middle band ($${bb.middle.toFixed(2)})`));
        }
      }
    }

    this.previousBB = bb;
    return signals;
  }
}

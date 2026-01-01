/**
 * Pairs Trading Strategy
 * 
 * A market-neutral strategy that trades the spread between two correlated assets.
 * When the spread widens beyond a threshold (z-score), we:
 * - Go long the underperformer
 * - Go short the outperformer (if allowed)
 * 
 * The strategy profits when the spread reverts to its mean.
 * 
 * Common pairs: SPY/IWM, XLF/XLK, GLD/GDX, etc.
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext, Bar } from '../../types';
import { sma, standardDeviation } from '../../indicators';

export interface PairsTradingParams {
  /** First symbol in the pair (typically the one we go long) */
  symbolA: string;
  /** Second symbol in the pair (typically the one we go short) */
  symbolB: string;
  /** Lookback period for calculating spread mean and std dev (default: 20) */
  lookbackPeriod: number;
  /** Z-score threshold to enter trade (default: 2.0) */
  entryZScore: number;
  /** Z-score threshold to exit trade (default: 0.5) */
  exitZScore: number;
  /** Position size as percentage of portfolio for each leg (0-1) */
  positionSize: number;
  /** Allow short selling for full pairs trade */
  allowShort: boolean;
  /** Use ratio instead of price difference for spread */
  useRatio: boolean;
  /** Optional hedge ratio (default: 1.0, meaning equal dollar amounts) */
  hedgeRatio: number;
}

export const DEFAULT_PAIRS_TRADING_PARAMS: PairsTradingParams = {
  symbolA: 'SPY',
  symbolB: 'IWM',
  lookbackPeriod: 20,
  entryZScore: 2.0,
  exitZScore: 0.5,
  positionSize: 0.45, // 45% each for a total of 90%
  allowShort: false,
  useRatio: true,
  hedgeRatio: 1.0,
};

type PositionState = 'flat' | 'long_spread' | 'short_spread';

export class PairsTradingStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: PairsTradingParams;
  private positionState: PositionState = 'flat';

  constructor(params: Partial<PairsTradingParams> = {}) {
    super();
    this.params = { ...DEFAULT_PAIRS_TRADING_PARAMS, ...params };
    this.name = `Pairs Trading (${this.params.symbolA}/${this.params.symbolB})`;
    this.symbols = [this.params.symbolA, this.params.symbolB];
  }

  init(): void {
    this.positionState = 'flat';
  }

  private calculateSpread(priceA: number, priceB: number): number {
    if (this.params.useRatio) {
      return priceA / priceB;
    }
    return priceA - priceB * this.params.hedgeRatio;
  }

  private getSpreadHistory(ctx: StrategyContext, periods: number): number[] {
    const spreads: number[] = [];
    const start = Math.max(0, ctx.barIndex - periods + 1);
    
    for (let i = start; i <= ctx.barIndex; i++) {
      const barA = ctx.history[i]?.bars[this.params.symbolA];
      const barB = ctx.history[i]?.bars[this.params.symbolB];
      
      if (barA && barB) {
        spreads.push(this.calculateSpread(barA.close, barB.close));
      }
    }
    
    return spreads;
  }

  private calculateZScore(spreads: number[]): number | undefined {
    if (spreads.length < this.params.lookbackPeriod) return undefined;
    
    const mean = sma(spreads, this.params.lookbackPeriod);
    const std = standardDeviation(spreads, this.params.lookbackPeriod);
    
    if (!mean || !std || std === 0) return undefined;
    
    const currentSpread = spreads[spreads.length - 1];
    if (currentSpread === undefined) return undefined;
    
    return (currentSpread - mean) / std;
  }

  onBar(ctx: StrategyContext): Signal[] {
    const {
      symbolA,
      symbolB,
      lookbackPeriod,
      entryZScore,
      exitZScore,
      positionSize,
      allowShort,
    } = this.params;

    // Get current prices
    const barA = this.getBar(ctx, symbolA);
    const barB = this.getBar(ctx, symbolB);
    
    if (!barA || !barB) return [];

    // Get spread history
    const spreads = this.getSpreadHistory(ctx, lookbackPeriod + 5);
    if (spreads.length < lookbackPeriod) return [];

    // Calculate z-score
    const zScore = this.calculateZScore(spreads);
    if (zScore === undefined) return [];

    const signals: Signal[] = [];
    const hasPositionA = this.hasPosition(ctx, symbolA);
    const hasPositionB = this.hasPosition(ctx, symbolB);

    // Entry signals
    if (this.positionState === 'flat') {
      // Spread is too high: short spread (sell A, buy B)
      if (zScore > entryZScore) {
        if (allowShort) {
          // Full pairs trade: short A, long B
          signals.push(this.sell(symbolA, {
            percentage: positionSize,
            reason: `Short spread: z-score=${zScore.toFixed(2)} > ${entryZScore}`,
          }));
          signals.push(this.buy(symbolB, {
            percentage: positionSize,
            reason: `Long B (spread reversion): z-score=${zScore.toFixed(2)}`,
          }));
          this.positionState = 'short_spread';
        } else {
          // Long-only version: just buy the underperformer (B)
          signals.push(this.buy(symbolB, {
            percentage: positionSize * 2,
            reason: `Long underperformer: z-score=${zScore.toFixed(2)} > ${entryZScore}`,
          }));
          this.positionState = 'short_spread';
        }
      }
      
      // Spread is too low: long spread (buy A, sell B)
      if (zScore < -entryZScore) {
        if (allowShort) {
          // Full pairs trade: long A, short B
          signals.push(this.buy(symbolA, {
            percentage: positionSize,
            reason: `Long spread: z-score=${zScore.toFixed(2)} < ${-entryZScore}`,
          }));
          signals.push(this.sell(symbolB, {
            percentage: positionSize,
            reason: `Short B (spread reversion): z-score=${zScore.toFixed(2)}`,
          }));
          this.positionState = 'long_spread';
        } else {
          // Long-only version: just buy the underperformer (A)
          signals.push(this.buy(symbolA, {
            percentage: positionSize * 2,
            reason: `Long underperformer: z-score=${zScore.toFixed(2)} < ${-entryZScore}`,
          }));
          this.positionState = 'long_spread';
        }
      }
    }

    // Exit signals - spread has reverted to mean
    if (this.positionState === 'long_spread') {
      if (zScore > -exitZScore) {
        // Close long spread position
        if (hasPositionA) {
          signals.push(this.close(symbolA, `Spread reverted: z-score=${zScore.toFixed(2)}`));
        }
        if (hasPositionB && allowShort) {
          signals.push(this.close(symbolB, `Spread reverted: z-score=${zScore.toFixed(2)}`));
        }
        this.positionState = 'flat';
      }
    }

    if (this.positionState === 'short_spread') {
      if (zScore < exitZScore) {
        // Close short spread position
        if (hasPositionA && allowShort) {
          signals.push(this.close(symbolA, `Spread reverted: z-score=${zScore.toFixed(2)}`));
        }
        if (hasPositionB) {
          signals.push(this.close(symbolB, `Spread reverted: z-score=${zScore.toFixed(2)}`));
        }
        this.positionState = 'flat';
      }
    }

    return signals;
  }
}

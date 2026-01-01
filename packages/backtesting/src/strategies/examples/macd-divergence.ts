/**
 * MACD Divergence Strategy
 * 
 * Identifies divergence between price and MACD to spot potential reversals:
 * - Bullish divergence: Price makes lower lows, MACD makes higher lows → Buy signal
 * - Bearish divergence: Price makes higher highs, MACD makes lower highs → Sell signal
 * 
 * Also supports standard MACD crossover signals.
 */

import { BaseStrategy } from '../strategy';
import type { Signal, StrategyContext } from '../../types';
import { macdSeries, type MACDResult } from '../../indicators';

export interface MACDDivergenceParams {
  symbol: string;
  /** MACD fast period (default: 12) */
  fastPeriod: number;
  /** MACD slow period (default: 26) */
  slowPeriod: number;
  /** MACD signal period (default: 9) */
  signalPeriod: number;
  /** Number of bars to look back for divergence (default: 14) */
  divergenceLookback: number;
  /** Minimum price change % to consider a new high/low (default: 0.5%) */
  minPriceChange: number;
  /** Position size as percentage of portfolio (0-1) */
  positionSize: number;
  /** Use standard crossover signals in addition to divergence */
  useCrossoverSignals: boolean;
  /** Use histogram for signals instead of MACD line */
  useHistogram: boolean;
}

export const DEFAULT_MACD_DIVERGENCE_PARAMS: MACDDivergenceParams = {
  symbol: 'SPY',
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
  divergenceLookback: 14,
  minPriceChange: 0.005, // 0.5%
  positionSize: 0.95,
  useCrossoverSignals: false,
  useHistogram: true,
};

interface PeakTrough {
  index: number;
  price: number;
  macdValue: number;
}

export class MACDDivergenceStrategy extends BaseStrategy {
  readonly name: string;
  readonly symbols: string[];
  
  private params: MACDDivergenceParams;
  private previousMACD: MACDResult | null = null;

  constructor(params: Partial<MACDDivergenceParams> = {}) {
    super();
    this.params = { ...DEFAULT_MACD_DIVERGENCE_PARAMS, ...params };
    this.name = `MACD Divergence (${this.params.fastPeriod}/${this.params.slowPeriod}/${this.params.signalPeriod})`;
    this.symbols = [this.params.symbol];
  }

  init(): void {
    this.previousMACD = null;
  }

  private findRecentLows(
    closes: number[],
    macdValues: (MACDResult | undefined)[],
    lookback: number
  ): PeakTrough[] {
    const lows: PeakTrough[] = [];
    const start = Math.max(1, closes.length - lookback);
    
    for (let i = start; i < closes.length - 1; i++) {
      const prev = closes[i - 1];
      const curr = closes[i];
      const next = closes[i + 1];
      const macd = macdValues[i];
      
      if (prev !== undefined && curr !== undefined && next !== undefined && macd) {
        // Local minimum: price lower than neighbors
        if (curr < prev && curr < next) {
          lows.push({
            index: i,
            price: curr,
            macdValue: this.params.useHistogram ? macd.histogram : macd.macd,
          });
        }
      }
    }
    
    return lows;
  }

  private findRecentHighs(
    closes: number[],
    macdValues: (MACDResult | undefined)[],
    lookback: number
  ): PeakTrough[] {
    const highs: PeakTrough[] = [];
    const start = Math.max(1, closes.length - lookback);
    
    for (let i = start; i < closes.length - 1; i++) {
      const prev = closes[i - 1];
      const curr = closes[i];
      const next = closes[i + 1];
      const macd = macdValues[i];
      
      if (prev !== undefined && curr !== undefined && next !== undefined && macd) {
        // Local maximum: price higher than neighbors
        if (curr > prev && curr > next) {
          highs.push({
            index: i,
            price: curr,
            macdValue: this.params.useHistogram ? macd.histogram : macd.macd,
          });
        }
      }
    }
    
    return highs;
  }

  private detectBullishDivergence(
    closes: number[],
    macdValues: (MACDResult | undefined)[]
  ): boolean {
    const lows = this.findRecentLows(closes, macdValues, this.params.divergenceLookback);
    
    if (lows.length < 2) return false;
    
    // Compare last two lows
    const prevLow = lows[lows.length - 2];
    const currLow = lows[lows.length - 1];
    
    if (!prevLow || !currLow) return false;
    
    // Bullish divergence: price makes lower low, MACD makes higher low
    const priceLowerLow = currLow.price < prevLow.price * (1 - this.params.minPriceChange);
    const macdHigherLow = currLow.macdValue > prevLow.macdValue;
    
    return priceLowerLow && macdHigherLow;
  }

  private detectBearishDivergence(
    closes: number[],
    macdValues: (MACDResult | undefined)[]
  ): boolean {
    const highs = this.findRecentHighs(closes, macdValues, this.params.divergenceLookback);
    
    if (highs.length < 2) return false;
    
    // Compare last two highs
    const prevHigh = highs[highs.length - 2];
    const currHigh = highs[highs.length - 1];
    
    if (!prevHigh || !currHigh) return false;
    
    // Bearish divergence: price makes higher high, MACD makes lower high
    const priceHigherHigh = currHigh.price > prevHigh.price * (1 + this.params.minPriceChange);
    const macdLowerHigh = currHigh.macdValue < prevHigh.macdValue;
    
    return priceHigherHigh && macdLowerHigh;
  }

  onBar(ctx: StrategyContext): Signal[] {
    const {
      symbol,
      fastPeriod,
      slowPeriod,
      signalPeriod,
      positionSize,
      useCrossoverSignals,
    } = this.params;

    // Get historical closes
    const minBars = slowPeriod + signalPeriod + this.params.divergenceLookback;
    const closes = this.getCloses(ctx, symbol, minBars);
    if (closes.length < minBars) return [];

    // Calculate MACD series
    const macdValues = macdSeries(closes, fastPeriod, slowPeriod, signalPeriod);
    const currentMACD = macdValues[macdValues.length - 1];
    
    if (!currentMACD) return [];

    const hasPosition = this.hasPosition(ctx, symbol);
    const signals: Signal[] = [];

    // Check for divergence signals
    const bullishDivergence = this.detectBullishDivergence(closes, macdValues);
    const bearishDivergence = this.detectBearishDivergence(closes, macdValues);

    if (bullishDivergence && !hasPosition) {
      signals.push(this.buy(symbol, {
        percentage: positionSize,
        reason: 'Bullish divergence detected (price lower low, MACD higher low)',
      }));
    }

    if (bearishDivergence && hasPosition) {
      signals.push(this.close(symbol, 'Bearish divergence detected (price higher high, MACD lower high)'));
    }

    // Optional: standard MACD crossover signals
    if (useCrossoverSignals && this.previousMACD && signals.length === 0) {
      // Bullish crossover: MACD crosses above signal
      if (this.previousMACD.macd <= this.previousMACD.signal && 
          currentMACD.macd > currentMACD.signal && !hasPosition) {
        signals.push(this.buy(symbol, {
          percentage: positionSize,
          reason: 'MACD bullish crossover',
        }));
      }

      // Bearish crossover: MACD crosses below signal
      if (this.previousMACD.macd >= this.previousMACD.signal && 
          currentMACD.macd < currentMACD.signal && hasPosition) {
        signals.push(this.close(symbol, 'MACD bearish crossover'));
      }
    }

    this.previousMACD = currentMACD;
    return signals;
  }
}

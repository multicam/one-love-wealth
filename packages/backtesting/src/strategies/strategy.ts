/**
 * Strategy interface and base implementation
 */

import type { Signal, StrategyContext, Bar } from '../types';

/**
 * Strategy interface that all trading strategies must implement
 */
export interface Strategy {
  /** Strategy name for identification */
  readonly name: string;
  
  /** Symbols required by this strategy */
  readonly symbols: string[];

  /**
   * Called once before backtest starts
   */
  init?(): void;

  /**
   * Called on each bar - return signals to execute
   */
  onBar(ctx: StrategyContext): Signal[];

  /**
   * Called once after backtest completes
   */
  onEnd?(): void;
}

/**
 * Base strategy class with helper methods
 */
export abstract class BaseStrategy implements Strategy {
  abstract readonly name: string;
  abstract readonly symbols: string[];

  /**
   * Called on each bar - implement in subclass
   */
  abstract onBar(ctx: StrategyContext): Signal[];

  /**
   * Helper: Get closing price for a symbol
   */
  protected getClose(ctx: StrategyContext, symbol: string): number | undefined {
    return ctx.bar.bars[symbol]?.close;
  }

  /**
   * Helper: Get bar for a symbol
   */
  protected getBar(ctx: StrategyContext, symbol: string): Bar | undefined {
    return ctx.bar.bars[symbol];
  }

  /**
   * Helper: Get historical closes for a symbol
   */
  protected getCloses(ctx: StrategyContext, symbol: string, periods: number): number[] {
    const closes: number[] = [];
    const start = Math.max(0, ctx.barIndex - periods + 1);
    
    for (let i = start; i <= ctx.barIndex; i++) {
      const bar = ctx.history[i]?.bars[symbol];
      if (bar) closes.push(bar.close);
    }
    
    return closes;
  }

  /**
   * Helper: Calculate simple moving average
   */
  protected sma(values: number[], period: number): number | undefined {
    if (values.length < period) return undefined;
    
    const slice = values.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Helper: Calculate exponential moving average
   */
  protected ema(values: number[], period: number): number | undefined {
    if (values.length < period) return undefined;
    
    const multiplier = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < values.length; i++) {
      const value = values[i];
      if (value !== undefined) {
        ema = (value - ema) * multiplier + ema;
      }
    }
    
    return ema;
  }

  /**
   * Helper: Calculate RSI
   */
  protected rsi(values: number[], period: number = 14): number | undefined {
    if (values.length < period + 1) return undefined;
    
    let gains = 0;
    let losses = 0;
    
    // Initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      if (prev === undefined || curr === undefined) continue;
      
      const change = curr - prev;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Smooth average for remaining values
    for (let i = period + 1; i < values.length; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      if (prev === undefined || curr === undefined) continue;
      
      const change = curr - prev;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Helper: Check if we have a position in a symbol
   */
  protected hasPosition(ctx: StrategyContext, symbol: string): boolean {
    return ctx.portfolio.positions.some(p => p.symbol === symbol && p.quantity !== 0);
  }

  /**
   * Helper: Get position quantity (0 if no position)
   */
  protected getPositionQuantity(ctx: StrategyContext, symbol: string): number {
    const position = ctx.portfolio.positions.find(p => p.symbol === symbol);
    return position?.quantity ?? 0;
  }

  /**
   * Helper: Create a buy signal
   */
  protected buy(
    symbol: string,
    options: { quantity?: number; percentage?: number; reason?: string } = {}
  ): Signal {
    return {
      type: 'buy',
      symbol,
      ...options,
    };
  }

  /**
   * Helper: Create a sell signal
   */
  protected sell(
    symbol: string,
    options: { quantity?: number; percentage?: number; reason?: string } = {}
  ): Signal {
    return {
      type: 'sell',
      symbol,
      ...options,
    };
  }

  /**
   * Helper: Create a close position signal
   */
  protected close(symbol: string, reason?: string): Signal {
    return {
      type: 'close',
      symbol,
      reason,
    };
  }
}

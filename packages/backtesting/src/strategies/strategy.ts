/**
 * Strategy interface and base implementation
 */

import type { Signal, StrategyContext, Bar } from '../types';
import { sma as calcSma, ema as calcEma, rsi as calcRsi } from '../indicators';

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
    return calcSma(values, period);
  }

  /**
   * Helper: Calculate exponential moving average
   */
  protected ema(values: number[], period: number): number | undefined {
    return calcEma(values, period);
  }

  /**
   * Helper: Calculate RSI
   */
  protected rsi(values: number[], period: number = 14): number | undefined {
    return calcRsi(values, period);
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

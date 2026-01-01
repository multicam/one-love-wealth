/**
 * Trade execution with commission and slippage handling
 */

import type { Signal, Trade, Bar, BacktestConfig } from '../types';
import { Portfolio } from './portfolio';

/**
 * TradeExecutor handles signal-to-trade conversion with realistic costs
 */
export class TradeExecutor {
  private readonly config: BacktestConfig;

  constructor(config: BacktestConfig) {
    this.config = config;
  }

  /**
   * Execute a signal and return the resulting trade (or null if failed)
   */
  executeSignal(
    signal: Signal,
    portfolio: Portfolio,
    currentBar: Bar
  ): Trade | null {
    const price = currentBar.close;
    const commission = this.calculateCommission(signal, price);
    const slippage = this.config.slippage ?? 0.001;

    // Determine quantity
    let quantity: number;
    if (signal.quantity !== undefined) {
      quantity = signal.quantity;
    } else if (signal.percentage !== undefined) {
      quantity = portfolio.calculateQuantityFromPercentage(
        signal.symbol,
        signal.percentage,
        price
      );
    } else {
      // Default to closing position or using 10% of portfolio
      if (signal.type === 'close') {
        const position = portfolio.getPosition(signal.symbol);
        quantity = Math.abs(position?.quantity ?? 0);
      } else {
        quantity = portfolio.calculateQuantityFromPercentage(
          signal.symbol,
          0.1,
          price
        );
      }
    }

    if (quantity <= 0) {
      return null;
    }

    // Check max position size
    if (signal.type === 'buy') {
      if (portfolio.wouldExceedMaxPosition(signal.symbol, quantity, price)) {
        // Reduce quantity to max allowed
        const maxSize = this.config.maxPositionSize ?? 1;
        const totalValue = portfolio.getTotalValue();
        const maxValue = totalValue * maxSize;
        const currentPosition = portfolio.getPosition(signal.symbol);
        const currentValue = (currentPosition?.quantity ?? 0) * price;
        const availableValue = maxValue - currentValue;
        quantity = Math.floor(availableValue / price);
        
        if (quantity <= 0) return null;
      }
    }

    // Execute the trade
    let trade: Trade | null = null;

    switch (signal.type) {
      case 'buy':
        trade = portfolio.executeBuy(signal.symbol, quantity, price, commission, slippage);
        break;
      case 'sell':
        trade = portfolio.executeSell(signal.symbol, quantity, price, commission, slippage);
        break;
      case 'close':
        trade = portfolio.closePosition(signal.symbol, price, commission, slippage);
        break;
    }

    if (trade && signal.reason) {
      trade.reason = signal.reason;
    }

    return trade;
  }

  /**
   * Calculate commission for a trade
   */
  private calculateCommission(signal: Signal, price: number): number {
    const quantity = signal.quantity ?? 1;
    const value = quantity * price;

    // Per-share commission
    const perShare = (this.config.commission ?? 0) * quantity;
    
    // Percentage commission
    const percentage = (this.config.commissionPercent ?? 0) * value;

    return perShare + percentage;
  }
}

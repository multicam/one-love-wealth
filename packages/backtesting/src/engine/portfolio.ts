/**
 * Portfolio management for backtesting
 */

import type {
  Position,
  PortfolioState,
  Trade,
  Bar,
  BacktestConfig,
} from '../types';

/**
 * Internal position tracking
 */
interface InternalPosition {
  symbol: string;
  quantity: number;
  totalCost: number;      // Total cost basis
  averageCost: number;
}

/**
 * Portfolio class manages positions, cash, and tracks equity
 */
export class Portfolio {
  private cash: number;
  private positions: Map<string, InternalPosition> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private peakEquity: number;
  private readonly config: BacktestConfig;

  constructor(config: BacktestConfig) {
    this.config = config;
    this.cash = config.initialCapital;
    this.peakEquity = config.initialCapital;
  }

  /**
   * Get current cash balance
   */
  getCash(): number {
    return this.cash;
  }

  /**
   * Get position for a symbol (or undefined if none)
   */
  getPosition(symbol: string): Position | undefined {
    const pos = this.positions.get(symbol);
    if (!pos || pos.quantity === 0) return undefined;

    const currentPrice = this.currentPrices.get(symbol) ?? pos.averageCost;
    const marketValue = pos.quantity * currentPrice;
    const unrealizedPnL = marketValue - pos.totalCost;
    const unrealizedPnLPercent = pos.totalCost !== 0 
      ? unrealizedPnL / Math.abs(pos.totalCost) 
      : 0;

    return {
      symbol: pos.symbol,
      quantity: pos.quantity,
      averageCost: pos.averageCost,
      currentPrice,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPercent,
    };
  }

  /**
   * Get all current positions
   */
  getPositions(): Position[] {
    const positions: Position[] = [];
    for (const symbol of this.positions.keys()) {
      const pos = this.getPosition(symbol);
      if (pos) positions.push(pos);
    }
    return positions;
  }

  /**
   * Calculate total portfolio value (cash + positions)
   */
  getTotalValue(): number {
    let total = this.cash;
    for (const pos of this.positions.values()) {
      const price = this.currentPrices.get(pos.symbol) ?? pos.averageCost;
      total += pos.quantity * price;
    }
    return total;
  }

  /**
   * Get current drawdown from peak
   */
  getDrawdown(): { drawdown: number; drawdownPercent: number } {
    const equity = this.getTotalValue();
    const drawdown = equity - this.peakEquity;
    const drawdownPercent = this.peakEquity !== 0 
      ? drawdown / this.peakEquity 
      : 0;
    return { drawdown, drawdownPercent };
  }

  /**
   * Update prices and track peak equity
   */
  updatePrices(prices: Record<string, Bar>): void {
    for (const [symbol, bar] of Object.entries(prices)) {
      this.currentPrices.set(symbol, bar.close);
    }
    
    // Update peak equity for drawdown tracking
    const equity = this.getTotalValue();
    if (equity > this.peakEquity) {
      this.peakEquity = equity;
    }
  }

  /**
   * Execute a buy order
   */
  executeBuy(
    symbol: string,
    quantity: number,
    price: number,
    commission: number,
    slippage: number
  ): Trade | null {
    const executionPrice = price * (1 + slippage);
    const value = quantity * executionPrice;
    const totalCost = value + commission;

    // Check if we have enough cash
    if (totalCost > this.cash) {
      return null;
    }

    // Deduct cash
    this.cash -= totalCost;

    // Update position
    const existing = this.positions.get(symbol);
    if (existing) {
      existing.quantity += quantity;
      existing.totalCost += value;
      existing.averageCost = existing.totalCost / existing.quantity;
    } else {
      this.positions.set(symbol, {
        symbol,
        quantity,
        totalCost: value,
        averageCost: executionPrice,
      });
    }

    // Update current price
    this.currentPrices.set(symbol, executionPrice);

    return {
      id: `${symbol}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      side: 'buy',
      quantity,
      price: executionPrice,
      value,
      commission,
      slippage: slippage * price * quantity,
      timestamp: Date.now(),
    };
  }

  /**
   * Execute a sell order
   */
  executeSell(
    symbol: string,
    quantity: number,
    price: number,
    commission: number,
    slippage: number
  ): Trade | null {
    const position = this.positions.get(symbol);
    
    // Check if we have the position
    if (!position || position.quantity < quantity) {
      if (!this.config.allowShort) {
        return null;
      }
    }

    const executionPrice = price * (1 - slippage);
    const value = quantity * executionPrice;
    const proceeds = value - commission;

    // Add cash
    this.cash += proceeds;

    // Update position
    if (position) {
      position.quantity -= quantity;
      if (position.quantity === 0) {
        position.totalCost = 0;
        position.averageCost = 0;
      } else {
        // Reduce cost basis proportionally
        const soldRatio = quantity / (position.quantity + quantity);
        position.totalCost *= (1 - soldRatio);
      }
    } else if (this.config.allowShort) {
      // Open short position
      this.positions.set(symbol, {
        symbol,
        quantity: -quantity,
        totalCost: -value,
        averageCost: executionPrice,
      });
    }

    // Update current price
    this.currentPrices.set(symbol, executionPrice);

    return {
      id: `${symbol}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      side: 'sell',
      quantity,
      price: executionPrice,
      value,
      commission,
      slippage: slippage * price * quantity,
      timestamp: Date.now(),
    };
  }

  /**
   * Close entire position in a symbol
   */
  closePosition(
    symbol: string,
    price: number,
    commission: number,
    slippage: number
  ): Trade | null {
    const position = this.positions.get(symbol);
    if (!position || position.quantity === 0) {
      return null;
    }

    if (position.quantity > 0) {
      return this.executeSell(symbol, position.quantity, price, commission, slippage);
    } else {
      return this.executeBuy(symbol, -position.quantity, price, commission, slippage);
    }
  }

  /**
   * Get current portfolio state
   */
  getState(timestamp: number): PortfolioState {
    const positions = this.getPositions();
    const totalValue = this.getTotalValue();

    return {
      timestamp,
      cash: this.cash,
      positions,
      totalValue,
      equity: totalValue,
    };
  }

  /**
   * Calculate quantity for a percentage-based order
   */
  calculateQuantityFromPercentage(
    symbol: string,
    percentage: number,
    price: number
  ): number {
    const targetValue = this.getTotalValue() * percentage;
    const quantity = Math.floor(targetValue / price);
    return Math.max(0, quantity);
  }

  /**
   * Check if order would exceed max position size
   */
  wouldExceedMaxPosition(
    symbol: string,
    additionalQuantity: number,
    price: number
  ): boolean {
    const maxSize = this.config.maxPositionSize ?? 1;
    const totalValue = this.getTotalValue();
    
    const currentPosition = this.positions.get(symbol);
    const currentQuantity = currentPosition?.quantity ?? 0;
    const newQuantity = currentQuantity + additionalQuantity;
    const newValue = newQuantity * price;
    
    return Math.abs(newValue) > totalValue * maxSize;
  }
}

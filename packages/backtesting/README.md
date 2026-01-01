# @one-love-wealth/backtesting

Backtesting engine for trading strategies.

## Installation

```bash
bun install
```

## Quick Start

```typescript
import { BacktestEngine, BaseStrategy, runBacktest } from '@one-love-wealth/backtesting';
import type { Signal, StrategyContext, BacktestData } from '@one-love-wealth/backtesting';

// Define a simple moving average crossover strategy
class MACrossover extends BaseStrategy {
  readonly name = 'MA Crossover';
  readonly symbols = ['SPY'];

  private fastPeriod = 50;
  private slowPeriod = 200;

  onBar(ctx: StrategyContext): Signal[] {
    const closes = this.getCloses(ctx, 'SPY', this.slowPeriod);
    if (closes.length < this.slowPeriod) return [];

    const fastMA = this.sma(closes, this.fastPeriod);
    const slowMA = this.sma(closes, this.slowPeriod);
    
    if (!fastMA || !slowMA) return [];

    const hasPosition = this.hasPosition(ctx, 'SPY');

    // Buy when fast crosses above slow
    if (fastMA > slowMA && !hasPosition) {
      return [this.buy('SPY', { percentage: 0.95, reason: 'Golden cross' })];
    }

    // Sell when fast crosses below slow
    if (fastMA < slowMA && hasPosition) {
      return [this.close('SPY', 'Death cross')];
    }

    return [];
  }
}

// Run backtest
const result = runBacktest(
  new MACrossover(),
  data, // BacktestData with historical prices
  { initialCapital: 100000 }
);

console.log('Total Return:', result.metrics.totalReturnPercent.toFixed(2) + '%');
console.log('Sharpe Ratio:', result.metrics.sharpeRatio.toFixed(2));
console.log('Max Drawdown:', result.metrics.maxDrawdownPercent.toFixed(2) + '%');
```

## Features

### Strategy Interface

Strategies implement the `Strategy` interface:

```typescript
interface Strategy {
  name: string;
  symbols: string[];
  init?(): void;
  onBar(ctx: StrategyContext): Signal[];
  onEnd?(): void;
}
```

### BaseStrategy Helpers

Extend `BaseStrategy` for convenient helper methods:

- `getClose(ctx, symbol)` - Get closing price
- `getBar(ctx, symbol)` - Get full OHLCV bar
- `getCloses(ctx, symbol, periods)` - Get historical closes
- `sma(values, period)` - Simple moving average
- `ema(values, period)` - Exponential moving average  
- `rsi(values, period)` - Relative Strength Index
- `hasPosition(ctx, symbol)` - Check if holding position
- `buy(symbol, options)` - Create buy signal
- `sell(symbol, options)` - Create sell signal
- `close(symbol, reason)` - Create close position signal

### Signal Types

```typescript
interface Signal {
  type: 'buy' | 'sell' | 'close';
  symbol: string;
  quantity?: number;      // Absolute shares
  percentage?: number;    // % of portfolio (0-1)
  reason?: string;
}
```

### Backtest Configuration

```typescript
interface BacktestConfig {
  initialCapital: number;
  commission?: number;           // Per-share commission
  commissionPercent?: number;    // Percentage commission
  slippage?: number;             // Slippage percentage (default: 0.1%)
  maxPositionSize?: number;      // Max % per position (default: 100%)
  allowShort?: boolean;          // Allow short selling
}
```

### Performance Metrics

The engine calculates:

- **Returns**: Total return, CAGR
- **Risk**: Max drawdown, volatility, Sharpe ratio, Sortino ratio, Calmar ratio
- **Trading**: Win rate, profit factor, average win/loss, trade count

## Data Format

```typescript
interface BacktestData {
  symbols: string[];
  bars: MultiBar[];  // Array of { time, bars: { [symbol]: Bar } }
  startDate: Date;
  endDate: Date;
}

interface Bar {
  time: number;  // Unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

## Development

```bash
# Build
bun run build

# Test
bun test

# Type check
bun run typecheck
```

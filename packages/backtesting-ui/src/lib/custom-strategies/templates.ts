/**
 * Custom Strategy Templates
 * Starter code templates for creating custom strategies
 */

import type { CustomStrategyTemplate } from './types';

/**
 * Simple Moving Average Template
 * Basic trend-following strategy template
 */
export const SIMPLE_MA_TEMPLATE: CustomStrategyTemplate = {
  id: 'custom-simple-ma',
  name: 'Simple MA Template',
  description: 'Template for a simple moving average strategy',
  code: `// Custom Moving Average Strategy
// This template shows the basic structure of a custom strategy

class CustomStrategy {
  constructor(params) {
    this.period = params.period || 20;
    this.positionSize = params.positionSize || 0.95;
    this.position = 0;
  }

  // Called once before backtesting starts
  initialize(data) {
    this.data = data;
    this.trades = [];
  }

  // Calculate simple moving average
  sma(period, endIndex) {
    if (endIndex < period - 1) return null;

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += this.data.bars[endIndex - i].close;
    }

    return sum / period;
  }

  // Called for each bar
  onBar(index) {
    const bar = this.data.bars[index];
    const ma = this.sma(this.period, index);

    if (ma === null) return; // Not enough data yet

    // Entry: price crosses above MA
    if (this.position === 0 && bar.close > ma) {
      this.position = this.positionSize;
      this.trades.push({
        type: 'entry',
        time: bar.time,
        price: bar.close,
        size: this.position,
      });
    }

    // Exit: price crosses below MA
    if (this.position > 0 && bar.close < ma) {
      this.trades.push({
        type: 'exit',
        time: bar.time,
        price: bar.close,
        size: this.position,
      });
      this.position = 0;
    }
  }

  // Called after backtesting completes
  finalize() {
    // Close any open position
    if (this.position > 0) {
      const lastBar = this.data.bars[this.data.bars.length - 1];
      this.trades.push({
        type: 'exit',
        time: lastBar.time,
        price: lastBar.close,
        size: this.position,
      });
    }

    return this.trades;
  }
}

// Export the strategy class
return CustomStrategy;`,
  fields: [
    {
      key: 'symbol',
      type: 'symbol',
      label: 'Symbol',
      help: 'Asset to trade',
      showByDefault: true,
    },
    {
      key: 'period',
      type: 'slider',
      label: 'MA Period',
      help: 'Moving average period',
      min: 5,
      max: 200,
      step: 5,
      default: 20,
      showByDefault: true,
    },
    {
      key: 'positionSize',
      type: 'percent',
      label: 'Position Size',
      help: 'Percentage of capital per trade',
      default: 0.95,
      showByDefault: false,
    },
  ],
  defaults: {
    symbol: 'SPY',
    period: 20,
    positionSize: 0.95,
  },
};

/**
 * RSI Template
 * Mean reversion strategy template
 */
export const RSI_TEMPLATE: CustomStrategyTemplate = {
  id: 'custom-rsi',
  name: 'RSI Template',
  description: 'Template for an RSI-based mean reversion strategy',
  code: `// Custom RSI Strategy
// Buy when oversold, sell when overbought

class CustomStrategy {
  constructor(params) {
    this.period = params.rsiPeriod || 14;
    this.oversold = params.oversold || 30;
    this.overbought = params.overbought || 70;
    this.positionSize = params.positionSize || 0.95;
    this.position = 0;
  }

  initialize(data) {
    this.data = data;
    this.trades = [];
  }

  // Calculate RSI
  rsi(period, endIndex) {
    if (endIndex < period) return null;

    let gains = 0;
    let losses = 0;

    // Calculate average gains and losses
    for (let i = endIndex - period + 1; i <= endIndex; i++) {
      const change = this.data.bars[i].close - this.data.bars[i - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  onBar(index) {
    if (index < this.period) return;

    const bar = this.data.bars[index];
    const rsiValue = this.rsi(this.period, index);

    if (rsiValue === null) return;

    // Entry: RSI oversold
    if (this.position === 0 && rsiValue < this.oversold) {
      this.position = this.positionSize;
      this.trades.push({
        type: 'entry',
        time: bar.time,
        price: bar.close,
        size: this.position,
      });
    }

    // Exit: RSI overbought
    if (this.position > 0 && rsiValue > this.overbought) {
      this.trades.push({
        type: 'exit',
        time: bar.time,
        price: bar.close,
        size: this.position,
      });
      this.position = 0;
    }
  }

  finalize() {
    if (this.position > 0) {
      const lastBar = this.data.bars[this.data.bars.length - 1];
      this.trades.push({
        type: 'exit',
        time: lastBar.time,
        price: lastBar.close,
        size: this.position,
      });
    }

    return this.trades;
  }
}

return CustomStrategy;`,
  fields: [
    {
      key: 'symbol',
      type: 'symbol',
      label: 'Symbol',
      help: 'Asset to trade',
      showByDefault: true,
    },
    {
      key: 'rsiPeriod',
      type: 'slider',
      label: 'RSI Period',
      help: 'RSI calculation period',
      min: 5,
      max: 30,
      step: 1,
      default: 14,
      showByDefault: true,
    },
    {
      key: 'oversold',
      type: 'slider',
      label: 'Oversold Level',
      help: 'Buy when RSI falls below this',
      min: 10,
      max: 40,
      step: 5,
      default: 30,
      showByDefault: true,
    },
    {
      key: 'overbought',
      type: 'slider',
      label: 'Overbought Level',
      help: 'Sell when RSI rises above this',
      min: 60,
      max: 90,
      step: 5,
      default: 70,
      showByDefault: true,
    },
    {
      key: 'positionSize',
      type: 'percent',
      label: 'Position Size',
      help: 'Percentage of capital per trade',
      default: 0.95,
      showByDefault: false,
    },
  ],
  defaults: {
    symbol: 'SPY',
    rsiPeriod: 14,
    oversold: 30,
    overbought: 70,
    positionSize: 0.95,
  },
};

/**
 * Empty Template
 * Blank template for advanced users
 */
export const EMPTY_TEMPLATE: CustomStrategyTemplate = {
  id: 'custom-empty',
  name: 'Blank Template',
  description: 'Empty template - start from scratch',
  code: `// Custom Strategy
// Write your strategy logic here

class CustomStrategy {
  constructor(params) {
    // Store parameters
    this.params = params;
    this.position = 0;
  }

  initialize(data) {
    // Called once before backtesting
    this.data = data;
    this.trades = [];
  }

  onBar(index) {
    // Called for each bar in the dataset
    const bar = this.data.bars[index];

    // Your strategy logic here
    // - Calculate indicators
    // - Check entry/exit conditions
    // - Record trades
  }

  finalize() {
    // Called after backtesting completes
    // Close any open positions
    // Return trades array
    return this.trades;
  }
}

return CustomStrategy;`,
  fields: [
    {
      key: 'symbol',
      type: 'symbol',
      label: 'Symbol',
      help: 'Asset to trade',
      showByDefault: true,
    },
    {
      key: 'positionSize',
      type: 'percent',
      label: 'Position Size',
      help: 'Percentage of capital per trade',
      default: 0.95,
      showByDefault: false,
    },
  ],
  defaults: {
    symbol: 'SPY',
    positionSize: 0.95,
  },
};

/**
 * All available templates
 */
export const TEMPLATES: Record<string, CustomStrategyTemplate> = {
  'simple-ma': SIMPLE_MA_TEMPLATE,
  'rsi': RSI_TEMPLATE,
  'empty': EMPTY_TEMPLATE,
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): CustomStrategyTemplate | null {
  return TEMPLATES[id] || null;
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(TEMPLATES);
}

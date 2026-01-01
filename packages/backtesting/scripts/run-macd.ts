#!/usr/bin/env bun
/**
 * Run MACD Divergence Strategy backtest with real Yahoo Finance data
 * 
 * Identifies divergence between price and MACD to spot potential reversals:
 * - Bullish divergence: Price makes lower lows, MACD makes higher lows → Buy signal
 * - Bearish divergence: Price makes higher highs, MACD makes lower highs → Sell signal
 * 
 * Usage: bun run scripts/run-macd.ts [symbol] [period] [useCrossover]
 * Example: bun run scripts/run-macd.ts TQQQ 5y true
 */

import { YahooProvider, type YahooPeriod } from '@one-love-wealth/data-layer';
import { createDirectAdapter } from '@one-love-wealth/data-layer';
import { MemoryAdapter } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  MACDDivergenceStrategy,
  BuyAndHoldStrategy,
  formatMetrics,
  type BacktestData,
  type MultiBar,
  type Bar,
} from '../src';

// Parse command line args
const symbol = process.argv[2] || 'SPY';
const period = (process.argv[3] || '5y') as YahooPeriod;
const useCrossover = process.argv[4] === 'true';

console.log(`\n📊 MACD Divergence Strategy - ${symbol}\n`);
console.log(`Fetching ${period} of daily data from Yahoo Finance...\n`);

// Create providers
const cache = new MemoryAdapter();
const request = createDirectAdapter();
const yahooProvider = new YahooProvider(cache, request);

// Fetch data
const result = await yahooProvider.fetch({
  symbol,
  period,
  interval: '1d',
  mockMode: false,
});

console.log(`✅ Fetched ${result.series.data.length} data points`);

if (result.series.data.length < 2) {
  console.error('❌ Not enough data points for backtest');
  process.exit(1);
}

// Convert to BacktestData format
const bars: MultiBar[] = result.series.data.map(point => {
  const bar: Bar = {
    time: point.time,
    open: point.open ?? point.value ?? 0,
    high: point.high ?? point.value ?? 0,
    low: point.low ?? point.value ?? 0,
    close: point.close ?? point.value ?? 0,
    volume: point.volume,
  };
  return {
    time: point.time,
    bars: { [symbol]: bar },
  };
});

const backtestData: BacktestData = {
  symbols: [symbol],
  bars,
  startDate: new Date(bars[0].time),
  endDate: new Date(bars[bars.length - 1].time),
};

const firstBar = bars[0].bars[symbol];
const lastBar = bars[bars.length - 1].bars[symbol];

console.log(`📅 Date range: ${backtestData.startDate.toLocaleDateString()} - ${backtestData.endDate.toLocaleDateString()}`);
console.log(`💰 Price range: $${firstBar?.close.toFixed(2)} → $${lastBar?.close.toFixed(2)}\n`);

// Configure backtest
const config = {
  initialCapital: 100000,
  commission: 0,
  slippage: 0.001, // 0.1% slippage
};

// Run MACD Divergence strategy
console.log('═'.repeat(60));
console.log('📈 MACD Divergence Strategy');
console.log('═'.repeat(60));

const macdParams = {
  symbol,
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
  divergenceLookback: 14,
  minPriceChange: 0.005, // 0.5%
  positionSize: 0.95,
  useCrossoverSignals: useCrossover,
  useHistogram: true,
};

console.log(`\nParameters:`);
console.log(`   - Fast Period: ${macdParams.fastPeriod}`);
console.log(`   - Slow Period: ${macdParams.slowPeriod}`);
console.log(`   - Signal Period: ${macdParams.signalPeriod}`);
console.log(`   - Divergence Lookback: ${macdParams.divergenceLookback} bars`);
console.log(`   - Min Price Change: ${macdParams.minPriceChange * 100}%`);
console.log(`   - Use Crossover Signals: ${macdParams.useCrossoverSignals ? 'Yes' : 'No'}`);
console.log(`   - Use Histogram: ${macdParams.useHistogram ? 'Yes' : 'No'}`);

const macdStrategy = new MACDDivergenceStrategy(macdParams);

const engine = new BacktestEngine(config);
const macdResult = engine.run(macdStrategy, backtestData);

// Format and display metrics
const printMetrics = (metrics: ReturnType<typeof formatMetrics>) => {
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(18)}: ${value}`);
  });
};

console.log('\n📈 Performance:');
printMetrics(formatMetrics(macdResult.metrics));

console.log(`\n📊 Trades: ${macdResult.trades.length}`);
if (macdResult.trades.length > 0) {
  console.log('\nRecent Trades:');
  macdResult.trades.slice(-10).forEach((trade, i) => {
    const date = new Date(trade.timestamp).toLocaleDateString();
    const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
    console.log(`  ${i + 1}. ${date} ${action} ${trade.quantity.toFixed(2)} @ $${trade.price.toFixed(2)}`);
    if (trade.reason) {
      console.log(`      └─ ${trade.reason}`);
    }
  });
  if (macdResult.trades.length > 10) {
    console.log(`  ... (${macdResult.trades.length - 10} earlier trades not shown)`);
  }
} else {
  console.log('\n⚠️ No trades generated - divergence signals may be rare for this symbol/period');
  console.log('   Try: bun run scripts/run-macd.ts SPY 5y true (enable crossover signals)');
}

// Run Buy & Hold for comparison
console.log('\n' + '═'.repeat(60));
console.log('📦 Buy & Hold Strategy (Benchmark)');
console.log('═'.repeat(60));

const buyAndHold = new BuyAndHoldStrategy({
  symbol,
  positionSize: 0.95,
});

const bhResult = engine.run(buyAndHold, backtestData);

console.log('\n📈 Performance:');
printMetrics(formatMetrics(bhResult.metrics));

// Compare strategies
console.log('\n' + '═'.repeat(60));
console.log('📊 Strategy Comparison');
console.log('═'.repeat(60));

const comparison = [
  ['Metric', 'MACD Divergence', 'Buy & Hold'],
  ['Total Return', `${macdResult.metrics.totalReturnPercent.toFixed(2)}%`, `${bhResult.metrics.totalReturnPercent.toFixed(2)}%`],
  ['CAGR', `${(macdResult.metrics.cagr * 100).toFixed(2)}%`, `${(bhResult.metrics.cagr * 100).toFixed(2)}%`],
  ['Max Drawdown', `${macdResult.metrics.maxDrawdownPercent.toFixed(2)}%`, `${bhResult.metrics.maxDrawdownPercent.toFixed(2)}%`],
  ['Sharpe Ratio', macdResult.metrics.sharpeRatio.toFixed(2), bhResult.metrics.sharpeRatio.toFixed(2)],
  ['Sortino Ratio', macdResult.metrics.sortinoRatio.toFixed(2), bhResult.metrics.sortinoRatio.toFixed(2)],
  ['Total Trades', macdResult.trades.length.toString(), bhResult.trades.length.toString()],
  ['Win Rate', `${(macdResult.metrics.winRate * 100).toFixed(1)}%`, `${(bhResult.metrics.winRate * 100).toFixed(1)}%`],
];

// Print table
const colWidths = comparison[0].map((_, i) => 
  Math.max(...comparison.map(row => row[i]?.length || 0)) + 2
);

comparison.forEach((row, i) => {
  const line = row.map((cell, j) => cell.padEnd(colWidths[j] || 0)).join('│ ');
  console.log(`\n${line}`);
  if (i === 0) {
    console.log('─'.repeat(line.length));
  }
});

// Final verdict
console.log('\n' + '═'.repeat(60));
const macdOutperforms = macdResult.metrics.totalReturn > bhResult.metrics.totalReturn;
const macdBetterRisk = Math.abs(macdResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent);

if (macdResult.trades.length === 0) {
  console.log('⚠️ No divergence signals found - strategy remained in cash');
  console.log('   Consider enabling crossover signals with: bun run scripts/run-macd.ts ' + symbol + ' ' + period + ' true');
} else if (macdOutperforms && macdBetterRisk) {
  console.log('✅ MACD Divergence OUTPERFORMS Buy & Hold with lower risk!');
} else if (macdOutperforms) {
  console.log('✅ MACD Divergence has higher returns but higher drawdown');
} else if (macdBetterRisk) {
  console.log('⚠️ MACD Divergence underperforms but has lower drawdown');
} else {
  console.log('❌ Buy & Hold outperforms MACD Divergence in this period');
}

console.log('═'.repeat(60) + '\n');

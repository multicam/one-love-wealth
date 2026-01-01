#!/usr/bin/env bun
/**
 * Run MA Crossover backtest with real Yahoo Finance data
 * 
 * Usage: bun run scripts/run-backtest.ts [symbol] [period]
 * Example: bun run scripts/run-backtest.ts TQQQ 5y
 */

import { YahooProvider, type YahooPeriod } from '@one-love-wealth/data-layer';
import { createDirectAdapter } from '@one-love-wealth/data-layer';
import { MemoryAdapter } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  MACrossoverStrategy,
  BuyAndHoldStrategy,
  formatMetrics,
  type BacktestData,
  type MultiBar,
  type Bar,
} from '../src';

// Parse command line args
const symbol = process.argv[2] || 'TQQQ';
const period = (process.argv[3] || '5y') as YahooPeriod;

console.log(`\n📈 MA Crossover Backtest - ${symbol}\n`);
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

// Run MA Crossover strategy
console.log('═'.repeat(60));
console.log('🔄 MA Crossover Strategy (50/200 SMA)');
console.log('═'.repeat(60));

const maCrossover = new MACrossoverStrategy({
  symbol,
  fastPeriod: 50,
  slowPeriod: 200,
  positionSize: 0.95,
});

const engine = new BacktestEngine(config);
const maResult = engine.run(maCrossover, backtestData);

console.log(`\n${formatMetrics(maResult.metrics)}`);
console.log(`\n📊 Trades: ${maResult.trades.length}`);
if (maResult.trades.length > 0) {
  console.log('\nTrade Log:');
  maResult.trades.slice(0, 10).forEach((trade, i) => {
    const date = new Date(trade.timestamp).toLocaleDateString();
    const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
    console.log(`  ${i + 1}. ${date} ${action} ${trade.quantity} @ $${trade.price.toFixed(2)} (${trade.reason || ''})`);
  });
  if (maResult.trades.length > 10) {
    console.log(`  ... and ${maResult.trades.length - 10} more trades`);
  }
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

console.log(`\n${formatMetrics(bhResult.metrics)}`);

// Compare strategies
console.log('\n' + '═'.repeat(60));
console.log('📊 Strategy Comparison');
console.log('═'.repeat(60));

const comparison = [
  ['Metric', 'MA Crossover', 'Buy & Hold'],
  ['Total Return', `${(maResult.metrics.totalReturnPercent).toFixed(2)}%`, `${(bhResult.metrics.totalReturnPercent).toFixed(2)}%`],
  ['CAGR', `${(maResult.metrics.cagr * 100).toFixed(2)}%`, `${(bhResult.metrics.cagr * 100).toFixed(2)}%`],
  ['Max Drawdown', `${(maResult.metrics.maxDrawdownPercent).toFixed(2)}%`, `${(bhResult.metrics.maxDrawdownPercent).toFixed(2)}%`],
  ['Sharpe Ratio', maResult.metrics.sharpeRatio.toFixed(2), bhResult.metrics.sharpeRatio.toFixed(2)],
  ['Sortino Ratio', maResult.metrics.sortinoRatio.toFixed(2), bhResult.metrics.sortinoRatio.toFixed(2)],
  ['Total Trades', maResult.trades.length.toString(), bhResult.trades.length.toString()],
  ['Win Rate', `${(maResult.metrics.winRate * 100).toFixed(1)}%`, `${(bhResult.metrics.winRate * 100).toFixed(1)}%`],
];

// Print table
const colWidths = comparison[0].map((_, i) => 
  Math.max(...comparison.map(row => row[i]?.length || 0)) + 2
);

comparison.forEach((row, i) => {
  const line = row.map((cell, j) => cell.padEnd(colWidths[j])).join('│ ');
  console.log(`\n${line}`);
  if (i === 0) {
    console.log('─'.repeat(line.length));
  }
});

// Final verdict
console.log('\n' + '═'.repeat(60));
const maOutperforms = maResult.metrics.totalReturn > bhResult.metrics.totalReturn;
const maBetterRisk = Math.abs(maResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent);

if (maOutperforms && maBetterRisk) {
  console.log('✅ MA Crossover OUTPERFORMS Buy & Hold with lower risk!');
} else if (maOutperforms) {
  console.log('✅ MA Crossover has higher returns but higher drawdown');
} else if (maBetterRisk) {
  console.log('⚠️ MA Crossover underperforms but has lower drawdown');
} else {
  console.log('❌ Buy & Hold outperforms MA Crossover in this period');
}

console.log('═'.repeat(60) + '\n');

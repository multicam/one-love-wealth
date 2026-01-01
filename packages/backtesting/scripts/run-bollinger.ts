#!/usr/bin/env bun
/**
 * Run Bollinger Bands Strategy backtest with real Yahoo Finance data
 * 
 * Two modes available:
 * - breakout: Buy when price breaks above upper band, sell when it breaks below
 * - reversion: Buy when price touches lower band (oversold), sell at upper band
 * 
 * Usage: bun run scripts/run-bollinger.ts [symbol] [period] [mode]
 * Example: bun run scripts/run-bollinger.ts TQQQ 5y reversion
 */

import { YahooProvider, type YahooPeriod } from '@one-love-wealth/data-layer';
import { createDirectAdapter } from '@one-love-wealth/data-layer';
import { MemoryAdapter } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  BollingerBreakoutStrategy,
  BuyAndHoldStrategy,
  formatMetrics,
  type BacktestData,
  type MultiBar,
  type Bar,
} from '../src';

// Parse command line args
const symbol = process.argv[2] || 'SPY';
const period = (process.argv[3] || '5y') as YahooPeriod;
const mode = (process.argv[4] || 'reversion') as 'breakout' | 'reversion';

console.log(`\n📊 Bollinger Bands ${mode.charAt(0).toUpperCase() + mode.slice(1)} Strategy - ${symbol}\n`);
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

// Run Bollinger Bands strategy
console.log('═'.repeat(60));
console.log(`📈 Bollinger Bands ${mode.charAt(0).toUpperCase() + mode.slice(1)} Strategy`);
console.log('═'.repeat(60));

const bollingerParams = {
  symbol,
  period: 20,
  stdDev: 2,
  positionSize: 0.95,
  mode,
  oversoldThreshold: 0.1,
  overboughtThreshold: 0.9,
  useStopLoss: true,
};

console.log(`\nParameters:`);
console.log(`   - BB Period: ${bollingerParams.period}`);
console.log(`   - Std Dev: ${bollingerParams.stdDev}σ`);
console.log(`   - Mode: ${bollingerParams.mode}`);
if (mode === 'reversion') {
  console.log(`   - Oversold %B: <${bollingerParams.oversoldThreshold * 100}%`);
  console.log(`   - Overbought %B: >${bollingerParams.overboughtThreshold * 100}%`);
}
console.log(`   - Stop Loss: ${bollingerParams.useStopLoss ? 'Yes (middle band)' : 'No'}`);

const bollinger = new BollingerBreakoutStrategy(bollingerParams);

const engine = new BacktestEngine(config);
const bbResult = engine.run(bollinger, backtestData);

// Format and display metrics
const printMetrics = (metrics: ReturnType<typeof formatMetrics>) => {
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(18)}: ${value}`);
  });
};

console.log('\n📈 Performance:');
printMetrics(formatMetrics(bbResult.metrics));

console.log(`\n📊 Trades: ${bbResult.trades.length}`);
if (bbResult.trades.length > 0) {
  console.log('\nRecent Trades:');
  bbResult.trades.slice(-10).forEach((trade, i) => {
    const date = new Date(trade.timestamp).toLocaleDateString();
    const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
    console.log(`  ${i + 1}. ${date} ${action} ${trade.quantity.toFixed(2)} @ $${trade.price.toFixed(2)}`);
    if (trade.reason) {
      console.log(`      └─ ${trade.reason}`);
    }
  });
  if (bbResult.trades.length > 10) {
    console.log(`  ... (${bbResult.trades.length - 10} earlier trades not shown)`);
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

console.log('\n📈 Performance:');
printMetrics(formatMetrics(bhResult.metrics));

// Compare strategies
console.log('\n' + '═'.repeat(60));
console.log('📊 Strategy Comparison');
console.log('═'.repeat(60));

const comparison = [
  ['Metric', 'Bollinger', 'Buy & Hold'],
  ['Total Return', `${bbResult.metrics.totalReturnPercent.toFixed(2)}%`, `${bhResult.metrics.totalReturnPercent.toFixed(2)}%`],
  ['CAGR', `${(bbResult.metrics.cagr * 100).toFixed(2)}%`, `${(bhResult.metrics.cagr * 100).toFixed(2)}%`],
  ['Max Drawdown', `${bbResult.metrics.maxDrawdownPercent.toFixed(2)}%`, `${bhResult.metrics.maxDrawdownPercent.toFixed(2)}%`],
  ['Sharpe Ratio', bbResult.metrics.sharpeRatio.toFixed(2), bhResult.metrics.sharpeRatio.toFixed(2)],
  ['Sortino Ratio', bbResult.metrics.sortinoRatio.toFixed(2), bhResult.metrics.sortinoRatio.toFixed(2)],
  ['Total Trades', bbResult.trades.length.toString(), bhResult.trades.length.toString()],
  ['Win Rate', `${(bbResult.metrics.winRate * 100).toFixed(1)}%`, `${(bhResult.metrics.winRate * 100).toFixed(1)}%`],
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
const bbOutperforms = bbResult.metrics.totalReturn > bhResult.metrics.totalReturn;
const bbBetterRisk = Math.abs(bbResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent);

if (bbOutperforms && bbBetterRisk) {
  console.log('✅ Bollinger strategy OUTPERFORMS Buy & Hold with lower risk!');
} else if (bbOutperforms) {
  console.log('✅ Bollinger strategy has higher returns but higher drawdown');
} else if (bbBetterRisk) {
  console.log('⚠️ Bollinger strategy underperforms but has lower drawdown');
} else {
  console.log('❌ Buy & Hold outperforms Bollinger strategy in this period');
}

console.log('═'.repeat(60) + '\n');

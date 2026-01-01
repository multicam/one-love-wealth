#!/usr/bin/env bun
/**
 * Run VIX Hedge backtest with real Yahoo Finance data
 * 
 * Usage: bun run scripts/run-vix-hedge.ts [symbol] [period]
 * Example: bun run scripts/run-vix-hedge.ts TQQQ 10y
 */

import { YahooProvider, type YahooPeriod } from '@one-love-wealth/data-layer';
import { createDirectAdapter } from '@one-love-wealth/data-layer';
import { MemoryAdapter } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  VIXHedgeStrategy,
  BuyAndHoldStrategy,
  MACrossoverStrategy,
  formatMetrics,
  type BacktestData,
  type MultiBar,
  type Bar,
} from '../src';

// Parse command line args
const tradingSymbol = process.argv[2] || 'TQQQ';
const period = (process.argv[3] || '10y') as YahooPeriod;
const vixSymbol = '^VIX';

console.log(`\n📈 VIX Hedge Strategy Backtest\n`);
console.log(`Trading: ${tradingSymbol} | Volatility: ${vixSymbol}`);
console.log(`Period: ${period}\n`);

// Create providers
const cache = new MemoryAdapter();
const request = createDirectAdapter();
const yahooProvider = new YahooProvider(cache, request);

// Fetch data for both symbols
console.log(`Fetching ${tradingSymbol} data...`);
const tradingResult = await yahooProvider.fetch({
  symbol: tradingSymbol,
  period,
  interval: '1d',
  mockMode: false,
});
console.log(`  ✅ ${tradingResult.series.data.length} data points`);

console.log(`Fetching ${vixSymbol} data...`);
const vixResult = await yahooProvider.fetch({
  symbol: vixSymbol,
  period,
  interval: '1d',
  mockMode: false,
});
console.log(`  ✅ ${vixResult.series.data.length} data points\n`);

// Create time-indexed maps for alignment
const tradingMap = new Map<string, Bar>();
const vixMap = new Map<string, Bar>();

for (const point of tradingResult.series.data) {
  const dateKey = new Date(point.time).toISOString().split('T')[0];
  tradingMap.set(dateKey, {
    time: point.time,
    open: point.open ?? point.value ?? 0,
    high: point.high ?? point.value ?? 0,
    low: point.low ?? point.value ?? 0,
    close: point.close ?? point.value ?? 0,
    volume: point.volume,
  });
}

for (const point of vixResult.series.data) {
  const dateKey = new Date(point.time).toISOString().split('T')[0];
  vixMap.set(dateKey, {
    time: point.time,
    open: point.open ?? point.value ?? 0,
    high: point.high ?? point.value ?? 0,
    low: point.low ?? point.value ?? 0,
    close: point.close ?? point.value ?? 0,
    volume: point.volume,
  });
}

// Find overlapping dates and create aligned bars
const bars: MultiBar[] = [];
const allDates = [...tradingMap.keys()].filter(date => vixMap.has(date)).sort();

for (const date of allDates) {
  const tradingBar = tradingMap.get(date)!;
  const vixBar = vixMap.get(date)!;
  
  bars.push({
    time: tradingBar.time,
    bars: {
      [tradingSymbol]: tradingBar,
      [vixSymbol]: vixBar,
    },
  });
}

if (bars.length < 200) {
  console.error(`❌ Not enough overlapping data points (${bars.length}). Need at least 200.`);
  process.exit(1);
}

const backtestData: BacktestData = {
  symbols: [tradingSymbol, vixSymbol],
  bars,
  startDate: new Date(bars[0].time),
  endDate: new Date(bars[bars.length - 1].time),
};

const firstTradingBar = bars[0].bars[tradingSymbol];
const lastTradingBar = bars[bars.length - 1].bars[tradingSymbol];
const firstVixBar = bars[0].bars[vixSymbol];
const lastVixBar = bars[bars.length - 1].bars[vixSymbol];

console.log(`📅 Aligned data: ${bars.length} trading days`);
console.log(`📅 Date range: ${backtestData.startDate.toLocaleDateString()} - ${backtestData.endDate.toLocaleDateString()}`);
console.log(`💰 ${tradingSymbol}: $${firstTradingBar?.close.toFixed(2)} → $${lastTradingBar?.close.toFixed(2)}`);
console.log(`📊 ${vixSymbol}: ${firstVixBar?.close.toFixed(2)} → ${lastVixBar?.close.toFixed(2)}\n`);

// Configure backtest
const config = {
  initialCapital: 100000,
  commission: 0,
  slippage: 0.001, // 0.1% slippage
};

const engine = new BacktestEngine(config);

// Run VIX Hedge strategy
console.log('═'.repeat(70));
console.log('🛡️  VIX Hedge Strategy (Exit VIX>25, Enter VIX<20)');
console.log('═'.repeat(70));

const vixHedge = new VIXHedgeStrategy({
  tradingSymbol,
  vixSymbol,
  vixExitThreshold: 25,
  vixEntryThreshold: 20,
  positionSize: 0.95,
});

const vixResult2 = engine.run(vixHedge, backtestData);

console.log(`\n${formatMetrics(vixResult2.metrics)}`);
console.log(`\n📊 Trades: ${vixResult2.trades.length}`);
if (vixResult2.trades.length > 0) {
  console.log('\nRecent Trade Log (last 15):');
  const recentTrades = vixResult2.trades.slice(-15);
  recentTrades.forEach((trade, i) => {
    const date = new Date(trade.timestamp).toLocaleDateString();
    const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
    const reason = trade.reason?.substring(0, 50) || '';
    console.log(`  ${date} ${action} ${trade.quantity.toLocaleString()} @ $${trade.price.toFixed(2)} - ${reason}`);
  });
}

// Run MA Crossover for comparison
console.log('\n' + '═'.repeat(70));
console.log('🔄 MA Crossover Strategy (50/200 SMA)');
console.log('═'.repeat(70));

// Need single-symbol data for MA Crossover
const maBars: MultiBar[] = bars.map(bar => ({
  time: bar.time,
  bars: { [tradingSymbol]: bar.bars[tradingSymbol] },
}));

const maData: BacktestData = {
  symbols: [tradingSymbol],
  bars: maBars,
  startDate: backtestData.startDate,
  endDate: backtestData.endDate,
};

const maCrossover = new MACrossoverStrategy({
  symbol: tradingSymbol,
  fastPeriod: 50,
  slowPeriod: 200,
  positionSize: 0.95,
});

const maResult = engine.run(maCrossover, maData);
console.log(`\n${formatMetrics(maResult.metrics)}`);

// Run Buy & Hold for comparison
console.log('\n' + '═'.repeat(70));
console.log('📦 Buy & Hold Strategy (Benchmark)');
console.log('═'.repeat(70));

const buyAndHold = new BuyAndHoldStrategy({
  symbol: tradingSymbol,
  positionSize: 0.95,
});

const bhResult = engine.run(buyAndHold, maData);
console.log(`\n${formatMetrics(bhResult.metrics)}`);

// Compare all strategies
console.log('\n' + '═'.repeat(70));
console.log('📊 Strategy Comparison');
console.log('═'.repeat(70));

const strategies = [
  { name: 'VIX Hedge', result: vixResult2 },
  { name: 'MA Crossover', result: maResult },
  { name: 'Buy & Hold', result: bhResult },
];

// Header
console.log('\n' + 
  'Metric'.padEnd(18) + '│ ' +
  'VIX Hedge'.padEnd(14) + '│ ' +
  'MA Crossover'.padEnd(14) + '│ ' +
  'Buy & Hold'.padEnd(14)
);
console.log('─'.repeat(70));

// Rows
const metrics = [
  { name: 'Total Return', fn: (r: typeof vixResult2) => `${r.metrics.totalReturnPercent.toFixed(1)}%` },
  { name: 'CAGR', fn: (r: typeof vixResult2) => `${(r.metrics.cagr * 100).toFixed(1)}%` },
  { name: 'Max Drawdown', fn: (r: typeof vixResult2) => `${r.metrics.maxDrawdownPercent.toFixed(1)}%` },
  { name: 'Sharpe Ratio', fn: (r: typeof vixResult2) => r.metrics.sharpeRatio.toFixed(2) },
  { name: 'Sortino Ratio', fn: (r: typeof vixResult2) => r.metrics.sortinoRatio.toFixed(2) },
  { name: 'Calmar Ratio', fn: (r: typeof vixResult2) => r.metrics.calmarRatio.toFixed(2) },
  { name: 'Volatility', fn: (r: typeof vixResult2) => `${(r.metrics.volatility * 100).toFixed(1)}%` },
  { name: 'Total Trades', fn: (r: typeof vixResult2) => r.trades.length.toString() },
  { name: 'Win Rate', fn: (r: typeof vixResult2) => `${(r.metrics.winRate * 100).toFixed(0)}%` },
  { name: 'Profit Factor', fn: (r: typeof vixResult2) => r.metrics.profitFactor.toFixed(2) },
];

for (const metric of metrics) {
  const row = 
    metric.name.padEnd(18) + '│ ' +
    metric.fn(vixResult2).padEnd(14) + '│ ' +
    metric.fn(maResult).padEnd(14) + '│ ' +
    metric.fn(bhResult).padEnd(14);
  console.log(row);
}

// Determine winner
console.log('\n' + '═'.repeat(70));
console.log('🏆 Analysis');
console.log('═'.repeat(70));

const bestReturn = strategies.reduce((best, s) => 
  s.result.metrics.totalReturn > best.result.metrics.totalReturn ? s : best
);
const bestSharpe = strategies.reduce((best, s) => 
  s.result.metrics.sharpeRatio > best.result.metrics.sharpeRatio ? s : best
);
const lowestDrawdown = strategies.reduce((best, s) => 
  Math.abs(s.result.metrics.maxDrawdownPercent) < Math.abs(best.result.metrics.maxDrawdownPercent) ? s : best
);

console.log(`\n📈 Highest Return: ${bestReturn.name} (${bestReturn.result.metrics.totalReturnPercent.toFixed(1)}%)`);
console.log(`⚖️  Best Risk-Adjusted: ${bestSharpe.name} (Sharpe: ${bestSharpe.result.metrics.sharpeRatio.toFixed(2)})`);
console.log(`🛡️  Lowest Drawdown: ${lowestDrawdown.name} (${lowestDrawdown.result.metrics.maxDrawdownPercent.toFixed(1)}%)`);

// VIX-specific analysis
const vixExitDays = vixResult2.trades.filter(t => t.side === 'sell').length;
const avgHoldingPeriod = bars.length / Math.max(vixResult2.trades.length, 1);

console.log(`\n📊 VIX Strategy Insights:`);
console.log(`   • Exited position ${vixExitDays} times due to VIX spikes`);
console.log(`   • Average time between trades: ${avgHoldingPeriod.toFixed(0)} days`);
console.log(`   • Time in market: ${((vixResult2.metrics.exposurePercent || 0) * 100).toFixed(0)}%`);

console.log('\n' + '═'.repeat(70) + '\n');

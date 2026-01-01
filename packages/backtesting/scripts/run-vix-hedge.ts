#!/usr/bin/env bun
/**
 * Run VIX Hedge backtest with real Yahoo Finance data
 * 
 * Uses the BacktestDataLoader to fetch multi-symbol data (TQQQ + VIX)
 * and runs the VIX Hedge strategy against a Buy & Hold benchmark.
 * 
 * Usage: bun run scripts/run-vix-hedge.ts [tradingSymbol] [period]
 * Example: bun run scripts/run-vix-hedge.ts TQQQ 5y
 */

import type { YahooPeriod } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  BacktestDataLoader,
  VIXHedgeStrategy,
  BuyAndHoldStrategy,
  formatMetrics,
} from '../src';

// Parse command line args
const tradingSymbol = process.argv[2] || 'TQQQ';
const period = (process.argv[3] || '5y') as YahooPeriod;
const vixSymbol = '^VIX';

console.log(`\n🛡️  VIX Hedge Backtest - ${tradingSymbol}\n`);
console.log(`Fetching ${period} of daily data for ${tradingSymbol} and ${vixSymbol}...\n`);

// Use the BacktestDataLoader for multi-symbol data
const loader = new BacktestDataLoader();

try {
  const result = await loader.load({
    symbols: [tradingSymbol, vixSymbol],
    period,
    interval: '1d',
    gapFillStrategy: 'forward-fill',
    mockMode: false,
  });

  const { data, stats } = result;

  console.log(`✅ Loaded ${stats.totalBars} aligned bars`);
  console.log(`📅 Date range: ${stats.dateRange.start.toLocaleDateString()} - ${stats.dateRange.end.toLocaleDateString()}`);
  
  if (stats.droppedBars > 0) {
    console.log(`⚠️  Dropped ${stats.droppedBars} bars due to missing data`);
  }
  
  const filledGapsTotal = Object.values(stats.filledGaps).reduce((a, b) => a + b, 0);
  if (filledGapsTotal > 0) {
    console.log(`🔧 Filled ${filledGapsTotal} gaps (${Object.entries(stats.filledGaps).map(([s, n]) => `${s}: ${n}`).join(', ')})`);
  }

  // Get price info
  const firstBar = data.bars[0];
  const lastBar = data.bars[data.bars.length - 1];
  const firstPrice = firstBar?.bars[tradingSymbol]?.close;
  const lastPrice = lastBar?.bars[tradingSymbol]?.close;
  const firstVIX = firstBar?.bars[vixSymbol]?.close;
  const lastVIX = lastBar?.bars[vixSymbol]?.close;

  if (firstPrice && lastPrice) {
    console.log(`💰 ${tradingSymbol}: $${firstPrice.toFixed(2)} → $${lastPrice.toFixed(2)} (${((lastPrice/firstPrice - 1) * 100).toFixed(1)}%)`);
  }
  if (firstVIX && lastVIX) {
    console.log(`📊 VIX: ${firstVIX.toFixed(1)} → ${lastVIX.toFixed(1)}\n`);
  }

  // Configure backtest
  const config = {
    initialCapital: 100000,
    commission: 0,
    slippage: 0.001, // 0.1% slippage
  };

  const engine = new BacktestEngine(config);

  // Strategy 1: VIX Hedge (exit when VIX > 25, re-enter when VIX < 20)
  console.log('═'.repeat(70));
  console.log('🛡️  VIX Hedge Strategy (exit > 25, entry < 20)');
  console.log('═'.repeat(70));

  const vixHedge = new VIXHedgeStrategy({
    tradingSymbol,
    vixSymbol,
    vixExitThreshold: 25,
    vixEntryThreshold: 20,
    positionSize: 0.95,
    partialExit: false,
  });

  const vixResult = engine.run(vixHedge, data);

  // Format metrics for display
  const printMetrics = (metrics: ReturnType<typeof formatMetrics>) => {
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(18)}: ${value}`);
    });
  };

  console.log('\n📈 Performance:');
  printMetrics(formatMetrics(vixResult.metrics));
  console.log(`\n📊 Trades: ${vixResult.trades.length}`);
  
  if (vixResult.trades.length > 0) {
    console.log('\nTrade Log (last 15):');
    const recentTrades = vixResult.trades.slice(-15);
    recentTrades.forEach((trade, i) => {
      const date = new Date(trade.timestamp).toLocaleDateString();
      const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
      console.log(`  ${i + 1}. ${date} ${action} ${trade.quantity.toLocaleString()} @ $${trade.price.toFixed(2)}`);
      if (trade.reason) {
        console.log(`      └─ ${trade.reason}`);
      }
    });
    if (vixResult.trades.length > 15) {
      console.log(`  ... (${vixResult.trades.length - 15} earlier trades not shown)`);
    }
  }

  // Strategy 2: VIX Hedge with MA Signal
  console.log('\n' + '═'.repeat(70));
  console.log('🛡️  VIX Hedge MA Strategy (exit when VIX > 10-day MA)');
  console.log('═'.repeat(70));

  const vixHedgeMA = new VIXHedgeStrategy({
    tradingSymbol,
    vixSymbol,
    useMASignal: true,
    vixMAPeriod: 10,
    positionSize: 0.95,
    partialExit: false,
  });

  const vixMAResult = engine.run(vixHedgeMA, data);

  console.log('\n📈 Performance:');
  printMetrics(formatMetrics(vixMAResult.metrics));
  console.log(`\n📊 Trades: ${vixMAResult.trades.length}`);

  // Strategy 3: Buy & Hold benchmark
  console.log('\n' + '═'.repeat(70));
  console.log(`📦 Buy & Hold ${tradingSymbol} (Benchmark)`);
  console.log('═'.repeat(70));

  const buyAndHold = new BuyAndHoldStrategy({
    symbol: tradingSymbol,
    positionSize: 0.95,
  });

  const bhResult = engine.run(buyAndHold, data);

  console.log('\n📈 Performance:');
  printMetrics(formatMetrics(bhResult.metrics));

  // Compare all strategies
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Strategy Comparison');
  console.log('═'.repeat(70));

  const strategies = [
    { name: 'VIX Hedge (25/20)', result: vixResult },
    { name: 'VIX Hedge MA', result: vixMAResult },
    { name: 'Buy & Hold', result: bhResult },
  ];

  const comparison = [
    ['Metric', ...strategies.map(s => s.name)],
    ['Total Return', ...strategies.map(s => `${s.result.metrics.totalReturnPercent.toFixed(1)}%`)],
    ['CAGR', ...strategies.map(s => `${(s.result.metrics.cagr * 100).toFixed(1)}%`)],
    ['Max Drawdown', ...strategies.map(s => `${s.result.metrics.maxDrawdownPercent.toFixed(1)}%`)],
    ['Sharpe Ratio', ...strategies.map(s => s.result.metrics.sharpeRatio.toFixed(2))],
    ['Sortino Ratio', ...strategies.map(s => s.result.metrics.sortinoRatio.toFixed(2))],
    ['Trades', ...strategies.map(s => s.result.trades.length.toString())],
    ['Win Rate', ...strategies.map(s => `${(s.result.metrics.winRate * 100).toFixed(0)}%`)],
  ];

  // Print table
  const colWidths = comparison[0].map((_, i) => 
    Math.max(...comparison.map(row => (row[i] || '').length)) + 2
  );

  comparison.forEach((row, i) => {
    const line = row.map((cell, j) => (cell || '').padEnd(colWidths[j] || 0)).join('│ ');
    console.log(`\n${line}`);
    if (i === 0) {
      console.log('─'.repeat(line.length));
    }
  });

  // Risk-adjusted return comparison
  console.log('\n' + '═'.repeat(70));
  console.log('🏆 Results Analysis');
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
  console.log(`📊 Best Risk-Adjusted: ${bestSharpe.name} (Sharpe: ${bestSharpe.result.metrics.sharpeRatio.toFixed(2)})`);
  console.log(`🛡️  Lowest Drawdown: ${lowestDrawdown.name} (${lowestDrawdown.result.metrics.maxDrawdownPercent.toFixed(1)}%)`);

  // Overall verdict
  const vixBetterRisk = Math.abs(vixResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent);
  const vixBetterReturn = vixResult.metrics.totalReturn > bhResult.metrics.totalReturn;

  console.log('\n' + '─'.repeat(70));
  if (vixBetterReturn && vixBetterRisk) {
    console.log('✅ VIX Hedge OUTPERFORMS Buy & Hold with better returns AND lower risk!');
  } else if (vixBetterRisk) {
    console.log(`⚠️  VIX Hedge reduces drawdown by ${(Math.abs(bhResult.metrics.maxDrawdownPercent) - Math.abs(vixResult.metrics.maxDrawdownPercent)).toFixed(1)}% but sacrifices some returns`);
  } else if (vixBetterReturn) {
    console.log('✅ VIX Hedge has higher returns but also higher drawdown');
  } else {
    console.log('❌ Buy & Hold outperforms VIX Hedge in this period');
  }
  console.log('═'.repeat(70) + '\n');

} catch (error) {
  console.error('❌ Error running backtest:', error);
  process.exit(1);
}

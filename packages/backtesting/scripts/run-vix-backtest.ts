#!/usr/bin/env bun
/**
 * Run VIX Hedge backtest with multi-symbol data
 * 
 * Demonstrates BacktestDataLoader with multi-symbol data alignment
 * 
 * Usage: bun run scripts/run-vix-backtest.ts [tradingSymbol] [period]
 * Example: bun run scripts/run-vix-backtest.ts TQQQ 5y
 */

import {
  BacktestEngine,
  VIXHedgeStrategy,
  BuyAndHoldStrategy,
  loadBacktestDataWithMetadata,
  formatMetrics,
} from '../src';

// Parse command line args
const tradingSymbol = process.argv[2] || 'TQQQ';
const period = (process.argv[3] || '5y') as '1y' | '2y' | '5y' | '10y';
const vixSymbol = '^VIX';

console.log(`\n📈 VIX Hedge Backtest - ${tradingSymbol} vs ${vixSymbol}\n`);
console.log(`Fetching ${period} of daily data for both symbols...\n`);

try {
  // Load multi-symbol data using BacktestDataLoader
  const result = await loadBacktestDataWithMetadata({
    symbols: [tradingSymbol, vixSymbol],
    period,
    interval: '1d',
    alignmentStrategy: 'intersection', // Only use dates where both have data
    fillStrategy: 'forward',
    allowMock: false,
  });

  const { data, metadata } = result;

  console.log(`✅ Loaded data for: ${metadata.symbolsLoaded.join(', ')}`);
  if (metadata.symbolsFailed.length > 0) {
    console.log(`⚠️ Failed to load: ${metadata.symbolsFailed.join(', ')}`);
  }
  console.log(`📊 Total bars: ${metadata.totalBars}`);
  console.log(`📅 Date range: ${metadata.dateRange.start.toLocaleDateString()} - ${metadata.dateRange.end.toLocaleDateString()}`);
  if (metadata.missingDataFilled > 0) {
    console.log(`🔧 Missing data filled: ${metadata.missingDataFilled} bars`);
  }

  // Show sample of first few bars
  const firstBar = data.bars[0];
  const lastBar = data.bars[data.bars.length - 1];
  
  console.log(`\n💰 ${tradingSymbol}: $${firstBar.bars[tradingSymbol]?.close.toFixed(2)} → $${lastBar.bars[tradingSymbol]?.close.toFixed(2)}`);
  console.log(`📉 ${vixSymbol}: ${firstBar.bars[vixSymbol]?.close.toFixed(2)} → ${lastBar.bars[vixSymbol]?.close.toFixed(2)}`);

  // Configure backtest
  const config = {
    initialCapital: 100000,
    commission: 0,
    slippage: 0.001,
  };

  const engine = new BacktestEngine(config);

  // Run VIX Hedge strategy
  console.log('\n' + '═'.repeat(60));
  console.log(`🛡️ VIX Hedge Strategy (exit>25, entry<20)`);
  console.log('═'.repeat(60));

  const vixHedge = new VIXHedgeStrategy({
    tradingSymbol,
    vixSymbol,
    vixExitThreshold: 25,
    vixEntryThreshold: 20,
    positionSize: 0.95,
  });

  const vixResult = engine.run(vixHedge, data);

  console.log(`\n${formatMetrics(vixResult.metrics)}`);
  console.log(`\n📊 Trades: ${vixResult.trades.length}`);
  
  if (vixResult.trades.length > 0) {
    console.log('\nTrade Log:');
    vixResult.trades.slice(0, 10).forEach((trade, i) => {
      const date = new Date(trade.timestamp).toLocaleDateString();
      const action = trade.side === 'buy' ? '🟢 BUY ' : '🔴 SELL';
      console.log(`  ${i + 1}. ${date} ${action} ${trade.quantity} @ $${trade.price.toFixed(2)}`);
    });
    if (vixResult.trades.length > 10) {
      console.log(`  ... and ${vixResult.trades.length - 10} more trades`);
    }
  }

  // Run Buy & Hold for comparison
  console.log('\n' + '═'.repeat(60));
  console.log(`📦 Buy & Hold ${tradingSymbol} (Benchmark)`);
  console.log('═'.repeat(60));

  const buyAndHold = new BuyAndHoldStrategy({
    symbol: tradingSymbol,
    positionSize: 0.95,
  });

  const bhResult = engine.run(buyAndHold, data);

  console.log(`\n${formatMetrics(bhResult.metrics)}`);

  // Compare strategies
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Strategy Comparison');
  console.log('═'.repeat(60));

  const comparison = [
    ['Metric', 'VIX Hedge', 'Buy & Hold'],
    ['Total Return', `${vixResult.metrics.totalReturnPercent.toFixed(2)}%`, `${bhResult.metrics.totalReturnPercent.toFixed(2)}%`],
    ['CAGR', `${(vixResult.metrics.cagr * 100).toFixed(2)}%`, `${(bhResult.metrics.cagr * 100).toFixed(2)}%`],
    ['Max Drawdown', `${vixResult.metrics.maxDrawdownPercent.toFixed(2)}%`, `${bhResult.metrics.maxDrawdownPercent.toFixed(2)}%`],
    ['Sharpe Ratio', vixResult.metrics.sharpeRatio.toFixed(2), bhResult.metrics.sharpeRatio.toFixed(2)],
    ['Sortino Ratio', vixResult.metrics.sortinoRatio.toFixed(2), bhResult.metrics.sortinoRatio.toFixed(2)],
    ['Total Trades', vixResult.trades.length.toString(), bhResult.trades.length.toString()],
  ];

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
  const vixOutperforms = vixResult.metrics.totalReturn > bhResult.metrics.totalReturn;
  const vixBetterRisk = Math.abs(vixResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent);

  if (vixOutperforms && vixBetterRisk) {
    console.log('✅ VIX Hedge OUTPERFORMS Buy & Hold with lower risk!');
  } else if (vixOutperforms) {
    console.log('✅ VIX Hedge has higher returns but higher drawdown');
  } else if (vixBetterRisk) {
    console.log('⚠️ VIX Hedge underperforms but has significantly lower drawdown');
  } else {
    console.log('❌ Buy & Hold outperforms VIX Hedge in this period');
  }

  console.log('═'.repeat(60) + '\n');

} catch (error) {
  console.error('❌ Backtest failed:', error);
  process.exit(1);
}

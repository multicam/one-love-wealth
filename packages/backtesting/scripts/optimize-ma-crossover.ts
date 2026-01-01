#!/usr/bin/env bun
/**
 * MA Crossover Parameter Optimization
 * 
 * Finds the optimal fast/slow period combination for the MA Crossover strategy.
 * 
 * Usage: bun run scripts/optimize-ma-crossover.ts [symbol] [period]
 * Example: bun run scripts/optimize-ma-crossover.ts TQQQ 5y
 */

import type { YahooPeriod } from '@one-love-wealth/data-layer';
import {
  BacktestDataLoader,
  ParameterOptimizer,
  MACrossoverStrategy,
  BuyAndHoldStrategy,
  BacktestEngine,
  generateOptimizationReport,
  type MACrossoverParams,
  type ParameterRange,
  type OptimizationConfig,
} from '../src';

// Parse command line args
const symbol = process.argv[2] || 'TQQQ';
const period = (process.argv[3] || '5y') as YahooPeriod;

console.log(`\n🔬 MA Crossover Parameter Optimization\n`);
console.log(`Symbol: ${symbol}`);
console.log(`Period: ${period}`);
console.log(`Optimizing for: Sharpe Ratio\n`);

// Load data
console.log('📊 Loading historical data...');
const loader = new BacktestDataLoader();

try {
  const result = await loader.load({
    symbols: [symbol],
    period,
    interval: '1d',
    gapFillStrategy: 'forward-fill',
    mockMode: false,
  });

  const { data, stats } = result;
  console.log(`✅ Loaded ${stats.totalBars} bars`);
  console.log(`📅 Date range: ${stats.dateRange.start.toLocaleDateString()} - ${stats.dateRange.end.toLocaleDateString()}\n`);

  // Define parameter ranges
  const parameters: ParameterRange[] = [
    { name: 'fastPeriod', min: 10, max: 100, step: 10 },
    { name: 'slowPeriod', min: 50, max: 250, step: 25 },
  ];

  // Calculate total combinations
  const fastSteps = Math.floor((100 - 10) / 10) + 1; // 10
  const slowSteps = Math.floor((250 - 50) / 25) + 1; // 9
  console.log(`🔢 Testing ${fastSteps * slowSteps} parameter combinations (${fastSteps} fast × ${slowSteps} slow)\n`);

  // Create strategy factory
  const strategyFactory = (params: Record<string, number | string | boolean>) => {
    const fastPeriod = params.fastPeriod as number;
    const slowPeriod = params.slowPeriod as number;
    
    // Skip invalid combinations (fast >= slow)
    if (fastPeriod >= slowPeriod) {
      throw new Error('Invalid: fast >= slow');
    }
    
    return new MACrossoverStrategy({
      symbol,
      fastPeriod,
      slowPeriod,
      positionSize: 0.95,
    });
  };

  // Run optimization
  console.log('⚙️  Running grid search optimization...\n');
  const startTime = Date.now();

  const optimizer = new ParameterOptimizer(100000);
  const optimizationResult = optimizer.optimize(strategyFactory, data, {
    method: 'grid',
    objective: 'sharpeRatio',
    parameters,
    topN: 15,
  });

  const duration = (Date.now() - startTime) / 1000;

  // Display results
  console.log('═'.repeat(80));
  console.log('🏆 OPTIMIZATION RESULTS');
  console.log('═'.repeat(80));
  console.log(`\nCompleted in ${duration.toFixed(2)}s`);
  console.log(`Tested ${optimizationResult.testedCombinations} valid combinations\n`);

  // Best parameters
  const best = optimizationResult.bestResult;
  console.log('📈 Best Parameters:');
  console.log(`   Fast Period: ${best.params.fastPeriod}`);
  console.log(`   Slow Period: ${best.params.slowPeriod}`);
  console.log(`   Sharpe Ratio: ${best.objectiveValue.toFixed(3)}`);
  console.log(`   Total Return: ${best.result.metrics.totalReturnPercent.toFixed(1)}%`);
  console.log(`   Max Drawdown: ${best.result.metrics.maxDrawdownPercent.toFixed(1)}%`);
  console.log(`   Win Rate: ${(best.result.metrics.winRate * 100).toFixed(0)}%`);
  console.log(`   Trades: ${best.result.metrics.totalTrades}\n`);

  // Top 10 results table
  console.log('─'.repeat(80));
  console.log('📊 Top 15 Parameter Combinations:');
  console.log('─'.repeat(80));
  console.log('\n| Rank | Fast | Slow | Sharpe | Return | Max DD | Trades |');
  console.log('|------|------|------|--------|--------|--------|--------|');

  for (const result of optimizationResult.topResults) {
    const fast = String(result.params.fastPeriod).padStart(4);
    const slow = String(result.params.slowPeriod).padStart(4);
    const sharpe = result.objectiveValue.toFixed(2).padStart(6);
    const ret = `${result.result.metrics.totalReturnPercent.toFixed(0)}%`.padStart(6);
    const dd = `${result.result.metrics.maxDrawdownPercent.toFixed(0)}%`.padStart(6);
    const trades = String(result.result.metrics.totalTrades).padStart(6);
    
    console.log(`| ${String(result.rank).padStart(4)} | ${fast} | ${slow} | ${sharpe} | ${ret} | ${dd} | ${trades} |`);
  }

  // Compare best to default (50/200) and Buy & Hold
  console.log('\n' + '═'.repeat(80));
  console.log('📊 COMPARISON');
  console.log('═'.repeat(80));

  // Default 50/200
  const defaultStrategy = new MACrossoverStrategy({
    symbol,
    fastPeriod: 50,
    slowPeriod: 200,
    positionSize: 0.95,
  });
  const engine = new BacktestEngine({ initialCapital: 100000 });
  defaultStrategy.init?.();
  const defaultResult = engine.run(defaultStrategy, data);

  // Buy & Hold
  const buyAndHold = new BuyAndHoldStrategy({ symbol, positionSize: 0.95 });
  buyAndHold.init?.();
  const bhResult = engine.run(buyAndHold, data);

  // Optimized
  const optimizedStrategy = new MACrossoverStrategy({
    symbol,
    fastPeriod: best.params.fastPeriod as number,
    slowPeriod: best.params.slowPeriod as number,
    positionSize: 0.95,
  });
  optimizedStrategy.init?.();
  const optimizedResult = engine.run(optimizedStrategy, data);

  console.log('\n| Strategy | Sharpe | Return | Max DD | Trades |');
  console.log('|----------|--------|--------|--------|--------|');
  console.log(`| Buy & Hold | ${bhResult.metrics.sharpeRatio.toFixed(2).padStart(6)} | ${bhResult.metrics.totalReturnPercent.toFixed(0).padStart(5)}% | ${bhResult.metrics.maxDrawdownPercent.toFixed(0).padStart(5)}% | ${String(bhResult.metrics.totalTrades).padStart(6)} |`);
  console.log(`| Default (50/200) | ${defaultResult.metrics.sharpeRatio.toFixed(2).padStart(6)} | ${defaultResult.metrics.totalReturnPercent.toFixed(0).padStart(5)}% | ${defaultResult.metrics.maxDrawdownPercent.toFixed(0).padStart(5)}% | ${String(defaultResult.metrics.totalTrades).padStart(6)} |`);
  console.log(`| Optimized (${best.params.fastPeriod}/${best.params.slowPeriod}) | ${optimizedResult.metrics.sharpeRatio.toFixed(2).padStart(6)} | ${optimizedResult.metrics.totalReturnPercent.toFixed(0).padStart(5)}% | ${optimizedResult.metrics.maxDrawdownPercent.toFixed(0).padStart(5)}% | ${String(optimizedResult.metrics.totalTrades).padStart(6)} |`);

  // Analysis
  console.log('\n' + '═'.repeat(80));
  console.log('📝 ANALYSIS');
  console.log('═'.repeat(80));

  const improvement = optimizedResult.metrics.sharpeRatio - defaultResult.metrics.sharpeRatio;
  const improvementPct = defaultResult.metrics.sharpeRatio !== 0 
    ? (improvement / Math.abs(defaultResult.metrics.sharpeRatio) * 100).toFixed(0)
    : 'N/A';

  console.log(`\n• Optimal periods: Fast=${best.params.fastPeriod}, Slow=${best.params.slowPeriod}`);
  console.log(`• Sharpe improvement over default: ${improvement > 0 ? '+' : ''}${improvement.toFixed(2)} (${improvementPct}%)`);
  
  if (optimizedResult.metrics.sharpeRatio > bhResult.metrics.sharpeRatio) {
    console.log(`• ✅ Optimized strategy beats Buy & Hold on risk-adjusted basis`);
  } else {
    console.log(`• ⚠️  Buy & Hold has better Sharpe ratio in this period`);
  }

  if (Math.abs(optimizedResult.metrics.maxDrawdownPercent) < Math.abs(bhResult.metrics.maxDrawdownPercent)) {
    console.log(`• ✅ Optimized strategy has lower max drawdown than Buy & Hold`);
  }

  // Heatmap hint
  console.log(`\n💡 Tip: Shorter fast periods (${best.params.fastPeriod}) with medium slow periods (${best.params.slowPeriod}) worked best for ${symbol}`);
  
  console.log('\n' + '═'.repeat(80) + '\n');

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

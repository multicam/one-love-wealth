#!/usr/bin/env bun
/**
 * Batch Validation Script
 * 
 * Tests multiple trading strategies across multiple symbols and generates
 * a comprehensive comparison report.
 * 
 * Usage: bun run scripts/batch-validate.ts [period]
 * Example: bun run scripts/batch-validate.ts 5y
 */

import type { YahooPeriod } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  BacktestDataLoader,
  MACrossoverStrategy,
  RSIReversionStrategy,
  BuyAndHoldStrategy,
  BollingerBreakoutStrategy,
  WalkForwardAnalyzer,
  MonteCarloSimulator,
  type BacktestData,
  type Strategy,
  type BacktestResult,
  type PerformanceMetrics,
} from '../src';

// ============================================================================
// Configuration
// ============================================================================

const period = (process.argv[2] || '5y') as YahooPeriod;
const initialCapital = 100000;

// Symbols to test
const SYMBOLS = ['TQQQ', 'QQQ', 'SPY', 'AAPL'];

// Strategy factories
interface StrategyConfig {
  name: string;
  description: string;
  create: (symbol: string) => Strategy;
  requiresVIX?: boolean;
}

const STRATEGIES: StrategyConfig[] = [
  {
    name: 'Buy & Hold',
    description: 'Simple buy and hold strategy',
    create: (symbol: string) => new BuyAndHoldStrategy({
      symbol,
      positionSize: 0.95,
    }),
  },
  {
    name: 'MA Crossover (50/200)',
    description: 'Golden/Death cross with 50 and 200 day SMAs',
    create: (symbol: string) => new MACrossoverStrategy({
      symbol,
      fastPeriod: 50,
      slowPeriod: 200,
      positionSize: 0.95,
    }),
  },
  {
    name: 'MA Crossover (20/50)',
    description: 'Faster moving average crossover',
    create: (symbol: string) => new MACrossoverStrategy({
      symbol,
      fastPeriod: 20,
      slowPeriod: 50,
      positionSize: 0.95,
    }),
  },
  {
    name: 'RSI Reversion',
    description: 'Buy oversold (RSI<30), sell overbought (RSI>70)',
    create: (symbol: string) => new RSIReversionStrategy({
      symbol,
      rsiPeriod: 14,
      oversold: 30,
      overbought: 70,
      positionSize: 0.95,
    }),
  },
  {
    name: 'RSI Aggressive',
    description: 'More aggressive RSI thresholds (25/75)',
    create: (symbol: string) => new RSIReversionStrategy({
      symbol,
      rsiPeriod: 14,
      oversold: 25,
      overbought: 75,
      positionSize: 0.95,
    }),
  },
  {
    name: 'Bollinger Breakout',
    description: 'Buy on upper band breakout, sell on lower band',
    create: (symbol: string) => new BollingerBreakoutStrategy({
      symbol,
      period: 20,
      standardDeviations: 2,
      positionSize: 0.95,
    }),
  },
];

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  symbol: string;
  strategy: string;
  metrics: PerformanceMetrics;
  walkForward: {
    avgOOSReturn: number;
    consistency: number;
    robustness: number;
  };
  monteCarlo: {
    probProfit: number;
    var95: number;
  };
  score: number;
  rating: string;
}

interface BatchResults {
  timestamp: string;
  period: string;
  initialCapital: number;
  results: ValidationResult[];
  bestBySymbol: Record<string, ValidationResult>;
  bestByStrategy: Record<string, ValidationResult>;
  overallBest: ValidationResult;
}

// ============================================================================
// Main Script
// ============================================================================

console.log('═'.repeat(80));
console.log('🧪 Batch Strategy Validation Suite');
console.log('═'.repeat(80));
console.log(`\n📅 Period: ${period}`);
console.log(`💰 Initial Capital: $${initialCapital.toLocaleString()}`);
console.log(`📊 Symbols: ${SYMBOLS.join(', ')}`);
console.log(`🎯 Strategies: ${STRATEGIES.length}`);
console.log(`📈 Total Tests: ${SYMBOLS.length * STRATEGIES.length}\n`);

const loader = new BacktestDataLoader();
const engine = new BacktestEngine({ initialCapital });
const walkForwardAnalyzer = new WalkForwardAnalyzer(initialCapital);
const monteCarloSimulator = new MonteCarloSimulator(initialCapital);

const results: ValidationResult[] = [];
const ratings = ['❌ Fails', '⚠️ Poor', '📊 Fair', '✅ Good', '🌟 Very Good', '🏆 Excellent'];

// ============================================================================
// Step 1: Load all symbol data
// ============================================================================

console.log('─'.repeat(80));
console.log('Step 1: Loading Historical Data');
console.log('─'.repeat(80));

const symbolDataMap: Map<string, BacktestData> = new Map();

for (const symbol of SYMBOLS) {
  try {
    console.log(`  Loading ${symbol}...`);
    const result = await loader.load({
      symbols: [symbol],
      period,
      interval: '1d',
      gapFillStrategy: 'forward-fill',
      mockMode: false,
    });
    symbolDataMap.set(symbol, result.data);
    console.log(`    ✅ ${result.stats.totalBars} bars (${result.stats.dateRange.start.toLocaleDateString()} - ${result.stats.dateRange.end.toLocaleDateString()})`);
  } catch (error) {
    console.log(`    ❌ Failed to load ${symbol}: ${error}`);
  }
}

// ============================================================================
// Step 2: Run all strategy/symbol combinations
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Step 2: Running Backtests');
console.log('─'.repeat(80));

let testCount = 0;
const totalTests = SYMBOLS.length * STRATEGIES.length;

for (const symbol of SYMBOLS) {
  const data = symbolDataMap.get(symbol);
  if (!data) {
    console.log(`\n⏭️  Skipping ${symbol} (no data)`);
    continue;
  }

  console.log(`\n📊 Testing ${symbol}:`);

  for (const strategyConfig of STRATEGIES) {
    testCount++;
    const progress = `[${testCount}/${totalTests}]`;
    
    try {
      // Create strategy
      const strategy = strategyConfig.create(symbol);
      strategy.init?.();

      // Run full backtest
      const result = engine.run(strategy, data);

      // Run walk-forward (quick version with 3 windows)
      strategy.init?.();
      const wfResult = walkForwardAnalyzer.analyze(strategy, data, {
        numWindows: 3,
        inSampleRatio: 0.7,
        optimizePerWindow: false,
      });

      // Run Monte Carlo (reduced for speed)
      const mcResult = monteCarloSimulator.simulate(result, {
        numSimulations: 100,
        method: 'bootstrap-returns',
        confidenceLevel: 0.95,
      });

      // Calculate score
      let score = 0;
      const isProfitable = result.metrics.totalReturn > 0;
      const hasGoodSharpe = result.metrics.sharpeRatio > 0.5;
      const isConsistent = wfResult.aggregatedMetrics.consistencyRatio > 0.5;
      const hasGoodRobustness = wfResult.aggregatedMetrics.robustnessScore > 40;
      const passedMonteCarlo = mcResult.statistics.probabilityOfProfit > 0.5;

      if (isProfitable) score++;
      if (hasGoodSharpe) score++;
      if (isConsistent) score++;
      if (hasGoodRobustness) score++;
      if (passedMonteCarlo) score++;

      const validationResult: ValidationResult = {
        symbol,
        strategy: strategyConfig.name,
        metrics: result.metrics,
        walkForward: {
          avgOOSReturn: wfResult.aggregatedMetrics.avgOutOfSampleReturn,
          consistency: wfResult.aggregatedMetrics.consistencyRatio,
          robustness: wfResult.aggregatedMetrics.robustnessScore,
        },
        monteCarlo: {
          probProfit: mcResult.statistics.probabilityOfProfit,
          var95: mcResult.statistics.valueAtRisk,
        },
        score,
        rating: ratings[score] ?? ratings[0],
      };

      results.push(validationResult);

      const returnStr = result.metrics.totalReturnPercent >= 0 
        ? `+${result.metrics.totalReturnPercent.toFixed(1)}%`
        : `${result.metrics.totalReturnPercent.toFixed(1)}%`;
      const sharpeStr = result.metrics.sharpeRatio.toFixed(2);

      console.log(`  ${progress} ${strategyConfig.name.padEnd(22)} ${returnStr.padStart(8)} | Sharpe: ${sharpeStr.padStart(5)} | ${ratings[score]}`);

    } catch (error) {
      console.log(`  ${progress} ${strategyConfig.name.padEnd(22)} ❌ Error: ${error}`);
    }
  }
}

// ============================================================================
// Step 3: Analyze Results
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Step 3: Analyzing Results');
console.log('─'.repeat(80));

// Find best by symbol
const bestBySymbol: Record<string, ValidationResult> = {};
for (const symbol of SYMBOLS) {
  const symbolResults = results.filter(r => r.symbol === symbol);
  if (symbolResults.length > 0) {
    bestBySymbol[symbol] = symbolResults.reduce((best, current) => 
      current.score > best.score || 
      (current.score === best.score && current.metrics.sharpeRatio > best.metrics.sharpeRatio)
        ? current : best
    );
  }
}

// Find best by strategy
const bestByStrategy: Record<string, ValidationResult> = {};
for (const strategyConfig of STRATEGIES) {
  const strategyResults = results.filter(r => r.strategy === strategyConfig.name);
  if (strategyResults.length > 0) {
    bestByStrategy[strategyConfig.name] = strategyResults.reduce((best, current) => 
      current.score > best.score || 
      (current.score === best.score && current.metrics.sharpeRatio > best.metrics.sharpeRatio)
        ? current : best
    );
  }
}

// Overall best
const overallBest = results.reduce((best, current) => 
  current.score > best.score || 
  (current.score === best.score && current.metrics.sharpeRatio > best.metrics.sharpeRatio)
    ? current : best
, results[0]);

// ============================================================================
// Step 4: Display Summary
// ============================================================================

console.log('\n' + '═'.repeat(80));
console.log('📊 Results Summary');
console.log('═'.repeat(80));

// Results matrix header
console.log('\n📈 Return Matrix (%):\n');
console.log('Strategy'.padEnd(24) + SYMBOLS.map(s => s.padStart(10)).join(''));
console.log('─'.repeat(24 + SYMBOLS.length * 10));

for (const strategyConfig of STRATEGIES) {
  let row = strategyConfig.name.padEnd(24);
  for (const symbol of SYMBOLS) {
    const result = results.find(r => r.symbol === symbol && r.strategy === strategyConfig.name);
    if (result) {
      const ret = result.metrics.totalReturnPercent;
      const retStr = ret >= 0 ? `+${ret.toFixed(1)}` : ret.toFixed(1);
      row += retStr.padStart(10);
    } else {
      row += 'N/A'.padStart(10);
    }
  }
  console.log(row);
}

// Sharpe ratio matrix
console.log('\n📊 Sharpe Ratio Matrix:\n');
console.log('Strategy'.padEnd(24) + SYMBOLS.map(s => s.padStart(10)).join(''));
console.log('─'.repeat(24 + SYMBOLS.length * 10));

for (const strategyConfig of STRATEGIES) {
  let row = strategyConfig.name.padEnd(24);
  for (const symbol of SYMBOLS) {
    const result = results.find(r => r.symbol === symbol && r.strategy === strategyConfig.name);
    if (result) {
      row += result.metrics.sharpeRatio.toFixed(2).padStart(10);
    } else {
      row += 'N/A'.padStart(10);
    }
  }
  console.log(row);
}

// Rating matrix
console.log('\n🏆 Rating Matrix:\n');
console.log('Strategy'.padEnd(24) + SYMBOLS.map(s => s.padStart(12)).join(''));
console.log('─'.repeat(24 + SYMBOLS.length * 12));

for (const strategyConfig of STRATEGIES) {
  let row = strategyConfig.name.padEnd(24);
  for (const symbol of SYMBOLS) {
    const result = results.find(r => r.symbol === symbol && r.strategy === strategyConfig.name);
    if (result) {
      row += `${result.score}/5`.padStart(12);
    } else {
      row += 'N/A'.padStart(12);
    }
  }
  console.log(row);
}

// Best performers
console.log('\n' + '═'.repeat(80));
console.log('🏆 Best Performers');
console.log('═'.repeat(80));

console.log('\n📊 Best Strategy per Symbol:');
for (const [symbol, best] of Object.entries(bestBySymbol)) {
  console.log(`  ${symbol.padEnd(6)}: ${best.strategy.padEnd(22)} (${best.metrics.totalReturnPercent >= 0 ? '+' : ''}${best.metrics.totalReturnPercent.toFixed(1)}%, Sharpe: ${best.metrics.sharpeRatio.toFixed(2)}) ${best.rating}`);
}

console.log('\n🎯 Best Symbol per Strategy:');
for (const [strategy, best] of Object.entries(bestByStrategy)) {
  console.log(`  ${strategy.padEnd(22)}: ${best.symbol.padEnd(6)} (${best.metrics.totalReturnPercent >= 0 ? '+' : ''}${best.metrics.totalReturnPercent.toFixed(1)}%, Sharpe: ${best.metrics.sharpeRatio.toFixed(2)}) ${best.rating}`);
}

console.log('\n🥇 Overall Best:');
if (overallBest) {
  console.log(`  ${overallBest.strategy} on ${overallBest.symbol}`);
  console.log(`  Return: ${overallBest.metrics.totalReturnPercent >= 0 ? '+' : ''}${overallBest.metrics.totalReturnPercent.toFixed(1)}%`);
  console.log(`  Sharpe: ${overallBest.metrics.sharpeRatio.toFixed(2)}`);
  console.log(`  Max Drawdown: ${overallBest.metrics.maxDrawdownPercent.toFixed(1)}%`);
  console.log(`  Rating: ${overallBest.rating}`);
}

// ============================================================================
// Step 5: Generate Reports
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('Step 5: Generating Reports');
console.log('─'.repeat(80));

const reportDate = new Date().toISOString().split('T')[0];
const batchResults: BatchResults = {
  timestamp: new Date().toISOString(),
  period,
  initialCapital,
  results,
  bestBySymbol,
  bestByStrategy,
  overallBest,
};

// Generate markdown report
const markdownReport = `# Batch Strategy Validation Report

**Generated:** ${new Date().toLocaleString()}
**Period:** ${period}
**Initial Capital:** $${initialCapital.toLocaleString()}
**Symbols Tested:** ${SYMBOLS.join(', ')}
**Strategies Tested:** ${STRATEGIES.length}
**Total Tests:** ${results.length}

---

## Executive Summary

### Overall Best Performer

| Metric | Value |
|--------|-------|
| Strategy | ${overallBest?.strategy ?? 'N/A'} |
| Symbol | ${overallBest?.symbol ?? 'N/A'} |
| Total Return | ${overallBest ? `${overallBest.metrics.totalReturnPercent.toFixed(1)}%` : 'N/A'} |
| Sharpe Ratio | ${overallBest?.metrics.sharpeRatio.toFixed(2) ?? 'N/A'} |
| Max Drawdown | ${overallBest ? `${overallBest.metrics.maxDrawdownPercent.toFixed(1)}%` : 'N/A'} |
| Rating | ${overallBest?.rating ?? 'N/A'} |

---

## Return Matrix (%)

| Strategy | ${SYMBOLS.join(' | ')} |
|----------|${SYMBOLS.map(() => '------').join('|')}|
${STRATEGIES.map(s => {
  const cells = SYMBOLS.map(symbol => {
    const r = results.find(res => res.symbol === symbol && res.strategy === s.name);
    return r ? `${r.metrics.totalReturnPercent.toFixed(1)}%` : 'N/A';
  });
  return `| ${s.name} | ${cells.join(' | ')} |`;
}).join('\n')}

---

## Sharpe Ratio Matrix

| Strategy | ${SYMBOLS.join(' | ')} |
|----------|${SYMBOLS.map(() => '------').join('|')}|
${STRATEGIES.map(s => {
  const cells = SYMBOLS.map(symbol => {
    const r = results.find(res => res.symbol === symbol && res.strategy === s.name);
    return r ? r.metrics.sharpeRatio.toFixed(2) : 'N/A';
  });
  return `| ${s.name} | ${cells.join(' | ')} |`;
}).join('\n')}

---

## Score Matrix (0-5)

| Strategy | ${SYMBOLS.join(' | ')} |
|----------|${SYMBOLS.map(() => '------').join('|')}|
${STRATEGIES.map(s => {
  const cells = SYMBOLS.map(symbol => {
    const r = results.find(res => res.symbol === symbol && res.strategy === s.name);
    return r ? `${r.score}/5` : 'N/A';
  });
  return `| ${s.name} | ${cells.join(' | ')} |`;
}).join('\n')}

---

## Best Strategy per Symbol

| Symbol | Best Strategy | Return | Sharpe | Rating |
|--------|--------------|--------|--------|--------|
${Object.entries(bestBySymbol).map(([symbol, best]) => 
  `| ${symbol} | ${best.strategy} | ${best.metrics.totalReturnPercent.toFixed(1)}% | ${best.metrics.sharpeRatio.toFixed(2)} | ${best.rating} |`
).join('\n')}

---

## Best Symbol per Strategy

| Strategy | Best Symbol | Return | Sharpe | Rating |
|----------|-------------|--------|--------|--------|
${Object.entries(bestByStrategy).map(([strategy, best]) => 
  `| ${strategy} | ${best.symbol} | ${best.metrics.totalReturnPercent.toFixed(1)}% | ${best.metrics.sharpeRatio.toFixed(2)} | ${best.rating} |`
).join('\n')}

---

## Detailed Results

${results.map(r => `
### ${r.strategy} on ${r.symbol}

| Metric | Value |
|--------|-------|
| Total Return | ${r.metrics.totalReturnPercent.toFixed(2)}% |
| CAGR | ${(r.metrics.cagr * 100).toFixed(2)}% |
| Sharpe Ratio | ${r.metrics.sharpeRatio.toFixed(3)} |
| Sortino Ratio | ${r.metrics.sortinoRatio.toFixed(3)} |
| Max Drawdown | ${r.metrics.maxDrawdownPercent.toFixed(2)}% |
| Win Rate | ${(r.metrics.winRate * 100).toFixed(1)}% |
| Total Trades | ${r.metrics.totalTrades} |
| WF Consistency | ${(r.walkForward.consistency * 100).toFixed(0)}% |
| WF Robustness | ${r.walkForward.robustness.toFixed(0)}/100 |
| MC Prob Profit | ${(r.monteCarlo.probProfit * 100).toFixed(0)}% |
| MC VaR 95% | ${(r.monteCarlo.var95 * 100).toFixed(1)}% |
| Score | ${r.score}/5 |
| Rating | ${r.rating} |
`).join('\n')}

---

*Report generated by Backtesting Framework*
`;

const mdPath = `packages/backtesting/reports/batch-validation-${reportDate}.md`;
await Bun.write(mdPath, markdownReport);
console.log(`\n✅ Markdown report: ${mdPath}`);

// Save JSON results
const jsonPath = `packages/backtesting/reports/batch-validation-${reportDate}.json`;
await Bun.write(jsonPath, JSON.stringify(batchResults, null, 2));
console.log(`✅ JSON results: ${jsonPath}`);

// Generate CSV for easy import
const csvHeader = 'Symbol,Strategy,Return,CAGR,Sharpe,Sortino,MaxDD,WinRate,Trades,WF_Consistency,WF_Robustness,MC_ProbProfit,MC_VaR95,Score,Rating';
const csvRows = results.map(r => 
  `${r.symbol},${r.strategy},${r.metrics.totalReturnPercent.toFixed(2)},${(r.metrics.cagr * 100).toFixed(2)},${r.metrics.sharpeRatio.toFixed(3)},${r.metrics.sortinoRatio.toFixed(3)},${r.metrics.maxDrawdownPercent.toFixed(2)},${(r.metrics.winRate * 100).toFixed(1)},${r.metrics.totalTrades},${(r.walkForward.consistency * 100).toFixed(0)},${r.walkForward.robustness.toFixed(0)},${(r.monteCarlo.probProfit * 100).toFixed(0)},${(r.monteCarlo.var95 * 100).toFixed(1)},${r.score},"${r.rating}"`
);
const csvContent = [csvHeader, ...csvRows].join('\n');
const csvPath = `packages/backtesting/reports/batch-validation-${reportDate}.csv`;
await Bun.write(csvPath, csvContent);
console.log(`✅ CSV results: ${csvPath}`);

console.log('\n' + '═'.repeat(80));
console.log('✅ Batch Validation Complete!');
console.log(`   ${results.length} strategy/symbol combinations tested`);
console.log(`   Best: ${overallBest?.strategy} on ${overallBest?.symbol} (${overallBest?.rating})`);
console.log('═'.repeat(80) + '\n');

#!/usr/bin/env bun
/**
 * Full Validation Suite for VIX Hedge Strategy
 * 
 * Runs comprehensive testing including:
 * - Train/Test split validation
 * - Walk-forward analysis
 * - Monte Carlo simulation
 * - Benchmark comparisons
 * - Report generation
 * 
 * Usage: bun run scripts/validate-vix-hedge.ts [period]
 * Example: bun run scripts/validate-vix-hedge.ts 10y
 */

import type { YahooPeriod } from '@one-love-wealth/data-layer';
import {
  BacktestEngine,
  BacktestDataLoader,
  VIXHedgeStrategy,
  BuyAndHoldStrategy,
  StrategyValidator,
  WalkForwardAnalyzer,
  MonteCarloSimulator,
  BenchmarkComparer,
  type BacktestData,
  type Strategy,
  type BacktestResult,
} from '../src';

// Configuration
const tradingSymbol = 'TQQQ';
const vixSymbol = '^VIX';
const period = (process.argv[2] || '5y') as YahooPeriod;
const initialCapital = 100000;

console.log('═'.repeat(70));
console.log('🧪 VIX Hedge Strategy - Full Validation Suite');
console.log('═'.repeat(70));
console.log(`\n📊 Symbol: ${tradingSymbol}`);
console.log(`📅 Period: ${period}`);
console.log(`💰 Initial Capital: $${initialCapital.toLocaleString()}\n`);

// Step 1: Load Data
console.log('─'.repeat(70));
console.log('Step 1: Loading Historical Data');
console.log('─'.repeat(70));

const loader = new BacktestDataLoader();

const dataResult = await loader.load({
  symbols: [tradingSymbol, vixSymbol],
  period,
  interval: '1d',
  gapFillStrategy: 'forward-fill',
  mockMode: false,
});

const { data, stats } = dataResult;

console.log(`✅ Loaded ${stats.totalBars} bars`);
console.log(`📅 Date Range: ${stats.dateRange.start.toLocaleDateString()} - ${stats.dateRange.end.toLocaleDateString()}`);

const filledGapsTotal = Object.values(stats.filledGaps).reduce((a, b) => a + b, 0);
if (filledGapsTotal > 0) {
  console.log(`🔧 Filled ${filledGapsTotal} gaps`);
}

// Step 2: Create Strategy
console.log('\n' + '─'.repeat(70));
console.log('Step 2: Setting Up Strategy');
console.log('─'.repeat(70));

const vixHedgeStrategy = new VIXHedgeStrategy({
  tradingSymbol,
  vixSymbol,
  vixExitThreshold: 25,
  vixEntryThreshold: 20,
  positionSize: 0.95,
});

const benchmarkStrategy = new BuyAndHoldStrategy({
  symbol: tradingSymbol,
  positionSize: 0.95,
});

console.log('✅ Strategy configured');
console.log(`   - VIX Exit Threshold: 25`);
console.log(`   - VIX Entry Threshold: 20`);
console.log(`   - Position Size: 95%`);

// Step 3: Run Validation Suite
console.log('\n' + '─'.repeat(70));
console.log('Step 3: Running Validation Suite');
console.log('─'.repeat(70));

const engine = new BacktestEngine({ initialCapital });
const validator = new StrategyValidator(initialCapital);
const walkForwardAnalyzer = new WalkForwardAnalyzer(initialCapital);
const monteCarloSimulator = new MonteCarloSimulator(initialCapital);
const benchmarkComparer = new BenchmarkComparer(initialCapital);

console.log('\n🔬 Running comprehensive validation...\n');

// 3a. Full period backtest
console.log('  📊 Running full period backtest...');
vixHedgeStrategy.init?.();
const fullResult = engine.run(vixHedgeStrategy, data);
console.log(`     Return: ${fullResult.metrics.totalReturnPercent.toFixed(1)}%`);

// 3b. Train/Test Split
console.log('  📈 Running train/test split (70/30)...');
const trainTestResult = validator.validate(vixHedgeStrategy, data, {
  trainTestSplit: 0.7,
  benchmarks: [], // Don't use default benchmarks which require SPY
});
console.log(`     Train: ${trainTestResult.trainResult?.metrics.totalReturnPercent.toFixed(1)}%`);
console.log(`     Test:  ${trainTestResult.testResult?.metrics.totalReturnPercent.toFixed(1)}%`);

// 3c. Walk-Forward Analysis
console.log('  🚶 Running walk-forward analysis (5 windows)...');
const walkForwardResult = walkForwardAnalyzer.analyze(vixHedgeStrategy, data, {
  numWindows: 5,
  inSampleRatio: 0.7,
  optimizePerWindow: false,
});
console.log(`     Avg OOS Return: ${(walkForwardResult.aggregatedMetrics.avgOutOfSampleReturn * 100).toFixed(1)}%`);
console.log(`     Consistency: ${(walkForwardResult.aggregatedMetrics.consistencyRatio * 100).toFixed(0)}%`);

// 3d. Monte Carlo Simulation
console.log('  🎲 Running Monte Carlo simulation (500 runs)...');
const monteCarloResult = monteCarloSimulator.simulate(fullResult, {
  numSimulations: 500,
  method: 'bootstrap-returns',
  confidenceLevel: 0.95,
});
console.log(`     Prob. Profit: ${(monteCarloResult.statistics.probabilityOfProfit * 100).toFixed(0)}%`);
console.log(`     VaR (95%): ${(monteCarloResult.statistics.valueAtRisk * 100).toFixed(1)}%`);

// 3e. Benchmark Comparison
console.log('  📊 Comparing to Buy & Hold benchmark...');
benchmarkStrategy.init?.();
const benchmarkResult = engine.run(benchmarkStrategy, data);

// Step 4: Display Results Summary
console.log('\n' + '═'.repeat(70));
console.log('📊 Validation Results Summary');
console.log('═'.repeat(70));

// Train/Test Results
console.log('\n📈 Train/Test Split Results:');
if (trainTestResult.trainResult && trainTestResult.testResult) {
  const trainReturn = trainTestResult.trainResult.metrics.totalReturnPercent;
  const testReturn = trainTestResult.testResult.metrics.totalReturnPercent;
  const degradation = trainReturn !== 0 ? ((trainReturn - testReturn) / Math.abs(trainReturn)) : 0;
  
  console.log(`   Training Period: ${trainReturn.toFixed(1)}% return`);
  console.log(`   Testing Period:  ${testReturn.toFixed(1)}% return`);
  console.log(`   Degradation:     ${(degradation * 100).toFixed(1)}%`);
  
  if (Math.abs(degradation) > 0.5) {
    console.log('   ⚠️  High overfit risk detected!');
  } else {
    console.log('   ✅ Low overfit risk');
  }
}

// Walk-Forward Results
console.log('\n🚶 Walk-Forward Analysis:');
console.log(`   Windows Tested:    ${walkForwardResult.windows.length}`);
console.log(`   Avg IS Return:     ${(walkForwardResult.aggregatedMetrics.avgInSampleReturn * 100).toFixed(1)}%`);
console.log(`   Avg OOS Return:    ${(walkForwardResult.aggregatedMetrics.avgOutOfSampleReturn * 100).toFixed(1)}%`);
console.log(`   Consistency:       ${(walkForwardResult.aggregatedMetrics.consistencyRatio * 100).toFixed(0)}%`);
console.log(`   Robustness Score:  ${walkForwardResult.aggregatedMetrics.robustnessScore}/100`);
const profitableWindows = walkForwardResult.windows.filter(w => w.outOfSampleResult.metrics.totalReturn > 0).length;
console.log(`   Profitable Windows: ${profitableWindows}/${walkForwardResult.windows.length}`);

// Monte Carlo Results
console.log('\n🎲 Monte Carlo Simulation:');
const mcStats = monteCarloResult.statistics;
console.log(`   Simulations:       ${monteCarloResult.config.numSimulations}`);
console.log(`   Mean Return:       ${(mcStats.returnDistribution.mean * 100).toFixed(1)}%`);
console.log(`   Median Return:     ${(mcStats.returnDistribution.median * 100).toFixed(1)}%`);
console.log(`   Std Dev:           ${(mcStats.returnDistribution.stdDev * 100).toFixed(1)}%`);
console.log(`   5th Percentile:    ${(mcStats.returnDistribution.percentile5 * 100).toFixed(1)}%`);
console.log(`   95th Percentile:   ${(mcStats.returnDistribution.percentile95 * 100).toFixed(1)}%`);
console.log(`   Probability > 0:   ${(mcStats.probabilityOfProfit * 100).toFixed(0)}%`);
console.log(`   VaR (95%):         ${(mcStats.valueAtRisk * 100).toFixed(1)}%`);
console.log(`   CVaR (95%):        ${(mcStats.conditionalVaR * 100).toFixed(1)}%`);

// Benchmark Comparison
console.log('\n📊 Benchmark Comparison:');
console.log(`   VIX Hedge:`);
console.log(`     Return: ${fullResult.metrics.totalReturnPercent.toFixed(1)}%`);
console.log(`     Sharpe: ${fullResult.metrics.sharpeRatio.toFixed(2)}`);
console.log(`     MaxDD:  ${fullResult.metrics.maxDrawdownPercent.toFixed(1)}%`);
console.log(`   Buy & Hold:`);
console.log(`     Return: ${benchmarkResult.metrics.totalReturnPercent.toFixed(1)}%`);
console.log(`     Sharpe: ${benchmarkResult.metrics.sharpeRatio.toFixed(2)}`);
console.log(`     MaxDD:  ${benchmarkResult.metrics.maxDrawdownPercent.toFixed(1)}%`);

const alpha = fullResult.metrics.totalReturnPercent - benchmarkResult.metrics.totalReturnPercent;
console.log(`   Alpha: ${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}%`);

// Overall Assessment
console.log('\n' + '═'.repeat(70));
console.log('🏆 Overall Assessment');
console.log('═'.repeat(70));

const trainReturn = trainTestResult.trainResult?.metrics.totalReturn ?? 0;
const testReturn = trainTestResult.testResult?.metrics.totalReturn ?? 0;
const degradation = trainReturn !== 0 ? Math.abs((trainReturn - testReturn) / trainReturn) : 0;

const isOverfit = degradation > 0.5;
const isConsistent = walkForwardResult.aggregatedMetrics.consistencyRatio > 0.5;
const isProfitable = fullResult.metrics.totalReturn > 0;
const hasGoodRisk = fullResult.metrics.sharpeRatio > 0.5;
const passedMonteCarlo = mcStats.probabilityOfProfit > 0.5;

let score = 0;
if (!isOverfit) score++;
if (isConsistent) score++;
if (isProfitable) score++;
if (hasGoodRisk) score++;
if (passedMonteCarlo) score++;

const ratings = ['❌ Fails', '⚠️ Poor', '📊 Fair', '✅ Good', '🌟 Very Good', '🏆 Excellent'];
console.log(`\n   Rating: ${ratings[score]}`);
console.log(`   - Overfit Risk:    ${isOverfit ? '❌ High' : '✅ Low'}`);
console.log(`   - Consistency:     ${isConsistent ? '✅ Good' : '⚠️ Inconsistent'}`);
console.log(`   - Profitability:   ${isProfitable ? '✅ Profitable' : '❌ Unprofitable'}`);
console.log(`   - Risk-Adjusted:   ${hasGoodRisk ? '✅ Good Sharpe' : '⚠️ Low Sharpe'}`);
console.log(`   - Monte Carlo:     ${passedMonteCarlo ? '✅ Passed' : '⚠️ Low confidence'}`);

// Step 5: Generate Report
console.log('\n' + '─'.repeat(70));
console.log('Step 5: Generating Report');
console.log('─'.repeat(70));

const reportDate = new Date().toISOString().split('T')[0];
const reportPath = `packages/backtesting/reports/vix-hedge-validation-${reportDate}.md`;

// Generate markdown report
const report = `# VIX Hedge Strategy Validation Report

**Generated:** ${new Date().toLocaleString()}
**Symbol:** ${tradingSymbol}
**Period:** ${period}
**Initial Capital:** $${initialCapital.toLocaleString()}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall Rating | ${ratings[score]} |
| Total Return | ${fullResult.metrics.totalReturnPercent.toFixed(1)}% |
| Sharpe Ratio | ${fullResult.metrics.sharpeRatio.toFixed(2)} |
| Max Drawdown | ${fullResult.metrics.maxDrawdownPercent.toFixed(1)}% |
| Win Rate | ${(fullResult.metrics.winRate * 100).toFixed(0)}% |
| Total Trades | ${fullResult.metrics.totalTrades} |

---

## Strategy Description

The VIX Hedge strategy exits ${tradingSymbol} positions when VIX rises above 25 (indicating high market fear) and re-enters when VIX falls below 20 (indicating calmer markets).

**Parameters:**
- VIX Exit Threshold: 25
- VIX Entry Threshold: 20
- Position Size: 95%

---

## Full Period Results

| Metric | Value |
|--------|-------|
| Total Return | ${fullResult.metrics.totalReturnPercent.toFixed(2)}% |
| CAGR | ${(fullResult.metrics.cagr * 100).toFixed(2)}% |
| Sharpe Ratio | ${fullResult.metrics.sharpeRatio.toFixed(3)} |
| Sortino Ratio | ${fullResult.metrics.sortinoRatio.toFixed(3)} |
| Max Drawdown | ${fullResult.metrics.maxDrawdownPercent.toFixed(2)}% |
| Volatility | ${(fullResult.metrics.volatility * 100).toFixed(2)}% |
| Win Rate | ${(fullResult.metrics.winRate * 100).toFixed(1)}% |
| Profit Factor | ${fullResult.metrics.profitFactor.toFixed(2)} |
| Total Trades | ${fullResult.metrics.totalTrades} |

---

## Train/Test Split Analysis

**Split Ratio:** 70% train / 30% test

| Period | Return | Sharpe | Max DD |
|--------|--------|--------|--------|
| Training | ${trainTestResult.trainResult?.metrics.totalReturnPercent.toFixed(1)}% | ${trainTestResult.trainResult?.metrics.sharpeRatio.toFixed(2)} | ${trainTestResult.trainResult?.metrics.maxDrawdownPercent.toFixed(1)}% |
| Testing | ${trainTestResult.testResult?.metrics.totalReturnPercent.toFixed(1)}% | ${trainTestResult.testResult?.metrics.sharpeRatio.toFixed(2)} | ${trainTestResult.testResult?.metrics.maxDrawdownPercent.toFixed(1)}% |

**Degradation:** ${(degradation * 100).toFixed(1)}%
**Overfit Risk:** ${isOverfit ? '⚠️ High' : '✅ Low'}

---

## Walk-Forward Analysis

**Configuration:**
- Windows: ${walkForwardResult.windows.length}
- In-Sample Ratio: 70%

| Window | IS Return | OOS Return | Degradation |
|--------|-----------|------------|-------------|
${walkForwardResult.windows.map((w, i) => 
  `| ${i + 1} | ${(w.inSampleResult.metrics.totalReturn * 100).toFixed(1)}% | ${(w.outOfSampleResult.metrics.totalReturn * 100).toFixed(1)}% | ${(w.degradation * 100).toFixed(1)}% |`
).join('\n')}

**Aggregate Metrics:**
- Average OOS Return: ${(walkForwardResult.aggregatedMetrics.avgOutOfSampleReturn * 100).toFixed(1)}%
- Consistency Ratio: ${(walkForwardResult.aggregatedMetrics.consistencyRatio * 100).toFixed(0)}%
- Robustness Score: ${walkForwardResult.aggregatedMetrics.robustnessScore}/100

---

## Monte Carlo Simulation

**Configuration:**
- Simulations: ${monteCarloResult.config.numSimulations}
- Method: ${monteCarloResult.config.method}
- Confidence Level: ${(monteCarloResult.config.confidenceLevel ?? 0.95) * 100}%

### Return Distribution

| Statistic | Value |
|-----------|-------|
| Mean | ${(mcStats.returnDistribution.mean * 100).toFixed(2)}% |
| Median | ${(mcStats.returnDistribution.median * 100).toFixed(2)}% |
| Std Dev | ${(mcStats.returnDistribution.stdDev * 100).toFixed(2)}% |
| Min | ${(mcStats.returnDistribution.min * 100).toFixed(2)}% |
| Max | ${(mcStats.returnDistribution.max * 100).toFixed(2)}% |
| 5th Percentile | ${(mcStats.returnDistribution.percentile5 * 100).toFixed(2)}% |
| 95th Percentile | ${(mcStats.returnDistribution.percentile95 * 100).toFixed(2)}% |

### Risk Metrics

| Metric | Value |
|--------|-------|
| Probability of Profit | ${(mcStats.probabilityOfProfit * 100).toFixed(1)}% |
| Value at Risk (95%) | ${(mcStats.valueAtRisk * 100).toFixed(2)}% |
| Conditional VaR (95%) | ${(mcStats.conditionalVaR * 100).toFixed(2)}% |

---

## Benchmark Comparison

| Strategy | Return | Sharpe | Max DD | Trades |
|----------|--------|--------|--------|--------|
| VIX Hedge | ${fullResult.metrics.totalReturnPercent.toFixed(1)}% | ${fullResult.metrics.sharpeRatio.toFixed(2)} | ${fullResult.metrics.maxDrawdownPercent.toFixed(1)}% | ${fullResult.metrics.totalTrades} |
| Buy & Hold | ${benchmarkResult.metrics.totalReturnPercent.toFixed(1)}% | ${benchmarkResult.metrics.sharpeRatio.toFixed(2)} | ${benchmarkResult.metrics.maxDrawdownPercent.toFixed(1)}% | ${benchmarkResult.metrics.totalTrades} |

**Alpha vs Buy & Hold:** ${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}%

---

## Validation Summary

| Check | Status |
|-------|--------|
| Overfit Risk | ${isOverfit ? '❌ High' : '✅ Low'} |
| Walk-Forward Consistency | ${isConsistent ? '✅ Good' : '⚠️ Inconsistent'} |
| Profitability | ${isProfitable ? '✅ Yes' : '❌ No'} |
| Risk-Adjusted Returns | ${hasGoodRisk ? '✅ Good' : '⚠️ Low'} |
| Monte Carlo Confidence | ${passedMonteCarlo ? '✅ Passed' : '⚠️ Low'} |

**Overall Rating: ${ratings[score]}**

---

*Report generated by Backtesting Framework*
`;

await Bun.write(reportPath, report);

console.log(`\n✅ Report saved to: ${reportPath}`);
console.log(`📄 Report size: ${(report.length / 1024).toFixed(1)} KB`);

// Also output JSON summary
const jsonPath = reportPath.replace('.md', '.json');
const summary = {
  strategy: 'VIX Hedge',
  symbol: tradingSymbol,
  period,
  rating: ratings[score],
  score,
  fullPeriod: {
    totalReturn: fullResult.metrics.totalReturnPercent,
    sharpeRatio: fullResult.metrics.sharpeRatio,
    maxDrawdown: fullResult.metrics.maxDrawdownPercent,
    trades: fullResult.metrics.totalTrades,
  },
  trainTest: {
    trainReturn: trainTestResult.trainResult?.metrics.totalReturnPercent,
    testReturn: trainTestResult.testResult?.metrics.totalReturnPercent,
    degradation: degradation * 100,
  },
  walkForward: {
    windows: walkForwardResult.windows.length,
    avgOOSReturn: walkForwardResult.aggregatedMetrics.avgOutOfSampleReturn * 100,
    consistencyRatio: walkForwardResult.aggregatedMetrics.consistencyRatio * 100,
    robustnessScore: walkForwardResult.aggregatedMetrics.robustnessScore,
  },
  monteCarlo: {
    simulations: monteCarloResult.config.numSimulations,
    probabilityOfProfit: mcStats.probabilityOfProfit * 100,
    var95: mcStats.valueAtRisk * 100,
    cvar95: mcStats.conditionalVaR * 100,
  },
  benchmark: {
    buyAndHoldReturn: benchmarkResult.metrics.totalReturnPercent,
    alpha,
  },
  flags: {
    isOverfit,
    isConsistent,
    isProfitable,
    hasGoodRisk,
    passedMonteCarlo,
  },
};

await Bun.write(jsonPath, JSON.stringify(summary, null, 2));
console.log(`📊 JSON summary saved to: ${jsonPath}`);

console.log('\n' + '═'.repeat(70));
console.log('✅ Validation Complete!');
console.log('═'.repeat(70) + '\n');

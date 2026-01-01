#!/usr/bin/env bun
/**
 * Strategy Validation CLI
 * 
 * Comprehensive command-line tool for validating trading strategies.
 * 
 * Usage:
 *   bun run scripts/validate-strategy.ts [options]
 * 
 * Options:
 *   --strategy <name>     Strategy to validate (ma-crossover, rsi-reversion, vix-hedge, buy-hold)
 *   --symbol <ticker>     Primary symbol (default: TQQQ)
 *   --vix-symbol <ticker> VIX symbol for hedge strategies (default: ^VIX)
 *   --period <period>     Data period: 1y, 2y, 5y, 10y, max (default: 5y)
 *   --mode <mode>         Validation mode: basic, walk-forward, monte-carlo, full (default: full)
 *   --capital <amount>    Initial capital (default: 100000)
 *   --output <format>     Output format: console, json, markdown, html (default: console)
 *   --output-file <path>  Save report to file
 *   --help                Show help
 * 
 * Examples:
 *   bun run scripts/validate-strategy.ts --strategy ma-crossover --symbol SPY --period 5y
 *   bun run scripts/validate-strategy.ts --strategy vix-hedge --symbol TQQQ --mode full --output markdown
 *   bun run scripts/validate-strategy.ts --strategy rsi-reversion --mode monte-carlo --output json --output-file report.json
 */

import { writeFileSync } from 'node:fs';
import type { YahooPeriod } from '@one-love-wealth/data-layer';
import {
  BacktestDataLoader,
  StrategyValidator,
  MACrossoverStrategy,
  RSIReversionStrategy,
  VIXHedgeStrategy,
  BuyAndHoldStrategy,
  generateReport,
  type Strategy,
  type BacktestData,
  type ValidationConfig,
  type ValidationOutput,
} from '../src';

// ============================================================================
// Argument Parsing
// ============================================================================

interface CLIOptions {
  strategy: string;
  symbol: string;
  vixSymbol: string;
  period: YahooPeriod;
  mode: 'basic' | 'walk-forward' | 'monte-carlo' | 'full';
  capital: number;
  output: 'console' | 'json' | 'markdown' | 'html';
  outputFile?: string;
  help: boolean;
  // Strategy-specific params
  fastPeriod: number;
  slowPeriod: number;
  rsiPeriod: number;
  oversold: number;
  overbought: number;
  vixThreshold: number;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    strategy: 'ma-crossover',
    symbol: 'TQQQ',
    vixSymbol: '^VIX',
    period: '5y',
    mode: 'full',
    capital: 100000,
    output: 'console',
    help: false,
    // Defaults for strategy params
    fastPeriod: 50,
    slowPeriod: 200,
    rsiPeriod: 14,
    oversold: 30,
    overbought: 70,
    vixThreshold: 25,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--strategy':
      case '-s':
        options.strategy = next ?? options.strategy;
        i++;
        break;
      case '--symbol':
        options.symbol = next ?? options.symbol;
        i++;
        break;
      case '--vix-symbol':
        options.vixSymbol = next ?? options.vixSymbol;
        i++;
        break;
      case '--period':
      case '-p':
        options.period = (next ?? options.period) as YahooPeriod;
        i++;
        break;
      case '--mode':
      case '-m':
        options.mode = (next ?? options.mode) as CLIOptions['mode'];
        i++;
        break;
      case '--capital':
      case '-c':
        options.capital = parseInt(next ?? '100000', 10);
        i++;
        break;
      case '--output':
      case '-o':
        options.output = (next ?? options.output) as CLIOptions['output'];
        i++;
        break;
      case '--output-file':
      case '-f':
        options.outputFile = next;
        i++;
        break;
      case '--fast-period':
        options.fastPeriod = parseInt(next ?? '50', 10);
        i++;
        break;
      case '--slow-period':
        options.slowPeriod = parseInt(next ?? '200', 10);
        i++;
        break;
      case '--rsi-period':
        options.rsiPeriod = parseInt(next ?? '14', 10);
        i++;
        break;
      case '--oversold':
        options.oversold = parseInt(next ?? '30', 10);
        i++;
        break;
      case '--overbought':
        options.overbought = parseInt(next ?? '70', 10);
        i++;
        break;
      case '--vix-threshold':
        options.vixThreshold = parseInt(next ?? '25', 10);
        i++;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        STRATEGY VALIDATION CLI                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  bun run scripts/validate-strategy.ts [options]

OPTIONS:
  --strategy, -s <name>     Strategy to validate:
                            • ma-crossover  - Moving Average Crossover
                            • rsi-reversion - RSI Mean Reversion
                            • vix-hedge     - VIX-based Hedge Strategy
                            • buy-hold      - Buy and Hold (benchmark)
                            (default: ma-crossover)

  --symbol <ticker>         Primary trading symbol (default: TQQQ)
  --vix-symbol <ticker>     VIX symbol for hedge strategies (default: ^VIX)
  --period, -p <period>     Historical data period: 1y, 2y, 5y, 10y, max
                            (default: 5y)

  --mode, -m <mode>         Validation mode:
                            • basic         - Train/test split only
                            • walk-forward  - Walk-forward analysis
                            • monte-carlo   - Monte Carlo simulation
                            • full          - All validation methods
                            (default: full)

  --capital, -c <amount>    Initial capital (default: 100000)

  --output, -o <format>     Output format:
                            • console  - Pretty-printed to terminal
                            • json     - JSON format
                            • markdown - Markdown report
                            • html     - HTML report
                            (default: console)

  --output-file, -f <path>  Save report to file

STRATEGY-SPECIFIC OPTIONS:
  --fast-period <n>         MA Crossover fast period (default: 50)
  --slow-period <n>         MA Crossover slow period (default: 200)
  --rsi-period <n>          RSI period (default: 14)
  --oversold <n>            RSI oversold threshold (default: 30)
  --overbought <n>          RSI overbought threshold (default: 70)
  --vix-threshold <n>       VIX exit threshold (default: 25)

  --help, -h                Show this help message

EXAMPLES:
  # Basic MA Crossover validation on SPY
  bun run scripts/validate-strategy.ts --strategy ma-crossover --symbol SPY

  # Full validation of VIX hedge strategy
  bun run scripts/validate-strategy.ts --strategy vix-hedge --symbol TQQQ --mode full

  # Monte Carlo analysis with custom parameters
  bun run scripts/validate-strategy.ts --strategy rsi-reversion --mode monte-carlo \\
    --rsi-period 10 --oversold 25 --overbought 75

  # Generate HTML report
  bun run scripts/validate-strategy.ts --strategy ma-crossover --output html \\
    --output-file report.html

  # Quick walk-forward analysis
  bun run scripts/validate-strategy.ts --strategy ma-crossover --mode walk-forward

`);
}

// ============================================================================
// Strategy Factory
// ============================================================================

function createStrategy(options: CLIOptions): Strategy {
  switch (options.strategy) {
    case 'ma-crossover':
      return new MACrossoverStrategy({
        symbol: options.symbol,
        fastPeriod: options.fastPeriod,
        slowPeriod: options.slowPeriod,
        positionSize: 0.95,
      });

    case 'rsi-reversion':
      return new RSIReversionStrategy({
        symbol: options.symbol,
        rsiPeriod: options.rsiPeriod,
        oversold: options.oversold,
        overbought: options.overbought,
        positionSize: 0.95,
      });

    case 'vix-hedge':
      return new VIXHedgeStrategy({
        tradingSymbol: options.symbol,
        vixSymbol: options.vixSymbol,
        vixExitThreshold: options.vixThreshold,
        vixEntryThreshold: options.vixThreshold - 5,
        positionSize: 0.95,
      });

    case 'buy-hold':
      return new BuyAndHoldStrategy({
        symbol: options.symbol,
        positionSize: 0.95,
      });

    default:
      throw new Error(`Unknown strategy: ${options.strategy}`);
  }
}

function getValidationConfig(mode: CLIOptions['mode']): ValidationConfig {
  switch (mode) {
    case 'basic':
      return {
        trainTestSplit: 0.7,
      };

    case 'walk-forward':
      return {
        trainTestSplit: 0.7,
        walkForward: {
          numWindows: 5,
          inSampleRatio: 0.7,
          optimizePerWindow: false,
        },
      };

    case 'monte-carlo':
      return {
        trainTestSplit: 0.7,
        monteCarlo: {
          numSimulations: 500,
          method: 'bootstrap-returns',
          confidenceLevel: 0.95,
        },
      };

    case 'full':
      return {
        trainTestSplit: 0.7,
        numFolds: 5,
        walkForward: {
          numWindows: 5,
          inSampleRatio: 0.7,
          optimizePerWindow: false,
        },
        monteCarlo: {
          numSimulations: 500,
          method: 'bootstrap-returns',
          confidenceLevel: 0.95,
        },
      };

    default:
      return { trainTestSplit: 0.7 };
  }
}

// ============================================================================
// Console Output Formatting
// ============================================================================

function printHeader(title: string): void {
  const width = 80;
  const padding = Math.floor((width - title.length - 2) / 2);
  console.log('\n' + '═'.repeat(width));
  console.log(' '.repeat(padding) + title);
  console.log('═'.repeat(width));
}

function printSection(title: string): void {
  console.log('\n' + '─'.repeat(60));
  console.log(`📊 ${title}`);
  console.log('─'.repeat(60));
}

function printMetric(label: string, value: string | number, width: number = 25): void {
  const labelStr = label.padEnd(width);
  console.log(`  ${labelStr}: ${value}`);
}

function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

function formatRatio(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

function printConsoleReport(output: ValidationOutput, options: CLIOptions): void {
  printHeader(`STRATEGY VALIDATION: ${output.strategyName.toUpperCase()}`);

  // Configuration
  console.log(`\n📋 Configuration:`);
  printMetric('Symbol', options.symbol);
  printMetric('Period', options.period);
  printMetric('Initial Capital', `$${options.capital.toLocaleString()}`);
  printMetric('Validation Mode', options.mode);

  // Overall Score
  printSection('OVERALL SCORE');
  const score = output.overallScore;
  
  const scoreBar = (val: number, max: number) => {
    const filled = Math.round((val / max) * 20);
    return '█'.repeat(filled) + '░'.repeat(20 - filled) + ` ${val.toFixed(1)}/${max}`;
  };

  console.log(`\n  🏆 TOTAL SCORE: ${score.overall}/100\n`);
  console.log(`  Profitability   ${scoreBar(score.components.profitability, 25)}`);
  console.log(`  Risk-Adjusted   ${scoreBar(score.components.riskAdjusted, 25)}`);
  console.log(`  Consistency     ${scoreBar(score.components.consistency, 25)}`);
  console.log(`  Robustness      ${scoreBar(score.components.robustness, 15)}`);
  console.log(`  Degradation     ${scoreBar(score.components.degradation, 10)}`);

  // Recommendation
  const recEmoji = {
    'strong-pass': '✅✅',
    'pass': '✅',
    'marginal': '⚠️',
    'fail': '❌',
  };
  const recText = {
    'strong-pass': 'STRONG PASS - Excellent performance across all metrics',
    'pass': 'PASS - Meets minimum requirements for consideration',
    'marginal': 'MARGINAL - Shows promise but needs improvement',
    'fail': 'FAIL - Does not meet minimum requirements',
  };
  console.log(`\n  ${recEmoji[score.recommendation]} ${recText[score.recommendation]}`);

  // Validation Flags
  console.log(`\n  Flags:`);
  console.log(`    ${score.flags.profitable ? '✓' : '✗'} Profitable`);
  console.log(`    ${score.flags.positiveSharpe ? '✓' : '✗'} Positive Sharpe`);
  console.log(`    ${score.flags.consistentReturns ? '✓' : '✗'} Consistent Returns`);
  console.log(`    ${score.flags.lowDegradation ? '✓' : '✗'} Low Degradation`);
  console.log(`    ${score.flags.passedMonteCarlo ? '✓' : '✗'} Monte Carlo Pass`);

  // Train/Test Results
  if (output.trainResult && output.testResult) {
    printSection('TRAIN/TEST SPLIT (70/30)');
    
    console.log('\n  │ Metric          │    Train    │    Test     │');
    console.log('  ├─────────────────┼─────────────┼─────────────┤');
    console.log(`  │ Total Return    │ ${formatPercent(output.trainResult.metrics.totalReturnPercent).padStart(11)} │ ${formatPercent(output.testResult.metrics.totalReturnPercent).padStart(11)} │`);
    console.log(`  │ Sharpe Ratio    │ ${formatRatio(output.trainResult.metrics.sharpeRatio).padStart(11)} │ ${formatRatio(output.testResult.metrics.sharpeRatio).padStart(11)} │`);
    console.log(`  │ Max Drawdown    │ ${formatPercent(output.trainResult.metrics.maxDrawdownPercent).padStart(11)} │ ${formatPercent(output.testResult.metrics.maxDrawdownPercent).padStart(11)} │`);
    console.log(`  │ Win Rate        │ ${formatPercent(output.trainResult.metrics.winRate * 100, 0).padStart(11)} │ ${formatPercent(output.testResult.metrics.winRate * 100, 0).padStart(11)} │`);
    console.log(`  │ Total Trades    │ ${String(output.trainResult.metrics.totalTrades).padStart(11)} │ ${String(output.testResult.metrics.totalTrades).padStart(11)} │`);
  }

  // Cross-Validation
  if (output.crossValidation) {
    printSection(`CROSS-VALIDATION (${output.crossValidation.numFolds}-FOLD)`);
    
    console.log(`\n  Consistency Score: ${output.crossValidation.consistencyScore.toFixed(1)}%`);
    console.log(`\n  Average Metrics:`);
    printMetric('Total Return', formatPercent(output.crossValidation.averageMetrics.totalReturnPercent));
    printMetric('Sharpe Ratio', formatRatio(output.crossValidation.averageMetrics.sharpeRatio));
    printMetric('Max Drawdown', formatPercent(output.crossValidation.averageMetrics.maxDrawdownPercent));
    
    if (output.crossValidation.stdDevMetrics.totalReturn !== undefined) {
      console.log(`\n  Standard Deviation:`);
      printMetric('Return Std Dev', formatPercent(output.crossValidation.stdDevMetrics.totalReturn * 100));
    }
  }

  // Walk-Forward Analysis
  if (output.walkForward) {
    printSection('WALK-FORWARD ANALYSIS');
    
    const wf = output.walkForward;
    console.log(`\n  Robustness Score: ${wf.aggregatedMetrics.robustnessScore}/100`);
    console.log(`  Consistency Ratio: ${(wf.aggregatedMetrics.consistencyRatio * 100).toFixed(0)}%`);
    console.log(`  Avg Degradation: ${formatPercent(wf.aggregatedMetrics.avgDegradation * 100)}`);
    
    console.log(`\n  │ Window │ In-Sample │ Out-Sample │ Degradation │`);
    console.log('  ├────────┼───────────┼────────────┼─────────────┤');
    for (const w of wf.windows) {
      const win = String(w.window.windowIndex + 1).padStart(6);
      const inS = formatPercent(w.inSampleResult.metrics.totalReturnPercent).padStart(9);
      const outS = formatPercent(w.outOfSampleResult.metrics.totalReturnPercent).padStart(10);
      const deg = formatPercent(w.degradation * 100).padStart(11);
      console.log(`  │ ${win} │ ${inS} │ ${outS} │ ${deg} │`);
    }
  }

  // Monte Carlo
  if (output.monteCarlo) {
    printSection('MONTE CARLO SIMULATION');
    
    const mc = output.monteCarlo;
    console.log(`\n  Simulations: ${mc.config.numSimulations}`);
    console.log(`  Method: ${mc.config.method}`);
    console.log(`\n  Probability of Profit: ${(mc.statistics.probabilityOfProfit * 100).toFixed(1)}%`);
    console.log(`  Value at Risk (${(mc.statistics.confidenceLevel * 100).toFixed(0)}%): ${formatPercent(mc.statistics.valueAtRisk * 100)}`);
    console.log(`  Conditional VaR: ${formatPercent(mc.statistics.conditionalVaR * 100)}`);
    
    console.log(`\n  Return Distribution:`);
    printMetric('Mean', formatPercent(mc.statistics.returnDistribution.mean * 100));
    printMetric('Median', formatPercent(mc.statistics.returnDistribution.median * 100));
    printMetric('Std Dev', formatPercent(mc.statistics.returnDistribution.stdDev * 100));
    printMetric('5th Percentile', formatPercent(mc.statistics.returnDistribution.percentile5 * 100));
    printMetric('95th Percentile', formatPercent(mc.statistics.returnDistribution.percentile95 * 100));
  }

  // Benchmark Comparisons
  if (output.benchmarkComparisons && output.benchmarkComparisons.length > 0) {
    printSection('BENCHMARK COMPARISONS');
    
    for (const bc of output.benchmarkComparisons) {
      console.log(`\n  vs ${bc.benchmark.name}:`);
      printMetric('Excess Return', formatPercent(bc.comparison.excessReturn * 100));
      printMetric('Alpha', formatPercent(bc.comparison.alpha * 100, 2));
      printMetric('Beta', formatRatio(bc.comparison.beta));
      printMetric('Information Ratio', formatRatio(bc.comparison.informationRatio));
      printMetric('Tracking Error', formatPercent(bc.comparison.trackingError * 100, 2));
    }
  }

  console.log('\n' + '═'.repeat(80) + '\n');
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log(`\n🔬 Strategy Validation CLI\n`);
  console.log(`Strategy: ${options.strategy}`);
  console.log(`Symbol: ${options.symbol}${options.strategy === 'vix-hedge' ? ` + ${options.vixSymbol}` : ''}`);
  console.log(`Period: ${options.period}`);
  console.log(`Mode: ${options.mode}`);

  // Load data
  console.log(`\n📊 Loading historical data...`);
  const loader = new BacktestDataLoader();

  try {
    const symbols = options.strategy === 'vix-hedge'
      ? [options.symbol, options.vixSymbol]
      : [options.symbol];

    const result = await loader.load({
      symbols,
      period: options.period,
      interval: '1d',
      gapFillStrategy: 'forward-fill',
      mockMode: false,
    });

    const { data, stats } = result;
    console.log(`✅ Loaded ${stats.totalBars} bars`);
    console.log(`📅 ${stats.dateRange.start.toLocaleDateString()} - ${stats.dateRange.end.toLocaleDateString()}`);

    // Create strategy
    const strategy = createStrategy(options);
    console.log(`\n⚙️  Running ${options.mode} validation...`);
    const startTime = Date.now();

    // Run validation
    const validator = new StrategyValidator(options.capital);
    const validationConfig = getValidationConfig(options.mode);
    const validationOutput = validator.validate(strategy, data, validationConfig);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Validation complete in ${duration.toFixed(1)}s`);

    // Output results
    if (options.output === 'console') {
      printConsoleReport(validationOutput, options);
    } else {
      const reportFormat = options.output === 'json' ? 'json' 
        : options.output === 'html' ? 'html' 
        : 'markdown';
      
      const report = generateReport(validationOutput, {
        title: `${strategy.name} Validation Report`,
        format: reportFormat,
        includeEquityCurve: false,
        includeTrades: reportFormat !== 'json',
      });

      if (options.outputFile) {
        writeFileSync(options.outputFile, report);
        console.log(`\n📄 Report saved to: ${options.outputFile}`);
      } else {
        console.log('\n' + report);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

/**
 * Test Report Generator
 * 
 * Generates comprehensive reports from validation results:
 * - JSON for programmatic access
 * - Markdown for documentation
 * - HTML for visual review
 */

import type { BacktestResult } from '../types';
import type {
  ValidationOutput,
  OptimizationOutput,
  WalkForwardOutput,
  MonteCarloOutput,
  BenchmarkComparison,
  ReportConfig,
} from './types';

/**
 * Report Generator
 */
export class ReportGenerator {
  /**
   * Generate report from validation output
   */
  generateValidationReport(
    output: ValidationOutput,
    config: ReportConfig
  ): string {
    switch (config.format) {
      case 'json':
        return this.toJSON(output, config);
      case 'markdown':
        return this.validationToMarkdown(output, config);
      case 'html':
        return this.validationToHTML(output, config);
      default:
        return this.toJSON(output, config);
    }
  }

  /**
   * Generate report from optimization output
   */
  generateOptimizationReport(
    output: OptimizationOutput,
    config: ReportConfig
  ): string {
    switch (config.format) {
      case 'json':
        return JSON.stringify(output, null, 2);
      case 'markdown':
        return this.optimizationToMarkdown(output, config);
      case 'html':
        return this.optimizationToHTML(output, config);
      default:
        return JSON.stringify(output, null, 2);
    }
  }

  /**
   * Generate backtest summary report
   */
  generateBacktestReport(
    result: BacktestResult,
    config: ReportConfig
  ): string {
    switch (config.format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'markdown':
        return this.backtestToMarkdown(result, config);
      case 'html':
        return this.backtestToHTML(result, config);
      default:
        return JSON.stringify(result, null, 2);
    }
  }

  /**
   * Convert to JSON with optional filtering
   */
  private toJSON(output: ValidationOutput, config: ReportConfig): string {
    const filtered = { ...output };
    
    if (!config.includeEquityCurve) {
      if (filtered.trainResult) {
        filtered.trainResult = { ...filtered.trainResult, equityCurve: [] };
      }
      if (filtered.testResult) {
        filtered.testResult = { ...filtered.testResult, equityCurve: [] };
      }
    }

    if (!config.includeTrades) {
      if (filtered.trainResult) {
        filtered.trainResult = { ...filtered.trainResult, trades: [] };
      }
      if (filtered.testResult) {
        filtered.testResult = { ...filtered.testResult, trades: [] };
      }
    }

    return JSON.stringify(filtered, null, 2);
  }

  /**
   * Validation output to Markdown
   */
  private validationToMarkdown(output: ValidationOutput, config: ReportConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.title}`);
    lines.push('');
    lines.push(`**Strategy:** ${output.strategyName}`);
    lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
    lines.push('');

    // Overall Score
    lines.push('## Overall Score');
    lines.push('');
    lines.push(`| Component | Score |`);
    lines.push(`|-----------|-------|`);
    lines.push(`| **Overall** | **${output.overallScore.overall}/100** |`);
    lines.push(`| Profitability | ${output.overallScore.components.profitability.toFixed(1)}/25 |`);
    lines.push(`| Risk-Adjusted | ${output.overallScore.components.riskAdjusted.toFixed(1)}/25 |`);
    lines.push(`| Consistency | ${output.overallScore.components.consistency.toFixed(1)}/25 |`);
    lines.push(`| Robustness | ${output.overallScore.components.robustness.toFixed(1)}/15 |`);
    lines.push(`| Degradation | ${output.overallScore.components.degradation.toFixed(1)}/10 |`);
    lines.push('');
    lines.push(`**Recommendation:** ${this.formatRecommendation(output.overallScore.recommendation)}`);
    lines.push('');

    // Validation Flags
    lines.push('### Validation Flags');
    lines.push('');
    lines.push(`- ${output.overallScore.flags.profitable ? '✅' : '❌'} Profitable`);
    lines.push(`- ${output.overallScore.flags.positiveSharpe ? '✅' : '❌'} Positive Sharpe Ratio`);
    lines.push(`- ${output.overallScore.flags.consistentReturns ? '✅' : '❌'} Consistent Returns`);
    lines.push(`- ${output.overallScore.flags.lowDegradation ? '✅' : '❌'} Low Degradation`);
    lines.push(`- ${output.overallScore.flags.passedMonteCarlo ? '✅' : '❌'} Passed Monte Carlo`);
    lines.push('');

    // Train/Test Results
    if (output.trainResult && output.testResult) {
      lines.push('## Train/Test Split Results');
      lines.push('');
      lines.push('| Metric | Train | Test |');
      lines.push('|--------|-------|------|');
      lines.push(`| Total Return | ${(output.trainResult.metrics.totalReturnPercent).toFixed(2)}% | ${(output.testResult.metrics.totalReturnPercent).toFixed(2)}% |`);
      lines.push(`| Sharpe Ratio | ${output.trainResult.metrics.sharpeRatio.toFixed(2)} | ${output.testResult.metrics.sharpeRatio.toFixed(2)} |`);
      lines.push(`| Max Drawdown | ${output.trainResult.metrics.maxDrawdownPercent.toFixed(2)}% | ${output.testResult.metrics.maxDrawdownPercent.toFixed(2)}% |`);
      lines.push(`| Win Rate | ${(output.trainResult.metrics.winRate * 100).toFixed(1)}% | ${(output.testResult.metrics.winRate * 100).toFixed(1)}% |`);
      lines.push('');
    }

    // Cross-Validation
    if (output.crossValidation) {
      lines.push('## Cross-Validation Results');
      lines.push('');
      lines.push(`**Folds:** ${output.crossValidation.numFolds}`);
      lines.push(`**Consistency Score:** ${output.crossValidation.consistencyScore.toFixed(1)}%`);
      lines.push('');
      lines.push('| Metric | Mean | Std Dev |');
      lines.push('|--------|------|---------|');
      lines.push(`| Total Return | ${(output.crossValidation.averageMetrics.totalReturnPercent).toFixed(2)}% | ${((output.crossValidation.stdDevMetrics.totalReturn ?? 0) * 100).toFixed(2)}% |`);
      lines.push(`| Sharpe Ratio | ${output.crossValidation.averageMetrics.sharpeRatio.toFixed(2)} | ${(output.crossValidation.stdDevMetrics.sharpeRatio ?? 0).toFixed(2)} |`);
      lines.push('');
    }

    // Walk-Forward
    if (output.walkForward) {
      lines.push('## Walk-Forward Analysis');
      lines.push('');
      lines.push(`**Windows:** ${output.walkForward.windows.length}`);
      lines.push(`**Robustness Score:** ${output.walkForward.aggregatedMetrics.robustnessScore}/100`);
      lines.push('');
      lines.push('| Window | In-Sample Return | Out-of-Sample Return | Degradation |');
      lines.push('|--------|------------------|---------------------|-------------|');
      for (const window of output.walkForward.windows) {
        lines.push(`| ${window.window.windowIndex + 1} | ${(window.inSampleResult.metrics.totalReturnPercent).toFixed(1)}% | ${(window.outOfSampleResult.metrics.totalReturnPercent).toFixed(1)}% | ${(window.degradation * 100).toFixed(1)}% |`);
      }
      lines.push('');
    }

    // Monte Carlo
    if (output.monteCarlo) {
      lines.push('## Monte Carlo Simulation');
      lines.push('');
      lines.push(`**Simulations:** ${output.monteCarlo.config.numSimulations}`);
      lines.push(`**Method:** ${output.monteCarlo.config.method}`);
      lines.push('');
      lines.push('| Statistic | Value |');
      lines.push('|-----------|-------|');
      lines.push(`| Probability of Profit | ${(output.monteCarlo.statistics.probabilityOfProfit * 100).toFixed(1)}% |`);
      lines.push(`| Value at Risk (${(output.monteCarlo.statistics.confidenceLevel * 100).toFixed(0)}%) | ${(output.monteCarlo.statistics.valueAtRisk * 100).toFixed(1)}% |`);
      lines.push(`| Expected Return (Mean) | ${(output.monteCarlo.statistics.returnDistribution.mean * 100).toFixed(1)}% |`);
      lines.push(`| Return Std Dev | ${(output.monteCarlo.statistics.returnDistribution.stdDev * 100).toFixed(1)}% |`);
      lines.push('');
    }

    // Benchmark Comparisons
    if (output.benchmarkComparisons && output.benchmarkComparisons.length > 0) {
      lines.push('## Benchmark Comparisons');
      lines.push('');
      for (const comparison of output.benchmarkComparisons) {
        lines.push(`### vs ${comparison.benchmark.name}`);
        lines.push('');
        lines.push(`| Metric | Strategy | Benchmark |`);
        lines.push(`|--------|----------|-----------|`);
        lines.push(`| Total Return | ${(comparison.strategyResult.metrics.totalReturnPercent).toFixed(1)}% | ${(comparison.benchmarkResult.metrics.totalReturnPercent).toFixed(1)}% |`);
        lines.push(`| Sharpe Ratio | ${comparison.strategyResult.metrics.sharpeRatio.toFixed(2)} | ${comparison.benchmarkResult.metrics.sharpeRatio.toFixed(2)} |`);
        lines.push('');
        lines.push(`- **Excess Return:** ${(comparison.comparison.excessReturn * 100).toFixed(1)}%`);
        lines.push(`- **Alpha:** ${(comparison.comparison.alpha * 100).toFixed(2)}%`);
        lines.push(`- **Beta:** ${comparison.comparison.beta.toFixed(2)}`);
        lines.push(`- **Information Ratio:** ${comparison.comparison.informationRatio.toFixed(2)}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Format recommendation text
   */
  private formatRecommendation(rec: string): string {
    switch (rec) {
      case 'strong-pass': return '✅ **STRONG PASS** - Strategy shows excellent performance across all metrics';
      case 'pass': return '✅ **PASS** - Strategy meets minimum requirements for live trading consideration';
      case 'marginal': return '⚠️ **MARGINAL** - Strategy shows some promise but needs improvement';
      case 'fail': return '❌ **FAIL** - Strategy does not meet minimum requirements';
      default: return rec;
    }
  }

  /**
   * Validation output to HTML
   */
  private validationToHTML(output: ValidationOutput, config: ReportConfig): string {
    const markdown = this.validationToMarkdown(output, config);
    return this.markdownToHTML(markdown, config.title);
  }

  /**
   * Optimization output to Markdown
   */
  private optimizationToMarkdown(output: OptimizationOutput, config: ReportConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.title}`);
    lines.push('');
    lines.push(`**Method:** ${output.method}`);
    lines.push(`**Objective:** ${output.objective}`);
    lines.push(`**Duration:** ${(output.duration / 1000).toFixed(2)}s`);
    lines.push(`**Combinations Tested:** ${output.testedCombinations} / ${output.totalCombinations}`);
    lines.push('');

    lines.push('## Best Parameters');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(output.bestResult.params, null, 2));
    lines.push('```');
    lines.push('');

    lines.push('## Top Results');
    lines.push('');
    lines.push('| Rank | Objective | Total Return | Sharpe | Max DD |');
    lines.push('|------|-----------|--------------|--------|--------|');
    for (const result of output.topResults) {
      lines.push(`| ${result.rank} | ${result.objectiveValue.toFixed(3)} | ${(result.result.metrics.totalReturnPercent).toFixed(1)}% | ${result.result.metrics.sharpeRatio.toFixed(2)} | ${result.result.metrics.maxDrawdownPercent.toFixed(1)}% |`);
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Optimization output to HTML
   */
  private optimizationToHTML(output: OptimizationOutput, config: ReportConfig): string {
    const markdown = this.optimizationToMarkdown(output, config);
    return this.markdownToHTML(markdown, config.title);
  }

  /**
   * Backtest result to Markdown
   */
  private backtestToMarkdown(result: BacktestResult, config: ReportConfig): string {
    const lines: string[] = [];

    lines.push(`# ${config.title}`);
    lines.push('');
    lines.push(`**Period:** ${result.startDate.toLocaleDateString()} - ${result.endDate.toLocaleDateString()}`);
    lines.push(`**Initial Capital:** $${result.config.initialCapital.toLocaleString()}`);
    lines.push('');

    lines.push('## Performance Summary');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total Return | ${result.metrics.totalReturnPercent.toFixed(2)}% |`);
    lines.push(`| CAGR | ${(result.metrics.cagr * 100).toFixed(2)}% |`);
    lines.push(`| Max Drawdown | ${result.metrics.maxDrawdownPercent.toFixed(2)}% |`);
    lines.push(`| Sharpe Ratio | ${result.metrics.sharpeRatio.toFixed(2)} |`);
    lines.push(`| Sortino Ratio | ${result.metrics.sortinoRatio.toFixed(2)} |`);
    lines.push(`| Calmar Ratio | ${result.metrics.calmarRatio.toFixed(2)} |`);
    lines.push(`| Win Rate | ${(result.metrics.winRate * 100).toFixed(1)}% |`);
    lines.push(`| Profit Factor | ${result.metrics.profitFactor.toFixed(2)} |`);
    lines.push(`| Total Trades | ${result.metrics.totalTrades} |`);
    lines.push('');

    if (config.includeTrades && result.trades.length > 0) {
      lines.push('## Trade Log');
      lines.push('');
      lines.push('| Date | Symbol | Side | Qty | Price | Value |');
      lines.push('|------|--------|------|-----|-------|-------|');
      for (const trade of result.trades.slice(0, 50)) {
        const date = new Date(trade.timestamp).toLocaleDateString();
        lines.push(`| ${date} | ${trade.symbol} | ${trade.side.toUpperCase()} | ${trade.quantity} | $${trade.price.toFixed(2)} | $${trade.value.toFixed(2)} |`);
      }
      if (result.trades.length > 50) {
        lines.push(`| ... | ... | ... | ... | ... | ... |`);
        lines.push(`| *${result.trades.length - 50} more trades* | | | | | |`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Backtest result to HTML
   */
  private backtestToHTML(result: BacktestResult, config: ReportConfig): string {
    const markdown = this.backtestToMarkdown(result, config);
    return this.markdownToHTML(markdown, config.title);
  }

  /**
   * Simple markdown to HTML converter
   */
  private markdownToHTML(markdown: string, title: string): string {
    let html = markdown
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Code blocks
      .replace(/```json\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      .replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      // Tables
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
        const isHeader = cells.some(c => c.includes('---'));
        if (isHeader) return '';
        const tag = 'td';
        return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      })
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/^(?!<[hltpu]|$)(.+)$/gm, '<p>$1</p>')
      // Clean up empty lines
      .replace(/<p><\/p>/g, '')
      .replace(/\n\n+/g, '\n');

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table border="1">$&</table>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; }
    h3 { color: #666; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }
}

/**
 * Convenience function to generate validation report
 */
export function generateReport(
  output: ValidationOutput,
  config: ReportConfig = { title: 'Strategy Validation Report', format: 'markdown' }
): string {
  const generator = new ReportGenerator();
  return generator.generateValidationReport(output, config);
}

/**
 * Generate backtest report
 */
export function generateBacktestReport(
  result: BacktestResult,
  config: ReportConfig = { title: 'Backtest Report', format: 'markdown' }
): string {
  const generator = new ReportGenerator();
  return generator.generateBacktestReport(result, config);
}

/**
 * Generate optimization report
 */
export function generateOptimizationReport(
  output: OptimizationOutput,
  config: ReportConfig = { title: 'Optimization Report', format: 'markdown' }
): string {
  const generator = new ReportGenerator();
  return generator.generateOptimizationReport(output, config);
}

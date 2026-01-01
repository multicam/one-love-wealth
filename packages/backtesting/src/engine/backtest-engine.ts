/**
 * Main backtesting engine
 */

import type {
  BacktestConfig,
  BacktestData,
  BacktestResult,
  EquityPoint,
  Trade,
  StrategyContext,
  MultiBar,
} from '../types';
import type { Strategy } from '../strategies/strategy';
import { Portfolio } from './portfolio';
import { TradeExecutor } from './trade-executor';
import { calculateMetrics } from '../metrics/performance';

/**
 * Default backtest configuration
 */
export const DEFAULT_BACKTEST_CONFIG: Partial<BacktestConfig> = {
  commission: 0,
  commissionPercent: 0,
  slippage: 0.001,      // 0.1% slippage
  maxPositionSize: 1,    // 100% max position
  allowShort: false,
  marginRequirement: 1.5,
};

/**
 * BacktestEngine runs strategies against historical data
 */
export class BacktestEngine {
  private readonly config: BacktestConfig;

  constructor(config: Partial<BacktestConfig> & { initialCapital: number }) {
    this.config = {
      ...DEFAULT_BACKTEST_CONFIG,
      ...config,
    } as BacktestConfig;
  }

  /**
   * Run a backtest with the given strategy and data
   */
  run(strategy: Strategy, data: BacktestData): BacktestResult {
    // Validate data
    if (data.bars.length === 0) {
      throw new Error('No data provided for backtest');
    }

    // Validate strategy symbols are in data
    for (const symbol of strategy.symbols) {
      const hasSymbol = data.symbols.includes(symbol);
      if (!hasSymbol) {
        throw new Error(`Strategy requires symbol ${symbol} but it's not in the data`);
      }
    }

    // Initialize
    const portfolio = new Portfolio(this.config);
    const executor = new TradeExecutor(this.config);
    const trades: Trade[] = [];
    const equityCurve: EquityPoint[] = [];

    // Call strategy init
    strategy.init?.();

    // Main simulation loop
    for (let i = 0; i < data.bars.length; i++) {
      const bar = data.bars[i];
      if (!bar) continue;

      // Update portfolio prices
      portfolio.updatePrices(bar.bars);

      // Build strategy context
      const ctx: StrategyContext = {
        time: bar.time,
        date: new Date(bar.time),
        bar,
        portfolio: portfolio.getState(bar.time),
        history: data.bars.slice(0, i + 1),
        barIndex: i,
        config: this.config,
      };

      // Get signals from strategy
      const signals = strategy.onBar(ctx);

      // Execute signals
      for (const signal of signals) {
        const currentBar = bar.bars[signal.symbol];
        if (!currentBar) continue;

        const trade = executor.executeSignal(signal, portfolio, currentBar);
        if (trade) {
          trade.timestamp = bar.time;
          trades.push(trade);
        }
      }

      // Record equity curve point
      const { drawdown, drawdownPercent } = portfolio.getDrawdown();
      equityCurve.push({
        time: bar.time,
        equity: portfolio.getTotalValue(),
        cash: portfolio.getCash(),
        drawdown,
        drawdownPercent,
      });
    }

    // Call strategy end
    strategy.onEnd?.();

    // Calculate performance metrics
    const metrics = calculateMetrics(equityCurve, trades, this.config);

    // Get final portfolio state
    const lastBar = data.bars[data.bars.length - 1];
    const finalTimestamp = lastBar?.time ?? Date.now();
    const finalPortfolio = portfolio.getState(finalTimestamp);

    return {
      config: this.config,
      metrics,
      equityCurve,
      trades,
      finalPortfolio,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  /**
   * Run multiple backtests with different parameters (optimization)
   */
  runOptimization<TParams>(
    strategyFactory: (params: TParams) => Strategy,
    data: BacktestData,
    parameterSets: TParams[]
  ): Array<{ params: TParams; result: BacktestResult }> {
    const results: Array<{ params: TParams; result: BacktestResult }> = [];

    for (const params of parameterSets) {
      const strategy = strategyFactory(params);
      const result = this.run(strategy, data);
      results.push({ params, result });
    }

    // Sort by Sharpe ratio descending
    results.sort((a, b) => b.result.metrics.sharpeRatio - a.result.metrics.sharpeRatio);

    return results;
  }
}

/**
 * Convenience function to run a simple backtest
 */
export function runBacktest(
  strategy: Strategy,
  data: BacktestData,
  config: Partial<BacktestConfig> & { initialCapital: number }
): BacktestResult {
  const engine = new BacktestEngine(config);
  return engine.run(strategy, data);
}

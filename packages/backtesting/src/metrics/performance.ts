/**
 * Performance metrics calculation
 */

import type { EquityPoint, Trade, PerformanceMetrics, BacktestConfig } from '../types';

/**
 * Calculate performance metrics from backtest results
 */
export function calculateMetrics(
  equityCurve: EquityPoint[],
  trades: Trade[],
  config: BacktestConfig
): PerformanceMetrics {
  const initialCapital = config.initialCapital;
  const finalEquity = equityCurve[equityCurve.length - 1]?.equity ?? initialCapital;
  
  // Calculate returns
  const totalReturn = (finalEquity - initialCapital) / initialCapital;
  const totalReturnPercent = totalReturn * 100;
  
  // Calculate time metrics
  const tradingDays = equityCurve.length;
  const yearsTraded = tradingDays / 252; // Assuming 252 trading days per year
  
  // CAGR
  const cagr = yearsTraded > 0 
    ? Math.pow(finalEquity / initialCapital, 1 / yearsTraded) - 1 
    : 0;
  
  // Drawdown metrics
  const { maxDrawdown, maxDrawdownPercent, maxDrawdownDuration } = calculateDrawdownMetrics(equityCurve);
  
  // Daily returns for volatility
  const dailyReturns = calculateDailyReturns(equityCurve);
  const volatility = calculateVolatility(dailyReturns);
  
  // Risk-adjusted returns
  const sharpeRatio = volatility !== 0 ? (cagr / volatility) : 0;
  const sortinoRatio = calculateSortinoRatio(dailyReturns, cagr);
  const calmarRatio = maxDrawdownPercent !== 0 ? Math.abs(cagr / maxDrawdownPercent) : 0;
  
  // Trade metrics
  const tradeMetrics = calculateTradeMetrics(trades);
  
  // Exposure (percent of time with positions)
  const exposurePercent = calculateExposure(equityCurve);
  
  return {
    totalReturn,
    totalReturnPercent,
    cagr,
    maxDrawdown,
    maxDrawdownPercent,
    maxDrawdownDuration,
    volatility,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    tradingDays,
    yearsTraded,
    exposurePercent,
    ...tradeMetrics,
  };
}

/**
 * Calculate drawdown metrics
 */
function calculateDrawdownMetrics(equityCurve: EquityPoint[]): {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number;
} {
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let maxDrawdownDuration = 0;
  let currentDrawdownDuration = 0;
  let peak = equityCurve[0]?.equity ?? 0;
  
  for (const point of equityCurve) {
    if (point.equity > peak) {
      peak = point.equity;
      currentDrawdownDuration = 0;
    } else {
      currentDrawdownDuration++;
      const drawdown = point.equity - peak;
      const drawdownPercent = peak !== 0 ? drawdown / peak : 0;
      
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
      
      if (currentDrawdownDuration > maxDrawdownDuration) {
        maxDrawdownDuration = currentDrawdownDuration;
      }
    }
  }
  
  return { maxDrawdown, maxDrawdownPercent, maxDrawdownDuration };
}

/**
 * Calculate daily returns from equity curve
 */
function calculateDailyReturns(equityCurve: EquityPoint[]): number[] {
  const returns: number[] = [];
  
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1];
    const curr = equityCurve[i];
    if (prev && curr && prev.equity !== 0) {
      returns.push((curr.equity - prev.equity) / prev.equity);
    }
  }
  
  return returns;
}

/**
 * Calculate annualized volatility
 */
function calculateVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const squaredDiffs = dailyReturns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (dailyReturns.length - 1);
  const dailyStdDev = Math.sqrt(variance);
  
  // Annualize (sqrt of 252 trading days)
  return dailyStdDev * Math.sqrt(252);
}

/**
 * Calculate Sortino ratio (downside deviation)
 */
function calculateSortinoRatio(dailyReturns: number[], cagr: number): number {
  const negativeReturns = dailyReturns.filter(r => r < 0);
  if (negativeReturns.length < 2) return 0;
  
  const squaredNegative = negativeReturns.map(r => r * r);
  const downsideVariance = squaredNegative.reduce((a, b) => a + b, 0) / negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  
  return downsideDeviation !== 0 ? cagr / downsideDeviation : 0;
}

/**
 * Calculate trade-level metrics
 */
function calculateTradeMetrics(trades: Trade[]): {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  averageTrade: number;
  largestWin: number;
  largestLoss: number;
} {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      averageTrade: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }
  
  // Group trades by symbol to calculate P&L per round-trip
  // For simplicity, we'll calculate based on individual trades
  // In a real system, you'd match buys with sells
  
  const tradePnLs: number[] = [];
  const tradesBySymbol = new Map<string, Trade[]>();
  
  for (const trade of trades) {
    const symbolTrades = tradesBySymbol.get(trade.symbol) ?? [];
    symbolTrades.push(trade);
    tradesBySymbol.set(trade.symbol, symbolTrades);
  }
  
  // Calculate P&L for each closed position
  for (const [symbol, symbolTrades] of tradesBySymbol) {
    let position = 0;
    let costBasis = 0;
    
    for (const trade of symbolTrades) {
      if (trade.side === 'buy') {
        const newPosition = position + trade.quantity;
        costBasis = (costBasis * position + trade.value) / newPosition;
        position = newPosition;
      } else {
        // Sell - realize P&L
        const avgCost = costBasis;
        const pnl = (trade.price - avgCost) * trade.quantity - trade.commission;
        tradePnLs.push(pnl);
        position -= trade.quantity;
        if (position <= 0) {
          costBasis = 0;
          position = 0;
        }
      }
    }
  }
  
  const winningTrades = tradePnLs.filter(pnl => pnl > 0);
  const losingTrades = tradePnLs.filter(pnl => pnl < 0);
  
  const grossProfit = winningTrades.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losingTrades.reduce((a, b) => a + b, 0));
  
  return {
    totalTrades: tradePnLs.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: tradePnLs.length > 0 ? winningTrades.length / tradePnLs.length : 0,
    profitFactor: grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    averageWin: winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? -grossLoss / losingTrades.length : 0,
    averageTrade: tradePnLs.length > 0 ? tradePnLs.reduce((a, b) => a + b, 0) / tradePnLs.length : 0,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades) : 0,
  };
}

/**
 * Calculate exposure (percent of time with positions)
 */
function calculateExposure(equityCurve: EquityPoint[]): number {
  if (equityCurve.length === 0) return 0;
  
  let exposedBars = 0;
  for (const point of equityCurve) {
    // If cash != equity, we have positions
    if (point.cash !== point.equity) {
      exposedBars++;
    }
  }
  
  return exposedBars / equityCurve.length;
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: PerformanceMetrics): Record<string, string> {
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
  const num = (n: number, decimals = 2) => n.toFixed(decimals);
  const currency = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  return {
    'Total Return': pct(metrics.totalReturn),
    'CAGR': pct(metrics.cagr),
    'Max Drawdown': pct(metrics.maxDrawdownPercent),
    'Max DD Duration': `${metrics.maxDrawdownDuration} days`,
    'Volatility': pct(metrics.volatility),
    'Sharpe Ratio': num(metrics.sharpeRatio),
    'Sortino Ratio': num(metrics.sortinoRatio),
    'Calmar Ratio': num(metrics.calmarRatio),
    'Total Trades': num(metrics.totalTrades, 0),
    'Win Rate': pct(metrics.winRate),
    'Profit Factor': num(metrics.profitFactor),
    'Average Win': currency(metrics.averageWin),
    'Average Loss': currency(metrics.averageLoss),
    'Largest Win': currency(metrics.largestWin),
    'Largest Loss': currency(metrics.largestLoss),
    'Trading Days': num(metrics.tradingDays, 0),
    'Years Traded': num(metrics.yearsTraded),
    'Exposure': pct(metrics.exposurePercent),
  };
}

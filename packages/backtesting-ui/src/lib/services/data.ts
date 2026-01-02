/**
 * Data Loading Service
 * Handles fetching historical data for backtesting
 * Supports both single and multi-symbol strategies
 * Includes smart caching for fast repeat loads
 */

import { loadBacktestData, type BacktestData } from '@one-love-wealth/backtesting';
import type { StrategyDefinition } from '../strategies/types';
import { getRequiredSymbols } from '../strategies/types';
import { calculateDateRange, type DateRange } from '../utils/date-range';
import { analyzeGaps, type GapAnalysis } from '../utils/gap-analysis';
import { getCacheManager } from '../cache/manager';
import type { CacheKey } from '../cache/types';

/**
 * Data loading configuration
 */
export interface DataLoadConfig {
  /** Symbols to load */
  symbols: string[];
  /** Date range */
  dateRange: DateRange;
  /** Data interval */
  interval?: '1d' | '1wk' | '1mo';
  /** Gap fill strategy */
  gapFillStrategy?: 'forward-fill' | 'backward-fill' | 'drop';
}

/**
 * Data loading result
 */
export interface DataLoadResult {
  /** Loaded data */
  data: BacktestData;
  /** Data statistics */
  stats: {
    totalBars: number;
    droppedBars: number;
    filledGaps: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  /** Gap analysis */
  gapAnalysis: GapAnalysis;
  /** Any warnings */
  warnings?: string[];
}

/**
 * Load backtest data for a strategy
 *
 * @param strategy - Strategy definition
 * @param params - Strategy parameters (contains symbols)
 * @param config - Data loading configuration
 * @returns Promise resolving to loaded data
 *
 * @example
 * const result = await loadStrategyData(
 *   STRATEGIES['vix-hedge'],
 *   { tradingSymbol: 'TQQQ', vixSymbol: '^VIX' },
 *   { years: 5 }
 * );
 */
export async function loadStrategyData(
  strategy: StrategyDefinition,
  params: Record<string, any>,
  config: {
    years?: number;
    startDate?: Date;
    endDate?: Date;
    interval?: '1d' | '1wk' | '1mo';
    gapFillStrategy?: 'forward-fill' | 'backward-fill' | 'drop';
  } = {}
): Promise<DataLoadResult> {
  // Extract required symbols from params
  const symbols = getRequiredSymbols(strategy, params);

  if (symbols.length === 0) {
    throw new Error('No symbols provided for strategy');
  }

  // Calculate date range
  const years = config.years ?? 5;
  const endDate = config.endDate ?? new Date();
  const dateRange = config.startDate
    ? { start: config.startDate, end: endDate }
    : calculateDateRange(years, endDate);

  // Load data
  return loadBacktestDataBySymbols({
    symbols,
    dateRange,
    interval: config.interval ?? '1d',
    gapFillStrategy: config.gapFillStrategy ?? 'forward-fill',
  });
}

/**
 * Load backtest data by symbols
 * Lower-level function for direct symbol loading
 * Checks cache first, fetches if not cached
 *
 * @param config - Data loading configuration
 * @returns Promise resolving to loaded data
 */
export async function loadBacktestDataBySymbols(
  config: DataLoadConfig
): Promise<DataLoadResult> {
  const { symbols, dateRange, interval = '1d', gapFillStrategy = 'forward-fill' } = config;

  // Build cache key
  const cacheKey: CacheKey = {
    symbols,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
    interval,
    gapFillStrategy,
  };

  // Check cache first
  const cacheManager = getCacheManager();
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    // Return cached data
    return {
      data: cached.data,
      stats: cached.stats,
      gapAnalysis: cached.gapAnalysis,
      warnings: cached.stats.droppedBars > 0 || cached.stats.filledGaps > 0
        ? buildWarnings(cached.stats, cached.gapAnalysis, gapFillStrategy)
        : undefined,
    };
  }

  // Convert date range to period string
  const period = dateRangeToPeriod(dateRange);

  try {
    // Load data using backtesting package
    const result = await loadBacktestData({
      symbols,
      period,
      interval,
      gapFillStrategy,
      requireAllSymbols: true, // Fail if any symbol is missing
    });

    // Perform gap analysis
    const timestamps = result.data.bars.map((b) => b.time);
    const expectedInterval = interval === '1wk' ? 7 * 86400000 : interval === '1mo' ? 30 * 86400000 : 86400000;

    const gapAnalysis = analyzeGaps(
      timestamps,
      expectedInterval,
      result.stats.filledGaps,
      result.stats.droppedBars
    );

    // Build warnings
    const warnings = buildWarnings(result.stats, gapAnalysis, gapFillStrategy);

    // Cache the result
    cacheManager.set(cacheKey, result.data, result.stats, gapAnalysis);

    return {
      data: result.data,
      stats: result.stats,
      gapAnalysis,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        throw new Error(
          `One or more symbols not found: ${symbols.join(', ')}. Please check symbol codes.`
        );
      }
      if (error.message.includes('no data available')) {
        throw new Error(
          `No data available for ${symbols.join(', ')} in the specified date range. Try a different date range or symbols.`
        );
      }
    }
    throw error;
  }
}

/**
 * Check data availability for symbols
 * Useful for validation before running backtest
 *
 * @param symbols - Symbols to check
 * @param dateRange - Date range to check
 * @returns Availability information per symbol
 */
export async function checkDataAvailability(
  symbols: string[],
  dateRange: DateRange
): Promise<
  Record<
    string,
    {
      available: boolean;
      earliestDate?: Date;
      latestDate?: Date;
      error?: string;
    }
  >
> {
  const results: Record<string, any> = {};

  // Check each symbol individually
  for (const symbol of symbols) {
    try {
      const result = await loadBacktestData({
        symbols: [symbol],
        period: '1d', // Just check recent data
        interval: '1d',
      });

      results[symbol] = {
        available: true,
        earliestDate: new Date(result.stats.dateRange.start),
        latestDate: new Date(result.stats.dateRange.end),
      };
    } catch (error) {
      results[symbol] = {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return results;
}

/**
 * Build warnings from stats and gap analysis
 */
function buildWarnings(
  stats: DataLoadResult['stats'],
  gapAnalysis: GapAnalysis,
  gapFillStrategy: string
): string[] {
  const warnings: string[] = [];

  // Check for data quality issues
  if (stats.droppedBars > 0) {
    warnings.push(
      `${stats.droppedBars} bars were dropped due to missing data across symbols`
    );
  }

  if (stats.filledGaps > 0) {
    warnings.push(
      `${stats.filledGaps} gaps were filled using ${gapFillStrategy} strategy`
    );
  }

  // Check for insufficient data
  const minBars = 100; // Minimum bars for meaningful backtest
  if (stats.totalBars < minBars) {
    warnings.push(
      `Only ${stats.totalBars} bars available. Consider using a longer date range (minimum ${minBars} recommended)`
    );
  }

  // Add gap analysis warnings
  if (gapAnalysis.qualityScore < 85) {
    warnings.push(
      `Data quality score: ${gapAnalysis.qualityScore.toFixed(0)}/100. Results may be less reliable.`
    );
  }

  return warnings;
}

/**
 * Clear data cache
 * Useful for forcing fresh data load
 */
export function clearDataCache(): void {
  const cacheManager = getCacheManager();
  cacheManager.clear();
}

/**
 * Get cache statistics
 * Useful for debugging and monitoring
 */
export function getCacheStats() {
  const cacheManager = getCacheManager();
  return cacheManager.getStats();
}

/**
 * Convert date range to Yahoo Finance period string
 * Used by data-layer
 */
function dateRangeToPeriod(range: DateRange): string {
  const diffMs = range.end.getTime() - range.start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.25;

  // Map to Yahoo periods
  if (diffDays <= 1) return '1d';
  if (diffDays <= 5) return '5d';
  if (diffDays <= 30) return '1mo';
  if (diffDays <= 90) return '3mo';
  if (diffDays <= 180) return '6mo';
  if (diffYears <= 1.5) return '1y';
  if (diffYears <= 2.5) return '2y';
  if (diffYears <= 5.5) return '5y';
  if (diffYears <= 10.5) return '10y';

  return 'max';
}

/**
 * Validate symbols before loading
 * Quick check using symbol search
 */
export async function validateSymbols(symbols: string[]): Promise<{
  valid: boolean;
  invalidSymbols: string[];
}> {
  // Import dynamically to avoid circular dependency
  const { validateSymbol } = await import('@one-love-wealth/data-layer');

  const invalidSymbols: string[] = [];

  for (const symbol of symbols) {
    const isValid = await validateSymbol(symbol);
    if (!isValid) {
      invalidSymbols.push(symbol);
    }
  }

  return {
    valid: invalidSymbols.length === 0,
    invalidSymbols,
  };
}

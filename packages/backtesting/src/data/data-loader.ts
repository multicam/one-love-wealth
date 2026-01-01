/**
 * BacktestDataLoader - Fetches and aligns multi-symbol historical data
 * 
 * Handles:
 * - Parallel fetching of multiple symbols from Yahoo Finance
 * - Timestamp alignment across symbols (different symbols may have different trading days)
 * - Gap filling strategies for missing data
 * - Conversion to BacktestData format
 */

import {
  YahooProvider,
  createDirectAdapter,
  MemoryAdapter,
  type YahooPeriod,
  type YahooInterval,
} from '@one-love-wealth/data-layer';
import type { DataPoint } from '@one-love-wealth/data-layer';
import type { BacktestData, MultiBar, Bar } from '../types';

/**
 * Strategy for handling missing data points
 */
export type GapFillStrategy = 
  | 'forward-fill'  // Use the last known value (most common for price data)
  | 'backward-fill' // Use the next known value
  | 'interpolate'   // Linear interpolation between known values
  | 'drop'          // Drop timestamps where any symbol has missing data
  | 'zero';         // Fill with zeros (not recommended for prices)

/**
 * Configuration for data loading
 */
export interface DataLoaderConfig {
  /** Symbols to fetch (e.g., ['TQQQ', '^VIX', 'SPY']) */
  symbols: string[];
  /** Time period to fetch */
  period: YahooPeriod;
  /** Data interval (default: '1d') */
  interval?: YahooInterval;
  /** Strategy for handling missing data (default: 'forward-fill') */
  gapFillStrategy?: GapFillStrategy;
  /** Require all symbols to have data on each timestamp (default: true) */
  requireAllSymbols?: boolean;
  /** Use mock data if API fails (default: false) */
  mockMode?: boolean;
}

/**
 * Result from loading data
 */
export interface DataLoaderResult {
  data: BacktestData;
  stats: {
    totalBars: number;
    droppedBars: number;
    filledGaps: Record<string, number>;
    dateRange: { start: Date; end: Date };
  };
}

/**
 * Raw data from a single symbol fetch
 */
interface SymbolData {
  symbol: string;
  points: DataPoint[];
}

/**
 * BacktestDataLoader - Fetches and aligns multi-symbol historical data
 */
export class BacktestDataLoader {
  private readonly provider: YahooProvider;
  private readonly defaultConfig: Partial<DataLoaderConfig> = {
    interval: '1d',
    gapFillStrategy: 'forward-fill',
    requireAllSymbols: true,
    mockMode: false,
  };

  constructor() {
    const cache = new MemoryAdapter();
    const request = createDirectAdapter();
    this.provider = new YahooProvider(cache, request);
  }

  /**
   * Load data for multiple symbols and align timestamps
   */
  async load(config: DataLoaderConfig): Promise<DataLoaderResult> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const { symbols, period, interval, gapFillStrategy, requireAllSymbols, mockMode } = mergedConfig;

    if (symbols.length === 0) {
      throw new Error('At least one symbol is required');
    }

    // Fetch all symbols in parallel
    const symbolDataList = await this.fetchAllSymbols(symbols, period, interval!, mockMode!);

    // Align timestamps and fill gaps
    const { bars, stats } = this.alignAndFillGaps(
      symbolDataList,
      gapFillStrategy!,
      requireAllSymbols!
    );

    if (bars.length === 0) {
      throw new Error('No aligned data points available after processing');
    }

    // Build BacktestData
    const firstBar = bars[0]!;
    const lastBar = bars[bars.length - 1]!;
    const data: BacktestData = {
      symbols,
      bars,
      startDate: new Date(firstBar.time),
      endDate: new Date(lastBar.time),
    };

    return {
      data,
      stats: {
        totalBars: bars.length,
        droppedBars: stats.droppedBars,
        filledGaps: stats.filledGaps,
        dateRange: {
          start: data.startDate,
          end: data.endDate,
        },
      },
    };
  }

  /**
   * Convenience method for loading a single symbol
   */
  async loadSingle(
    symbol: string,
    period: YahooPeriod,
    interval: YahooInterval = '1d'
  ): Promise<DataLoaderResult> {
    return this.load({ symbols: [symbol], period, interval });
  }

  /**
   * Fetch data for all symbols in parallel
   */
  private async fetchAllSymbols(
    symbols: string[],
    period: YahooPeriod,
    interval: YahooInterval,
    mockMode: boolean
  ): Promise<SymbolData[]> {
    const fetchPromises = symbols.map(async (symbol) => {
      const result = await this.provider.fetch({
        symbol,
        period,
        interval,
        mockMode,
      });
      return {
        symbol,
        points: result.series.data,
      };
    });

    return Promise.all(fetchPromises);
  }

  /**
   * Align timestamps across all symbols and fill gaps
   */
  private alignAndFillGaps(
    symbolDataList: SymbolData[],
    strategy: GapFillStrategy,
    requireAllSymbols: boolean
  ): { bars: MultiBar[]; stats: { droppedBars: number; filledGaps: Record<string, number> } } {
    // Build a map of timestamp -> symbol -> data point
    const timestampMap = new Map<number, Map<string, DataPoint>>();
    const allTimestamps = new Set<number>();

    for (const { symbol, points } of symbolDataList) {
      for (const point of points) {
        // Normalize timestamp to start of day for daily data
        const normalizedTime = this.normalizeTimestamp(point.time);
        allTimestamps.add(normalizedTime);

        if (!timestampMap.has(normalizedTime)) {
          timestampMap.set(normalizedTime, new Map());
        }
        timestampMap.get(normalizedTime)!.set(symbol, point);
      }
    }

    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Track stats
    let droppedBars = 0;
    const filledGaps: Record<string, number> = {};
    for (const { symbol } of symbolDataList) {
      filledGaps[symbol] = 0;
    }

    // Build aligned bars
    const bars: MultiBar[] = [];
    const lastKnownValues: Map<string, Bar> = new Map();
    const symbols = symbolDataList.map(s => s.symbol);

    for (const timestamp of sortedTimestamps) {
      const symbolMap = timestampMap.get(timestamp)!;
      const multiBar: MultiBar = { time: timestamp, bars: {} };
      let hasAllSymbols = true;
      let hasAnySymbol = false;

      for (const symbol of symbols) {
        const point = symbolMap.get(symbol);

        if (point) {
          // We have data for this symbol at this timestamp
          const bar = this.dataPointToBar(point);
          multiBar.bars[symbol] = bar;
          lastKnownValues.set(symbol, bar);
          hasAnySymbol = true;
        } else {
          // Missing data for this symbol
          hasAllSymbols = false;

          if (strategy === 'drop') {
            // Will drop this bar later
            continue;
          }

          const filledBar = this.fillGap(symbol, timestamp, strategy, lastKnownValues, sortedTimestamps, timestampMap);
          if (filledBar) {
            multiBar.bars[symbol] = filledBar;
            const gapCount = filledGaps[symbol];
            if (gapCount !== undefined) {
              filledGaps[symbol] = gapCount + 1;
            }
            hasAnySymbol = true;
          }
        }
      }

      // Decide whether to keep this bar
      if (strategy === 'drop' && !hasAllSymbols) {
        droppedBars++;
        continue;
      }

      if (requireAllSymbols && !hasAllSymbols && !hasAnySymbol) {
        droppedBars++;
        continue;
      }

      // Only add if we have at least one symbol
      if (Object.keys(multiBar.bars).length > 0) {
        bars.push(multiBar);
      } else {
        droppedBars++;
      }
    }

    return { bars, stats: { droppedBars, filledGaps } };
  }

  /**
   * Fill a gap using the specified strategy
   */
  private fillGap(
    symbol: string,
    timestamp: number,
    strategy: GapFillStrategy,
    lastKnownValues: Map<string, Bar>,
    sortedTimestamps: number[],
    timestampMap: Map<number, Map<string, DataPoint>>
  ): Bar | null {
    switch (strategy) {
      case 'forward-fill': {
        const lastBar = lastKnownValues.get(symbol);
        if (lastBar) {
          return { ...lastBar, time: timestamp };
        }
        return null;
      }

      case 'backward-fill': {
        // Find next known value
        const currentIndex = sortedTimestamps.indexOf(timestamp);
        for (let i = currentIndex + 1; i < sortedTimestamps.length; i++) {
          const futureTime = sortedTimestamps[i];
          if (futureTime === undefined) continue;
          const futureMap = timestampMap.get(futureTime);
          const futurePoint = futureMap?.get(symbol);
          if (futurePoint) {
            return { ...this.dataPointToBar(futurePoint), time: timestamp };
          }
        }
        return null;
      }

      case 'interpolate': {
        // Find prev and next known values
        const prevBar = lastKnownValues.get(symbol);
        if (!prevBar) return null;

        const currentIndex = sortedTimestamps.indexOf(timestamp);
        let nextBar: Bar | null = null;
        let nextIndex = currentIndex;

        for (let i = currentIndex + 1; i < sortedTimestamps.length; i++) {
          const futureTime = sortedTimestamps[i];
          if (futureTime === undefined) continue;
          const futureMap = timestampMap.get(futureTime);
          const futurePoint = futureMap?.get(symbol);
          if (futurePoint) {
            nextBar = this.dataPointToBar(futurePoint);
            nextIndex = i;
            break;
          }
        }

        if (!nextBar) {
          // No next value, fall back to forward-fill
          return { ...prevBar, time: timestamp };
        }

        // Find the index of the last known value
        let prevIndex = currentIndex - 1;
        while (prevIndex >= 0) {
          const prevTime = sortedTimestamps[prevIndex];
          if (prevTime === undefined) {
            prevIndex--;
            continue;
          }
          const prevMap = timestampMap.get(prevTime);
          if (prevMap?.has(symbol)) break;
          prevIndex--;
        }

        // Linear interpolation
        const totalSteps = nextIndex - prevIndex;
        const currentStep = currentIndex - prevIndex;
        const ratio = currentStep / totalSteps;

        const prevVolume = prevBar.volume;
        const nextVolume = nextBar.volume;

        return {
          time: timestamp,
          open: prevBar.open + (nextBar.open - prevBar.open) * ratio,
          high: prevBar.high + (nextBar.high - prevBar.high) * ratio,
          low: prevBar.low + (nextBar.low - prevBar.low) * ratio,
          close: prevBar.close + (nextBar.close - prevBar.close) * ratio,
          volume: prevVolume !== undefined && nextVolume !== undefined
            ? Math.round(prevVolume + (nextVolume - prevVolume) * ratio)
            : undefined,
        };
      }

      case 'zero':
        return {
          time: timestamp,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
        };

      case 'drop':
      default:
        return null;
    }
  }

  /**
   * Normalize timestamp to start of day (for daily data alignment)
   */
  private normalizeTimestamp(time: number): number {
    const date = new Date(time);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
  }

  /**
   * Convert DataPoint to Bar
   */
  private dataPointToBar(point: DataPoint): Bar {
    return {
      time: point.time,
      open: point.open ?? point.value ?? 0,
      high: point.high ?? point.value ?? 0,
      low: point.low ?? point.value ?? 0,
      close: point.close ?? point.value ?? 0,
      volume: point.volume,
    };
  }
}

/**
 * Convenience function to load backtest data
 */
export async function loadBacktestData(config: DataLoaderConfig): Promise<BacktestData> {
  const loader = new BacktestDataLoader();
  const result = await loader.load(config);
  return result.data;
}

/**
 * Convenience function to load single symbol data
 */
export async function loadSymbol(
  symbol: string,
  period: YahooPeriod,
  interval: YahooInterval = '1d'
): Promise<BacktestData> {
  const loader = new BacktestDataLoader();
  const result = await loader.loadSingle(symbol, period, interval);
  return result.data;
}

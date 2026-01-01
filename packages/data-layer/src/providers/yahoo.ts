import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * Valid period options for Yahoo Finance API
 * - Short term: '1d', '5d', '1mo', '3mo', '6mo'
 * - Medium term: '1y', '2y', '5y'
 * - Long term: '10y', 'max' (for backtesting)
 */
export type YahooPeriod = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'max';

/**
 * Valid interval options for Yahoo Finance API
 * Note: Intraday intervals (1m-1h) have limited history (~7 days for 1m, ~730 days for 1h)
 * Daily+ intervals support full history up to 'max'
 */
export type YahooInterval = '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';

export interface YahooConfig extends ProviderConfig {
  symbol: string;
  period?: YahooPeriod;
  interval?: YahooInterval;
}

interface YahooResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: number[];
          high?: number[];
          low?: number[];
          close?: number[];
          volume?: number[];
        }>;
      };
    }>;
  };
}

export class YahooProvider extends BaseProvider<YahooConfig> {
  readonly name = 'Yahoo Finance';
  readonly cachePrefix = 'YAHOO';

  protected override buildRequestConfig(config: YahooConfig): RequestConfig {
    const params: Record<string, string> = {};
    
    // Yahoo uses range (period1/period2) or period string
    if (config.period) {
      params.range = config.period;
    } else {
      params.range = '1y';
    }
    if (config.interval) params.interval = config.interval;

    // Yahoo Finance API: /chart/{symbol}?range=1y&interval=1d
    return {
      provider: 'yahoo',
      endpoint: `/${config.symbol}`,
      params,
    };
  }

  protected override getCacheKeyComponents(config: YahooConfig): CacheKeyComponents {
    return {
      provider: this.cachePrefix,
      params: {
        symbol: config.symbol,
        period: config.period || '1y',
        interval: config.interval || '1d',
      },
    };
  }

  protected override transformResponse(json: unknown, _config: YahooConfig): DataPoint[] {
    const response = json as YahooResponse;
    if (!response.chart?.result?.[0]) {
      throw new DataLayerError(
        'Invalid Yahoo Finance response format',
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    const result = response.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    return timestamps.map((ts: number, i: number) => ({
      time: ts * 1000, // Convert to milliseconds
      open: quotes.open?.[i],
      high: quotes.high?.[i],
      low: quotes.low?.[i],
      close: quotes.close?.[i],
      volume: quotes.volume?.[i],
    }));
  }

  protected override generateMockData(config: YahooConfig): DataPoint[] {
    const data: DataPoint[] = [];
    const now = Date.now();
    let price = 100;

    // Determine number of days based on period
    const periodDays: Record<YahooPeriod, number> = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
      '2y': 730,
      '5y': 1825,
      '10y': 3650,
      'max': 7300, // ~20 years for max
    };
    const days = periodDays[config.period || '1y'] || 365;

    for (let i = days; i >= 0; i--) {
      const time = now - i * 24 * 60 * 60 * 1000;
      const open = price;
      const change = (Math.random() - 0.5) * 5;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);

      data.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000),
      });

      price = close;
    }

    return data;
  }
}

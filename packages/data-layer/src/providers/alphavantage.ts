import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
import { DataLayerError, ErrorCode } from '../types/errors';

/**
 * Alpha Vantage API functions
 */
export type AlphaVantageFunction =
  | 'TIME_SERIES_INTRADAY'
  | 'TIME_SERIES_DAILY'
  | 'TIME_SERIES_DAILY_ADJUSTED'
  | 'TIME_SERIES_WEEKLY'
  | 'TIME_SERIES_WEEKLY_ADJUSTED'
  | 'TIME_SERIES_MONTHLY'
  | 'TIME_SERIES_MONTHLY_ADJUSTED'
  | 'FX_INTRADAY'
  | 'FX_DAILY'
  | 'FX_WEEKLY'
  | 'FX_MONTHLY'
  | 'DIGITAL_CURRENCY_DAILY'
  | 'DIGITAL_CURRENCY_WEEKLY'
  | 'DIGITAL_CURRENCY_MONTHLY'
  | 'REAL_GDP'
  | 'REAL_GDP_PER_CAPITA'
  | 'TREASURY_YIELD'
  | 'FEDERAL_FUNDS_RATE'
  | 'CPI'
  | 'INFLATION'
  | 'RETAIL_SALES'
  | 'DURABLES'
  | 'UNEMPLOYMENT'
  | 'NONFARM_PAYROLL';

/**
 * Time intervals for intraday data
 */
export type AlphaVantageInterval = '1min' | '5min' | '15min' | '30min' | '60min';

export interface AlphaVantageConfig extends ProviderConfig {
  /** Alpha Vantage function (e.g., 'TIME_SERIES_DAILY') */
  function: AlphaVantageFunction;
  /** Stock ticker, forex pair, or crypto symbol */
  symbol: string;
  /** Interval for intraday data */
  interval?: AlphaVantageInterval;
  /** Output size: compact (100) or full (20+ years) */
  outputsize?: 'compact' | 'full';
  /** Response format */
  datatype?: 'json' | 'csv';
  /** From currency (for forex) */
  fromCurrency?: string;
  /** To currency (for forex) */
  toCurrency?: string;
  /** Date range */
  dateRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * Common Alpha Vantage series for reference
 */
export const ALPHA_VANTAGE_SERIES = {
  AAPL: 'AAPL',
  MSFT: 'MSFT',
  GOOGL: 'GOOGL',
  AMZN: 'AMZN',
  TSLA: 'TSLA',
  SPY: 'SPY',
  QQQ: 'QQQ',
  DIA: 'DIA',
  EUR_USD: 'EUR/USD',
  GBP_USD: 'GBP/USD',
  USD_JPY: 'USD/JPY',
  BTC: 'BTC',
  ETH: 'ETH',
} as const;

const TIME_SERIES_KEYS: Record<string, string> = {
  TIME_SERIES_INTRADAY: 'Time Series',
  TIME_SERIES_DAILY: 'Time Series (Daily)',
  TIME_SERIES_DAILY_ADJUSTED: 'Time Series (Daily)',
  TIME_SERIES_WEEKLY: 'Weekly Time Series',
  TIME_SERIES_WEEKLY_ADJUSTED: 'Weekly Adjusted Time Series',
  TIME_SERIES_MONTHLY: 'Monthly Time Series',
  TIME_SERIES_MONTHLY_ADJUSTED: 'Monthly Adjusted Time Series',
  FX_INTRADAY: 'Time Series FX (Intraday)',
  FX_DAILY: 'Time Series FX (Daily)',
  FX_WEEKLY: 'Time Series FX (Weekly)',
  FX_MONTHLY: 'Time Series FX (Monthly)',
  DIGITAL_CURRENCY_DAILY: 'Time Series (Digital Currency Daily)',
  DIGITAL_CURRENCY_WEEKLY: 'Time Series (Digital Currency Weekly)',
  DIGITAL_CURRENCY_MONTHLY: 'Time Series (Digital Currency Monthly)',
  REAL_GDP: 'data',
  REAL_GDP_PER_CAPITA: 'data',
  TREASURY_YIELD: 'data',
  FEDERAL_FUNDS_RATE: 'data',
  CPI: 'data',
  INFLATION: 'data',
  RETAIL_SALES: 'data',
  DURABLES: 'data',
  UNEMPLOYMENT: 'data',
  NONFARM_PAYROLL: 'data',
};

export class AlphaVantageProvider extends BaseProvider<AlphaVantageConfig> {
  override readonly name = 'Alpha Vantage';
  override readonly cachePrefix = 'ALPHAVANTAGE';
  protected override defaultTTL = 24 * 60 * 60 * 1000; // 24 hours (due to 25 req/day limit)

  protected override buildRequestConfig(config: AlphaVantageConfig): RequestConfig {
    const params: Record<string, string> = {
      function: config.function,
      symbol: config.symbol,
    };

    if (config.interval !== undefined) params.interval = config.interval;
    if (config.outputsize !== undefined) params.outputsize = config.outputsize;
    if (config.datatype !== undefined) params.datatype = config.datatype;
    if (config.fromCurrency !== undefined) params.from_currency = config.fromCurrency;
    if (config.toCurrency !== undefined) params.to_currency = config.toCurrency;
    if (config.dateRange?.start !== undefined) params.start = config.dateRange.start;
    if (config.dateRange?.end !== undefined) params.end = config.dateRange.end;

    return {
      provider: 'alphavantage',
      endpoint: '/query',
      params,
    };
  }

  protected override getCacheKeyComponents(config: AlphaVantageConfig): CacheKeyComponents {
    const params: Record<string, string | number | boolean> = {
      function: config.function,
      symbol: config.symbol,
    };

    if (config.interval) params.interval = config.interval;
    if (config.outputsize) params.outputsize = config.outputsize;
    if (config.fromCurrency) params.fromCurrency = config.fromCurrency;
    if (config.toCurrency) params.toCurrency = config.toCurrency;

    return {
      provider: this.cachePrefix,
      endpoint: config.function,
      params,
    };
  }

  protected override transformResponse(json: unknown, config: AlphaVantageConfig): DataPoint[] {
    const response = json as Record<string, unknown>;

    if (response['Error Message']) {
      throw new DataLayerError(
        String(response['Error Message']),
        ErrorCode.INVALID_RESPONSE,
        this.name
      );
    }

    if (response['Note']) {
      throw new DataLayerError(
        'Alpha Vantage API rate limit exceeded',
        ErrorCode.RATE_LIMITED,
        this.name
      );
    }

    const timeSeriesKey = TIME_SERIES_KEYS[config.function] || 'Time Series (Daily)';
    const timeSeries = response[timeSeriesKey] as Record<string, Record<string, string>> | undefined;

    if (!timeSeries) {
      throw new DataLayerError(
        `No data found for ${config.symbol}`,
        ErrorCode.NOT_FOUND,
        this.name
      );
    }

    const points: DataPoint[] = [];

    for (const [date, values] of Object.entries(timeSeries)) {
      let value: number;

      if (config.function.startsWith('TIME_SERIES')) {
        const closeVal = values['4. close'] ?? values['5. adjusted close'] ?? '0';
        value = parseFloat(closeVal);
      } else if (config.function.startsWith('FX_')) {
        value = parseFloat(values['4. close'] ?? '0');
      } else if (config.function.startsWith('DIGITAL_CURRENCY')) {
        value = parseFloat(values['4a. close (USD)'] ?? '0');
      } else {
        value = parseFloat(values['value'] ?? '0');
      }

      if (!isNaN(value)) {
        points.push({
          time: new Date(date).getTime(),
          value,
        });
      }
    }

    return points.sort((a, b) => a.time - b.time);
  }

  protected override generateMockData(config: AlphaVantageConfig): DataPoint[] {
    const points: DataPoint[] = [];
    const today = new Date();
    const baseValue = config.function.startsWith('DIGITAL') ? 40000 : 150;
    let currentValue = baseValue;

    for (let i = 199; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const randomChange = (Math.random() - 0.48) * (baseValue * 0.02);
      currentValue = i === 199 ? baseValue : currentValue + randomChange;

      points.push({
        time: date.getTime(),
        value: Math.max(currentValue, baseValue * 0.5),
      });
    }

    return points;
  }
}

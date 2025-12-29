import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * Alpha Vantage API functions
 */
export type AlphaVantageFunction = 'TIME_SERIES_INTRADAY' | 'TIME_SERIES_DAILY' | 'TIME_SERIES_DAILY_ADJUSTED' | 'TIME_SERIES_WEEKLY' | 'TIME_SERIES_WEEKLY_ADJUSTED' | 'TIME_SERIES_MONTHLY' | 'TIME_SERIES_MONTHLY_ADJUSTED' | 'FX_INTRADAY' | 'FX_DAILY' | 'FX_WEEKLY' | 'FX_MONTHLY' | 'DIGITAL_CURRENCY_DAILY' | 'DIGITAL_CURRENCY_WEEKLY' | 'DIGITAL_CURRENCY_MONTHLY' | 'REAL_GDP' | 'REAL_GDP_PER_CAPITA' | 'TREASURY_YIELD' | 'FEDERAL_FUNDS_RATE' | 'CPI' | 'INFLATION' | 'RETAIL_SALES' | 'DURABLES' | 'UNEMPLOYMENT' | 'NONFARM_PAYROLL';
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
export declare const ALPHA_VANTAGE_SERIES: {
    readonly AAPL: "AAPL";
    readonly MSFT: "MSFT";
    readonly GOOGL: "GOOGL";
    readonly AMZN: "AMZN";
    readonly TSLA: "TSLA";
    readonly SPY: "SPY";
    readonly QQQ: "QQQ";
    readonly DIA: "DIA";
    readonly EUR_USD: "EUR/USD";
    readonly GBP_USD: "GBP/USD";
    readonly USD_JPY: "USD/JPY";
    readonly BTC: "BTC";
    readonly ETH: "ETH";
};
export declare class AlphaVantageProvider extends BaseProvider<AlphaVantageConfig> {
    readonly name = "Alpha Vantage";
    readonly cachePrefix = "ALPHAVANTAGE";
    protected defaultTTL: number;
    protected buildRequestConfig(config: AlphaVantageConfig): RequestConfig;
    protected getCacheKeyComponents(config: AlphaVantageConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: AlphaVantageConfig): DataPoint[];
    protected generateMockData(config: AlphaVantageConfig): DataPoint[];
}
//# sourceMappingURL=alphavantage.d.ts.map
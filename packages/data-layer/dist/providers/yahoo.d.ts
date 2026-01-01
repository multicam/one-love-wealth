import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
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
export declare class YahooProvider extends BaseProvider<YahooConfig> {
    readonly name = "Yahoo Finance";
    readonly cachePrefix = "YAHOO";
    protected buildRequestConfig(config: YahooConfig): RequestConfig;
    protected getCacheKeyComponents(config: YahooConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, _config: YahooConfig): DataPoint[];
    protected generateMockData(config: YahooConfig): DataPoint[];
}
//# sourceMappingURL=yahoo.d.ts.map
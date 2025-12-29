import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
export interface YahooConfig extends ProviderConfig {
    symbol: string;
    period?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max';
    interval?: '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo';
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
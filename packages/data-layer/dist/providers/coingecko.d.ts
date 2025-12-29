import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
export type CoinGeckoEndpoint = 'market_chart' | 'ohlc' | 'simple_price';
export interface CoinGeckoConfig extends ProviderConfig {
    coinId: string;
    vsCurrency?: string;
    endpoint?: CoinGeckoEndpoint;
    days?: number | 'max';
    interval?: 'daily' | 'hourly';
    precision?: number;
    includeMarketCap?: boolean;
    include24hrVol?: boolean;
    include24hrChange?: boolean;
}
export declare class CoinGeckoProvider extends BaseProvider<CoinGeckoConfig> {
    readonly name = "CoinGecko";
    readonly cachePrefix = "COINGECKO";
    protected buildRequestConfig(config: CoinGeckoConfig): RequestConfig;
    protected getCacheKeyComponents(config: CoinGeckoConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: CoinGeckoConfig): DataPoint[];
    private transformMarketChartResponse;
    private transformOHLCResponse;
    private transformSimplePriceResponse;
    protected generateMockData(config: CoinGeckoConfig): DataPoint[];
}
//# sourceMappingURL=coingecko.d.ts.map
import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * Types of data available from Hyperliquid
 */
export type HyperliquidDataType = 'candles' | 'fundingHistory' | 'openInterest';
/**
 * Candlestick intervals
 */
export type HyperliquidInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '12h' | '1d' | '1w';
export interface HyperliquidConfig extends ProviderConfig {
    /** Coin symbol (e.g., 'BTC', 'ETH', 'SOL') */
    coin: string;
    /** Type of data to fetch */
    dataType: HyperliquidDataType;
    /** Candlestick interval (required for 'candles') */
    interval?: HyperliquidInterval;
    /** Date range */
    dateRange?: {
        startTime?: number;
        endTime?: number;
    };
}
/**
 * Common crypto coins on Hyperliquid
 */
export declare const HYPERLIQUID_COINS: {
    readonly BTC: "BTC";
    readonly ETH: "ETH";
    readonly SOL: "SOL";
    readonly DOGE: "DOGE";
    readonly ARB: "ARB";
    readonly AVAX: "AVAX";
    readonly MATIC: "MATIC";
    readonly OP: "OP";
};
export declare class HyperliquidProvider extends BaseProvider<HyperliquidConfig> {
    readonly name = "Hyperliquid";
    readonly cachePrefix = "HYPERLIQUID";
    protected defaultTTL: number;
    protected buildRequestConfig(config: HyperliquidConfig): RequestConfig;
    protected getCacheKeyComponents(config: HyperliquidConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: HyperliquidConfig): DataPoint[];
    protected generateMockData(config: HyperliquidConfig): DataPoint[];
}
//# sourceMappingURL=hyperliquid.d.ts.map
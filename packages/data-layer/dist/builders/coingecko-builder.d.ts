import type { CoinGeckoConfig, CoinGeckoEndpoint } from '../providers/coingecko';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for CoinGecko configuration
 */
export declare class CoinGeckoBuilder {
    private config;
    coin(coinId: string): this;
    vsCurrency(currency: string): this;
    endpoint(endpoint: CoinGeckoEndpoint): this;
    marketChart(): this;
    ohlc(): this;
    simplePrice(): this;
    days(days: number | 'max'): this;
    interval(interval: 'daily' | 'hourly'): this;
    precision(precision: number): this;
    includeMarketCap(include?: boolean): this;
    include24hrVol(include?: boolean): this;
    include24hrChange(include?: boolean): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): CoinGeckoConfig;
}
/**
 * Convenience factory function for creating CoinGecko configurations
 */
export declare function coingecko(coinId: string): CoinGeckoBuilder;
//# sourceMappingURL=coingecko-builder.d.ts.map
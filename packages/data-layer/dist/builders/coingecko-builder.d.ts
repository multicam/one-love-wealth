import type { CoinGeckoConfig, CoinGeckoEndpoint } from '../providers/coingecko';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for CoinGecko configuration
 */
export declare class CoinGeckoBuilder extends BaseBuilder<CoinGeckoConfig> {
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
    build(): CoinGeckoConfig;
}
/**
 * Convenience factory function for creating CoinGecko configurations
 */
export declare function coingecko(coinId: string): CoinGeckoBuilder;
//# sourceMappingURL=coingecko-builder.d.ts.map
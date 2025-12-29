import type { AlphaVantageConfig, AlphaVantageFunction, AlphaVantageInterval } from '../providers/alphavantage';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for Alpha Vantage configuration
 */
export declare class AlphaVantageBuilder {
    private config;
    function(func: AlphaVantageFunction): this;
    symbol(symbol: string): this;
    daily(): this;
    dailyAdjusted(): this;
    weekly(): this;
    monthly(): this;
    intraday(): this;
    fxDaily(): this;
    cryptoDaily(): this;
    interval(interval: AlphaVantageInterval): this;
    outputsize(size: 'compact' | 'full'): this;
    compact(): this;
    full(): this;
    datatype(type: 'json' | 'csv'): this;
    fromCurrency(currency: string): this;
    toCurrency(currency: string): this;
    forex(from: string, to: string): this;
    dateRange(start: string, end: string): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): AlphaVantageConfig;
}
/**
 * Convenience factory function for creating Alpha Vantage configurations
 */
export declare function alphavantage(symbol: string): AlphaVantageBuilder;
//# sourceMappingURL=alphavantage-builder.d.ts.map
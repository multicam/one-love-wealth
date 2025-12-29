import type { YahooConfig } from '../providers/yahoo';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for Yahoo Finance configuration
 */
export declare class YahooBuilder {
    private config;
    symbol(symbol: string): this;
    period(period: YahooConfig['period']): this;
    interval(interval: YahooConfig['interval']): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): YahooConfig;
}
/**
 * Convenience factory function for creating Yahoo configurations
 */
export declare function yahoo(symbol: string): YahooBuilder;
//# sourceMappingURL=yahoo-builder.d.ts.map
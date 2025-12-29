import type { IMFConfig, IMFFrequency } from '../providers/imf';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for IMF configuration
 */
export declare class IMFBuilder {
    private config;
    databaseId(id: string): this;
    indicator(indicator: string): this;
    frequency(frequency: IMFFrequency): this;
    annualFrequency(): this;
    quarterlyFrequency(): this;
    monthlyFrequency(): this;
    countryCode(code: string): this;
    usa(): this;
    china(): this;
    japan(): this;
    germany(): this;
    uk(): this;
    euroArea(): this;
    world(): this;
    startPeriod(period: string): this;
    endPeriod(period: string): this;
    periodRange(start: string, end: string): this;
    ifs(): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): IMFConfig;
}
/**
 * Convenience factory function for creating IMF configurations
 */
export declare function imf(databaseId: string, indicator: string): IMFBuilder;
//# sourceMappingURL=imf-builder.d.ts.map
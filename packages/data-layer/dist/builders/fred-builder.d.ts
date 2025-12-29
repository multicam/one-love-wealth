import type { FREDConfig, FREDUnits, FREDFrequency } from '../providers/fred';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for FRED configuration
 */
export declare class FREDBuilder {
    private config;
    seriesId(seriesId: string): this;
    units(units: FREDUnits): this;
    yoyChange(): this;
    percentChange(): this;
    naturalLog(): this;
    frequency(frequency: FREDFrequency): this;
    daily(): this;
    weekly(): this;
    monthly(): this;
    quarterly(): this;
    annual(): this;
    aggregationMethod(method: 'avg' | 'sum' | 'eop'): this;
    startDate(date: string): this;
    endDate(date: string): this;
    dateRange(start: string, end: string): this;
    limit(count: number): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): FREDConfig;
}
/**
 * Convenience factory function for creating FRED configurations
 */
export declare function fred(seriesId: string): FREDBuilder;
//# sourceMappingURL=fred-builder.d.ts.map
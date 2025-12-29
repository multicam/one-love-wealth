import type { BLSConfig } from '../providers/bls';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for BLS configuration
 */
export declare class BLSBuilder {
    private config;
    seriesId(seriesId: string): this;
    dateRange(startYear: number, endYear: number): this;
    startYear(year: number): this;
    endYear(year: number): this;
    lastYears(count: number): this;
    calculations(enabled?: boolean): this;
    annualAverage(enabled?: boolean): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): BLSConfig;
}
/**
 * Convenience factory function for creating BLS configurations
 */
export declare function bls(seriesId: string): BLSBuilder;
//# sourceMappingURL=bls-builder.d.ts.map
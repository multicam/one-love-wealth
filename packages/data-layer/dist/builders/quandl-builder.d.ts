import type { QuandlConfig, QuandlCollapse, QuandlTransform } from '../providers/quandl';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for Quandl configuration
 */
export declare class QuandlBuilder {
    private config;
    databaseCode(code: string): this;
    datasetCode(code: string): this;
    database(databaseCode: string, datasetCode: string): this;
    column(index: number): this;
    startDate(date: string): this;
    endDate(date: string): this;
    dateRange(start: string, end: string): this;
    collapse(collapse: QuandlCollapse): this;
    daily(): this;
    weekly(): this;
    monthly(): this;
    quarterly(): this;
    annual(): this;
    transform(transform: QuandlTransform): this;
    diff(): this;
    percentChange(): this;
    cumulative(): this;
    normalize(): this;
    rows(count: number): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): QuandlConfig;
}
/**
 * Convenience factory function for creating Quandl configurations
 */
export declare function quandl(databaseCode: string, datasetCode: string): QuandlBuilder;
//# sourceMappingURL=quandl-builder.d.ts.map
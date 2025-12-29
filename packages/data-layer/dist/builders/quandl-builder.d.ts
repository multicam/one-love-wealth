import type { QuandlConfig, QuandlCollapse, QuandlTransform } from '../providers/quandl';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Quandl configuration
 */
export declare class QuandlBuilder extends BaseBuilder<QuandlConfig> {
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
    build(): QuandlConfig;
}
/**
 * Convenience factory function for creating Quandl configurations
 */
export declare function quandl(databaseCode: string, datasetCode: string): QuandlBuilder;
//# sourceMappingURL=quandl-builder.d.ts.map
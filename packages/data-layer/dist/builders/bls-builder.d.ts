import type { BLSConfig } from '../providers/bls';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for BLS configuration
 */
export declare class BLSBuilder extends BaseBuilder<BLSConfig> {
    seriesId(seriesId: string): this;
    dateRange(startYear: number, endYear: number): this;
    startYear(year: number): this;
    endYear(year: number): this;
    lastYears(count: number): this;
    calculations(enabled?: boolean): this;
    annualAverage(enabled?: boolean): this;
    build(): BLSConfig;
}
/**
 * Convenience factory function for creating BLS configurations
 */
export declare function bls(seriesId: string): BLSBuilder;
//# sourceMappingURL=bls-builder.d.ts.map
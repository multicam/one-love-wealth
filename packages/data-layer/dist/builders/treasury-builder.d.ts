import type { TreasuryConfig, TreasuryDataset } from '../providers/treasury';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for Treasury configuration
 */
export declare class TreasuryBuilder {
    private config;
    dataset(dataset: TreasuryDataset): this;
    debtToPenny(): this;
    historicalDebt(): this;
    avgInterestRates(): this;
    interestExpense(): this;
    dateRange(start: string, end: string): this;
    startDate(date: string): this;
    endDate(date: string): this;
    fields(fields: string[]): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): TreasuryConfig;
}
/**
 * Convenience factory function for creating Treasury configurations
 */
export declare function treasury(dataset: TreasuryDataset): TreasuryBuilder;
//# sourceMappingURL=treasury-builder.d.ts.map
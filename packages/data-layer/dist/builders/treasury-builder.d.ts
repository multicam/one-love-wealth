import type { TreasuryConfig, TreasuryDataset } from '../providers/treasury';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Treasury configuration
 */
export declare class TreasuryBuilder extends BaseBuilder<TreasuryConfig> {
    dataset(dataset: TreasuryDataset): this;
    debtToPenny(): this;
    historicalDebt(): this;
    avgInterestRates(): this;
    interestExpense(): this;
    dateRange(start: string, end: string): this;
    startDate(date: string): this;
    endDate(date: string): this;
    fields(fields: string[]): this;
    build(): TreasuryConfig;
}
/**
 * Convenience factory function for creating Treasury configurations
 */
export declare function treasury(dataset: TreasuryDataset): TreasuryBuilder;
//# sourceMappingURL=treasury-builder.d.ts.map
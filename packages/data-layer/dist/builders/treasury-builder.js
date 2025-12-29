import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Treasury configuration
 */
export class TreasuryBuilder extends BaseBuilder {
    dataset(dataset) {
        this.config.dataset = dataset;
        return this;
    }
    // Convenience methods for common datasets
    debtToPenny() {
        return this.dataset('debt_to_penny');
    }
    historicalDebt() {
        return this.dataset('historical_debt');
    }
    avgInterestRates() {
        return this.dataset('avg_interest_rates');
    }
    interestExpense() {
        return this.dataset('interest_expense');
    }
    dateRange(start, end) {
        this.config.dateRange = { start, end };
        return this;
    }
    startDate(date) {
        this.config.dateRange = { ...this.config.dateRange, start: date };
        return this;
    }
    endDate(date) {
        this.config.dateRange = { ...this.config.dateRange, end: date };
        return this;
    }
    fields(fields) {
        this.config.fields = fields;
        return this;
    }
    build() {
        if (!this.config.dataset) {
            throw new Error('Treasury dataset is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating Treasury configurations
 */
export function treasury(dataset) {
    return new TreasuryBuilder().dataset(dataset);
}

import type { TreasuryConfig, TreasuryDataset } from '../providers/treasury';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for Treasury configuration
 */
export class TreasuryBuilder {
  private config: Partial<TreasuryConfig> = {};

  dataset(dataset: TreasuryDataset): this {
    this.config.dataset = dataset;
    return this;
  }

  // Convenience methods for common datasets
  debtToPenny(): this {
    return this.dataset('debt_to_penny');
  }

  historicalDebt(): this {
    return this.dataset('historical_debt');
  }

  avgInterestRates(): this {
    return this.dataset('avg_interest_rates');
  }

  interestExpense(): this {
    return this.dataset('interest_expense');
  }

  dateRange(start: string, end: string): this {
    this.config.dateRange = { start, end };
    return this;
  }

  startDate(date: string): this {
    this.config.dateRange = { ...this.config.dateRange, start: date };
    return this;
  }

  endDate(date: string): this {
    this.config.dateRange = { ...this.config.dateRange, end: date };
    return this;
  }

  fields(fields: string[]): this {
    this.config.fields = fields;
    return this;
  }

  cache(cache: CacheConfig): this {
    this.config.cache = cache;
    return this;
  }

  mockMode(enabled = true): this {
    this.config.mockMode = enabled;
    return this;
  }

  errorRecovery(config: ErrorRecoveryConfig): this {
    this.config.errorRecovery = config;
    return this;
  }

  build(): TreasuryConfig {
    if (!this.config.dataset) {
      throw new Error('Treasury dataset is required');
    }
    return this.config as TreasuryConfig;
  }
}

/**
 * Convenience factory function for creating Treasury configurations
 */
export function treasury(dataset: TreasuryDataset): TreasuryBuilder {
  return new TreasuryBuilder().dataset(dataset);
}

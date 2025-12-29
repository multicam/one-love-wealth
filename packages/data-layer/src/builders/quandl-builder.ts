import type { QuandlConfig, QuandlCollapse, QuandlTransform } from '../providers/quandl';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for Quandl configuration
 */
export class QuandlBuilder {
  private config: Partial<QuandlConfig> = {};

  databaseCode(code: string): this {
    this.config.databaseCode = code;
    return this;
  }

  datasetCode(code: string): this {
    this.config.datasetCode = code;
    return this;
  }

  database(databaseCode: string, datasetCode: string): this {
    this.config.databaseCode = databaseCode;
    this.config.datasetCode = datasetCode;
    return this;
  }

  column(index: number): this {
    this.config.column = index;
    return this;
  }

  startDate(date: string): this {
    this.config.startDate = date;
    return this;
  }

  endDate(date: string): this {
    this.config.endDate = date;
    return this;
  }

  dateRange(start: string, end: string): this {
    this.config.startDate = start;
    this.config.endDate = end;
    return this;
  }

  collapse(collapse: QuandlCollapse): this {
    this.config.collapse = collapse;
    return this;
  }

  // Convenience methods for common collapse values
  daily(): this {
    return this.collapse('daily');
  }

  weekly(): this {
    return this.collapse('weekly');
  }

  monthly(): this {
    return this.collapse('monthly');
  }

  quarterly(): this {
    return this.collapse('quarterly');
  }

  annual(): this {
    return this.collapse('annual');
  }

  transform(transform: QuandlTransform): this {
    this.config.transform = transform;
    return this;
  }

  // Convenience methods for common transforms
  diff(): this {
    return this.transform('diff');
  }

  percentChange(): this {
    return this.transform('rdiff');
  }

  cumulative(): this {
    return this.transform('cumul');
  }

  normalize(): this {
    return this.transform('normalize');
  }

  rows(count: number): this {
    this.config.rows = count;
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

  build(): QuandlConfig {
    if (!this.config.databaseCode) {
      throw new Error('Quandl databaseCode is required');
    }
    if (!this.config.datasetCode) {
      throw new Error('Quandl datasetCode is required');
    }
    return this.config as QuandlConfig;
  }
}

/**
 * Convenience factory function for creating Quandl configurations
 */
export function quandl(databaseCode: string, datasetCode: string): QuandlBuilder {
  return new QuandlBuilder().database(databaseCode, datasetCode);
}

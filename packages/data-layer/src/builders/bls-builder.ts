import type { BLSConfig } from '../providers/bls';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for BLS configuration
 */
export class BLSBuilder extends BaseBuilder<BLSConfig> {

  seriesId(seriesId: string): this {
    this.config.seriesId = seriesId;
    return this;
  }

  dateRange(startYear: number, endYear: number): this {
    this.config.dateRange = { startYear, endYear };
    return this;
  }

  startYear(year: number): this {
    this.config.dateRange = {
      ...this.config.dateRange,
      startYear: year,
      endYear: this.config.dateRange?.endYear ?? new Date().getFullYear(),
    };
    return this;
  }

  endYear(year: number): this {
    this.config.dateRange = {
      ...this.config.dateRange,
      startYear: this.config.dateRange?.startYear ?? new Date().getFullYear() - 5,
      endYear: year,
    };
    return this;
  }

  lastYears(count: number): this {
    const endYear = new Date().getFullYear();
    const startYear = endYear - count;
    return this.dateRange(startYear, endYear);
  }

  calculations(enabled = true): this {
    this.config.calculations = enabled;
    return this;
  }

  annualAverage(enabled = true): this {
    this.config.annualAverage = enabled;
    return this;
  }

  override build(): BLSConfig {
    if (!this.config.seriesId) {
      throw new Error('BLS seriesId is required');
    }
    return this.config as BLSConfig;
  }
}

/**
 * Convenience factory function for creating BLS configurations
 */
export function bls(seriesId: string): BLSBuilder {
  return new BLSBuilder().seriesId(seriesId);
}

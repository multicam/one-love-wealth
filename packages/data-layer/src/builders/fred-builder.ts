import type { FREDConfig, FREDUnits, FREDFrequency } from '../providers/fred';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for FRED configuration
 */
export class FREDBuilder {
  private config: Partial<FREDConfig> = {};

  seriesId(seriesId: string): this {
    this.config.seriesId = seriesId;
    return this;
  }

  units(units: FREDUnits): this {
    this.config.units = units;
    return this;
  }

  // Convenience methods for common units
  yoyChange(): this {
    return this.units('pc1');
  }

  percentChange(): this {
    return this.units('pch');
  }

  naturalLog(): this {
    return this.units('log');
  }

  frequency(frequency: FREDFrequency): this {
    this.config.frequency = frequency;
    return this;
  }

  // Convenience methods for common frequencies
  daily(): this {
    return this.frequency('d');
  }

  weekly(): this {
    return this.frequency('w');
  }

  monthly(): this {
    return this.frequency('m');
  }

  quarterly(): this {
    return this.frequency('q');
  }

  annual(): this {
    return this.frequency('a');
  }

  aggregationMethod(method: 'avg' | 'sum' | 'eop'): this {
    this.config.aggregationMethod = method;
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

  limit(count: number): this {
    this.config.limit = count;
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

  build(): FREDConfig {
    if (!this.config.seriesId) {
      throw new Error('FRED seriesId is required');
    }
    return this.config as FREDConfig;
  }
}

/**
 * Convenience factory function for creating FRED configurations
 */
export function fred(seriesId: string): FREDBuilder {
  return new FREDBuilder().seriesId(seriesId);
}

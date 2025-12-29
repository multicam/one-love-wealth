import type { WorldBankConfig } from '../providers/worldbank';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for World Bank configuration
 */
export class WorldBankBuilder {
  private config: Partial<WorldBankConfig> = {};

  indicatorCode(code: string): this {
    this.config.indicatorCode = code;
    return this;
  }

  countryCode(code: string): this {
    this.config.countryCode = code;
    return this;
  }

  // Convenience methods for common countries
  usa(): this {
    return this.countryCode('USA');
  }

  china(): this {
    return this.countryCode('CHN');
  }

  world(): this {
    return this.countryCode('WLD');
  }

  euroArea(): this {
    return this.countryCode('EMU');
  }

  dateRange(start: number, end: number): this {
    this.config.dateRange = { start, end };
    return this;
  }

  startYear(year: number): this {
    this.config.dateRange = { ...this.config.dateRange, start: year };
    return this;
  }

  endYear(year: number): this {
    this.config.dateRange = { ...this.config.dateRange, end: year };
    return this;
  }

  mostRecentValues(count: number): this {
    this.config.mrv = count;
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

  build(): WorldBankConfig {
    if (!this.config.indicatorCode) {
      throw new Error('World Bank indicatorCode is required');
    }
    return this.config as WorldBankConfig;
  }
}

/**
 * Convenience factory function for creating World Bank configurations
 */
export function worldbank(indicatorCode: string): WorldBankBuilder {
  return new WorldBankBuilder().indicatorCode(indicatorCode);
}

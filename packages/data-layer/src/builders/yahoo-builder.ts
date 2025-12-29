import type { YahooConfig } from '../providers/yahoo';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for Yahoo Finance configuration
 */
export class YahooBuilder {
  private config: Partial<YahooConfig> = {};

  symbol(symbol: string): this {
    this.config.symbol = symbol;
    return this;
  }

  period(period: YahooConfig['period']): this {
    this.config.period = period;
    return this;
  }

  interval(interval: YahooConfig['interval']): this {
    this.config.interval = interval;
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

  build(): YahooConfig {
    if (!this.config.symbol) {
      throw new Error('Yahoo symbol is required');
    }
    return this.config as YahooConfig;
  }
}

/**
 * Convenience factory function for creating Yahoo configurations
 */
export function yahoo(symbol: string): YahooBuilder {
  return new YahooBuilder().symbol(symbol);
}

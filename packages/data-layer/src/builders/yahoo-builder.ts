import type { YahooConfig, YahooPeriod, YahooInterval } from '../providers/yahoo';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for Yahoo Finance configuration
 */
export class YahooBuilder extends BaseBuilder<YahooConfig> {
  symbol(symbol: string): this {
    this.config.symbol = symbol;
    return this;
  }

  period(period: YahooPeriod): this {
    this.config.period = period;
    return this;
  }

  interval(interval: YahooInterval): this {
    this.config.interval = interval;
    return this;
  }

  /**
   * Convenience method for 10-year daily data (for backtesting)
   */
  tenYearDaily(): this {
    this.config.period = '10y';
    this.config.interval = '1d';
    return this;
  }

  /**
   * Convenience method for maximum available history (for backtesting)
   */
  maxHistory(): this {
    this.config.period = 'max';
    this.config.interval = '1d';
    return this;
  }

  override build(): YahooConfig {
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

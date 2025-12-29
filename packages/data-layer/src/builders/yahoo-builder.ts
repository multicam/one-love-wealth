import type { YahooConfig } from '../providers/yahoo';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for Yahoo Finance configuration
 */
export class YahooBuilder extends BaseBuilder<YahooConfig> {
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

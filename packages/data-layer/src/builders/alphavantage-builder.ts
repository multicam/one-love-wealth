import type {
  AlphaVantageConfig,
  AlphaVantageFunction,
  AlphaVantageInterval,
} from '../providers/alphavantage';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for Alpha Vantage configuration
 */
export class AlphaVantageBuilder extends BaseBuilder<AlphaVantageConfig> {

  function(func: AlphaVantageFunction): this {
    this.config.function = func;
    return this;
  }

  symbol(symbol: string): this {
    this.config.symbol = symbol;
    return this;
  }

  // Convenience methods for common functions
  daily(): this {
    return this.function('TIME_SERIES_DAILY');
  }

  dailyAdjusted(): this {
    return this.function('TIME_SERIES_DAILY_ADJUSTED');
  }

  weekly(): this {
    return this.function('TIME_SERIES_WEEKLY');
  }

  monthly(): this {
    return this.function('TIME_SERIES_MONTHLY');
  }

  intraday(): this {
    return this.function('TIME_SERIES_INTRADAY');
  }

  fxDaily(): this {
    return this.function('FX_DAILY');
  }

  cryptoDaily(): this {
    return this.function('DIGITAL_CURRENCY_DAILY');
  }

  interval(interval: AlphaVantageInterval): this {
    this.config.interval = interval;
    return this;
  }

  outputsize(size: 'compact' | 'full'): this {
    this.config.outputsize = size;
    return this;
  }

  compact(): this {
    return this.outputsize('compact');
  }

  full(): this {
    return this.outputsize('full');
  }

  datatype(type: 'json' | 'csv'): this {
    this.config.datatype = type;
    return this;
  }

  fromCurrency(currency: string): this {
    this.config.fromCurrency = currency;
    return this;
  }

  toCurrency(currency: string): this {
    this.config.toCurrency = currency;
    return this;
  }

  forex(from: string, to: string): this {
    this.config.fromCurrency = from;
    this.config.toCurrency = to;
    return this;
  }

  dateRange(start: string, end: string): this {
    this.config.dateRange = { start, end };
    return this;
  }

  override build(): AlphaVantageConfig {
    if (!this.config.function) {
      throw new Error('Alpha Vantage function is required');
    }
    if (!this.config.symbol) {
      throw new Error('Alpha Vantage symbol is required');
    }
    return this.config as AlphaVantageConfig;
  }
}

/**
 * Convenience factory function for creating Alpha Vantage configurations
 */
export function alphavantage(symbol: string): AlphaVantageBuilder {
  return new AlphaVantageBuilder().symbol(symbol);
}

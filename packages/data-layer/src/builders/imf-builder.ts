import type { IMFConfig, IMFFrequency } from '../providers/imf';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for IMF configuration
 */
export class IMFBuilder extends BaseBuilder<IMFConfig> {

  databaseId(id: string): this {
    this.config.databaseId = id;
    return this;
  }

  indicator(indicator: string): this {
    this.config.indicator = indicator;
    return this;
  }

  frequency(frequency: IMFFrequency): this {
    this.config.frequency = frequency;
    return this;
  }

  // Convenience methods for frequencies
  annualFrequency(): this {
    return this.frequency('A');
  }

  quarterlyFrequency(): this {
    return this.frequency('Q');
  }

  monthlyFrequency(): this {
    return this.frequency('M');
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

  japan(): this {
    return this.countryCode('JPN');
  }

  germany(): this {
    return this.countryCode('DEU');
  }

  uk(): this {
    return this.countryCode('GBR');
  }

  euroArea(): this {
    return this.countryCode('U2');
  }

  world(): this {
    return this.countryCode('W00');
  }

  startPeriod(period: string): this {
    this.config.startPeriod = period;
    return this;
  }

  endPeriod(period: string): this {
    this.config.endPeriod = period;
    return this;
  }

  periodRange(start: string, end: string): this {
    this.config.startPeriod = start;
    this.config.endPeriod = end;
    return this;
  }

  // Convenience for IFS database
  ifs(): this {
    return this.databaseId('IFS');
  }

  override build(): IMFConfig {
    if (!this.config.databaseId) {
      throw new Error('IMF databaseId is required');
    }
    if (!this.config.indicator) {
      throw new Error('IMF indicator is required');
    }
    if (!this.config.frequency) {
      throw new Error('IMF frequency is required');
    }
    if (!this.config.countryCode) {
      throw new Error('IMF countryCode is required');
    }
    return this.config as IMFConfig;
  }
}

/**
 * Convenience factory function for creating IMF configurations
 */
export function imf(databaseId: string, indicator: string): IMFBuilder {
  return new IMFBuilder().databaseId(databaseId).indicator(indicator);
}

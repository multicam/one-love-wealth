import type { OECDConfig, OECDFrequency } from '../providers/oecd';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for OECD configuration
 */
export class OECDBuilder extends BaseBuilder<OECDConfig> {

  dataset(dataset: string): this {
    this.config.dataset = dataset;
    return this;
  }

  indicator(indicator: string): this {
    this.config.indicator = indicator;
    return this;
  }

  location(location: string): this {
    this.config.location = location;
    return this;
  }

  frequency(frequency: OECDFrequency): this {
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

  // Convenience methods for common locations
  usa(): this {
    return this.location('USA');
  }

  germany(): this {
    return this.location('DEU');
  }

  japan(): this {
    return this.location('JPN');
  }

  uk(): this {
    return this.location('GBR');
  }

  france(): this {
    return this.location('FRA');
  }

  oecdTotal(): this {
    return this.location('OECD');
  }

  g7(): this {
    return this.location('G7');
  }

  g20(): this {
    return this.location('G20');
  }

  euroArea(): this {
    return this.location('EA19');
  }

  // Convenience methods for common datasets
  qna(): this {
    return this.dataset('QNA');
  }

  mei(): this {
    return this.dataset('MEI');
  }

  startTime(time: string): this {
    this.config.startTime = time;
    return this;
  }

  endTime(time: string): this {
    this.config.endTime = time;
    return this;
  }

  timeRange(start: string, end: string): this {
    this.config.startTime = start;
    this.config.endTime = end;
    return this;
  }

  override build(): OECDConfig {
    if (!this.config.dataset) {
      throw new Error('OECD dataset is required');
    }
    if (!this.config.indicator) {
      throw new Error('OECD indicator is required');
    }
    if (!this.config.location) {
      throw new Error('OECD location is required');
    }
    return this.config as OECDConfig;
  }
}

/**
 * Convenience factory function for creating OECD configurations
 */
export function oecd(dataset: string, indicator: string): OECDBuilder {
  return new OECDBuilder().dataset(dataset).indicator(indicator);
}

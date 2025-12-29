import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for IMF configuration
 */
export class IMFBuilder extends BaseBuilder {
    databaseId(id) {
        this.config.databaseId = id;
        return this;
    }
    indicator(indicator) {
        this.config.indicator = indicator;
        return this;
    }
    frequency(frequency) {
        this.config.frequency = frequency;
        return this;
    }
    // Convenience methods for frequencies
    annualFrequency() {
        return this.frequency('A');
    }
    quarterlyFrequency() {
        return this.frequency('Q');
    }
    monthlyFrequency() {
        return this.frequency('M');
    }
    countryCode(code) {
        this.config.countryCode = code;
        return this;
    }
    // Convenience methods for common countries
    usa() {
        return this.countryCode('USA');
    }
    china() {
        return this.countryCode('CHN');
    }
    japan() {
        return this.countryCode('JPN');
    }
    germany() {
        return this.countryCode('DEU');
    }
    uk() {
        return this.countryCode('GBR');
    }
    euroArea() {
        return this.countryCode('U2');
    }
    world() {
        return this.countryCode('W00');
    }
    startPeriod(period) {
        this.config.startPeriod = period;
        return this;
    }
    endPeriod(period) {
        this.config.endPeriod = period;
        return this;
    }
    periodRange(start, end) {
        this.config.startPeriod = start;
        this.config.endPeriod = end;
        return this;
    }
    // Convenience for IFS database
    ifs() {
        return this.databaseId('IFS');
    }
    build() {
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
        return this.config;
    }
}
/**
 * Convenience factory function for creating IMF configurations
 */
export function imf(databaseId, indicator) {
    return new IMFBuilder().databaseId(databaseId).indicator(indicator);
}

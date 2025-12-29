import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for FRED configuration
 */
export class FREDBuilder extends BaseBuilder {
    seriesId(seriesId) {
        this.config.seriesId = seriesId;
        return this;
    }
    units(units) {
        this.config.units = units;
        return this;
    }
    // Convenience methods for common units
    yoyChange() {
        return this.units('pc1');
    }
    percentChange() {
        return this.units('pch');
    }
    naturalLog() {
        return this.units('log');
    }
    frequency(frequency) {
        this.config.frequency = frequency;
        return this;
    }
    // Convenience methods for common frequencies
    daily() {
        return this.frequency('d');
    }
    weekly() {
        return this.frequency('w');
    }
    monthly() {
        return this.frequency('m');
    }
    quarterly() {
        return this.frequency('q');
    }
    annual() {
        return this.frequency('a');
    }
    aggregationMethod(method) {
        this.config.aggregationMethod = method;
        return this;
    }
    startDate(date) {
        this.config.startDate = date;
        return this;
    }
    endDate(date) {
        this.config.endDate = date;
        return this;
    }
    dateRange(start, end) {
        this.config.startDate = start;
        this.config.endDate = end;
        return this;
    }
    limit(count) {
        this.config.limit = count;
        return this;
    }
    build() {
        if (!this.config.seriesId) {
            throw new Error('FRED seriesId is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating FRED configurations
 */
export function fred(seriesId) {
    return new FREDBuilder().seriesId(seriesId);
}

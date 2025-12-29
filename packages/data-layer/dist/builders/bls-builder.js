import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for BLS configuration
 */
export class BLSBuilder extends BaseBuilder {
    seriesId(seriesId) {
        this.config.seriesId = seriesId;
        return this;
    }
    dateRange(startYear, endYear) {
        this.config.dateRange = { startYear, endYear };
        return this;
    }
    startYear(year) {
        this.config.dateRange = {
            ...this.config.dateRange,
            startYear: year,
            endYear: this.config.dateRange?.endYear ?? new Date().getFullYear(),
        };
        return this;
    }
    endYear(year) {
        this.config.dateRange = {
            ...this.config.dateRange,
            startYear: this.config.dateRange?.startYear ?? new Date().getFullYear() - 5,
            endYear: year,
        };
        return this;
    }
    lastYears(count) {
        const endYear = new Date().getFullYear();
        const startYear = endYear - count;
        return this.dateRange(startYear, endYear);
    }
    calculations(enabled = true) {
        this.config.calculations = enabled;
        return this;
    }
    annualAverage(enabled = true) {
        this.config.annualAverage = enabled;
        return this;
    }
    build() {
        if (!this.config.seriesId) {
            throw new Error('BLS seriesId is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating BLS configurations
 */
export function bls(seriesId) {
    return new BLSBuilder().seriesId(seriesId);
}

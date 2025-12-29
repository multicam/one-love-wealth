/**
 * Fluent builder for World Bank configuration
 */
export class WorldBankBuilder {
    config = {};
    indicatorCode(code) {
        this.config.indicatorCode = code;
        return this;
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
    world() {
        return this.countryCode('WLD');
    }
    euroArea() {
        return this.countryCode('EMU');
    }
    dateRange(start, end) {
        this.config.dateRange = { start, end };
        return this;
    }
    startYear(year) {
        this.config.dateRange = { ...this.config.dateRange, start: year };
        return this;
    }
    endYear(year) {
        this.config.dateRange = { ...this.config.dateRange, end: year };
        return this;
    }
    mostRecentValues(count) {
        this.config.mrv = count;
        return this;
    }
    cache(cache) {
        this.config.cache = cache;
        return this;
    }
    mockMode(enabled = true) {
        this.config.mockMode = enabled;
        return this;
    }
    errorRecovery(config) {
        this.config.errorRecovery = config;
        return this;
    }
    build() {
        if (!this.config.indicatorCode) {
            throw new Error('World Bank indicatorCode is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating World Bank configurations
 */
export function worldbank(indicatorCode) {
    return new WorldBankBuilder().indicatorCode(indicatorCode);
}

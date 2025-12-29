/**
 * Fluent builder for Quandl configuration
 */
export class QuandlBuilder {
    config = {};
    databaseCode(code) {
        this.config.databaseCode = code;
        return this;
    }
    datasetCode(code) {
        this.config.datasetCode = code;
        return this;
    }
    database(databaseCode, datasetCode) {
        this.config.databaseCode = databaseCode;
        this.config.datasetCode = datasetCode;
        return this;
    }
    column(index) {
        this.config.column = index;
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
    collapse(collapse) {
        this.config.collapse = collapse;
        return this;
    }
    // Convenience methods for common collapse values
    daily() {
        return this.collapse('daily');
    }
    weekly() {
        return this.collapse('weekly');
    }
    monthly() {
        return this.collapse('monthly');
    }
    quarterly() {
        return this.collapse('quarterly');
    }
    annual() {
        return this.collapse('annual');
    }
    transform(transform) {
        this.config.transform = transform;
        return this;
    }
    // Convenience methods for common transforms
    diff() {
        return this.transform('diff');
    }
    percentChange() {
        return this.transform('rdiff');
    }
    cumulative() {
        return this.transform('cumul');
    }
    normalize() {
        return this.transform('normalize');
    }
    rows(count) {
        this.config.rows = count;
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
        if (!this.config.databaseCode) {
            throw new Error('Quandl databaseCode is required');
        }
        if (!this.config.datasetCode) {
            throw new Error('Quandl datasetCode is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating Quandl configurations
 */
export function quandl(databaseCode, datasetCode) {
    return new QuandlBuilder().database(databaseCode, datasetCode);
}

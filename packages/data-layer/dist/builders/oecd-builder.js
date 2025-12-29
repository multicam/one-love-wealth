/**
 * Fluent builder for OECD configuration
 */
export class OECDBuilder {
    config = {};
    dataset(dataset) {
        this.config.dataset = dataset;
        return this;
    }
    indicator(indicator) {
        this.config.indicator = indicator;
        return this;
    }
    location(location) {
        this.config.location = location;
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
    // Convenience methods for common locations
    usa() {
        return this.location('USA');
    }
    germany() {
        return this.location('DEU');
    }
    japan() {
        return this.location('JPN');
    }
    uk() {
        return this.location('GBR');
    }
    france() {
        return this.location('FRA');
    }
    oecdTotal() {
        return this.location('OECD');
    }
    g7() {
        return this.location('G7');
    }
    g20() {
        return this.location('G20');
    }
    euroArea() {
        return this.location('EA19');
    }
    // Convenience methods for common datasets
    qna() {
        return this.dataset('QNA');
    }
    mei() {
        return this.dataset('MEI');
    }
    startTime(time) {
        this.config.startTime = time;
        return this;
    }
    endTime(time) {
        this.config.endTime = time;
        return this;
    }
    timeRange(start, end) {
        this.config.startTime = start;
        this.config.endTime = end;
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
        if (!this.config.dataset) {
            throw new Error('OECD dataset is required');
        }
        if (!this.config.indicator) {
            throw new Error('OECD indicator is required');
        }
        if (!this.config.location) {
            throw new Error('OECD location is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating OECD configurations
 */
export function oecd(dataset, indicator) {
    return new OECDBuilder().dataset(dataset).indicator(indicator);
}

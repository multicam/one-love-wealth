/**
 * Fluent builder for Yahoo Finance configuration
 */
export class YahooBuilder {
    config = {};
    symbol(symbol) {
        this.config.symbol = symbol;
        return this;
    }
    period(period) {
        this.config.period = period;
        return this;
    }
    interval(interval) {
        this.config.interval = interval;
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
        if (!this.config.symbol) {
            throw new Error('Yahoo symbol is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating Yahoo configurations
 */
export function yahoo(symbol) {
    return new YahooBuilder().symbol(symbol);
}

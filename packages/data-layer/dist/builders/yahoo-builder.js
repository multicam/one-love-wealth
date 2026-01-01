import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Yahoo Finance configuration
 */
export class YahooBuilder extends BaseBuilder {
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
    /**
     * Convenience method for 10-year daily data (for backtesting)
     */
    tenYearDaily() {
        this.config.period = '10y';
        this.config.interval = '1d';
        return this;
    }
    /**
     * Convenience method for maximum available history (for backtesting)
     */
    maxHistory() {
        this.config.period = 'max';
        this.config.interval = '1d';
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

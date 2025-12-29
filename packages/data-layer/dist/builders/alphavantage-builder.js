import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Alpha Vantage configuration
 */
export class AlphaVantageBuilder extends BaseBuilder {
    function(func) {
        this.config.function = func;
        return this;
    }
    symbol(symbol) {
        this.config.symbol = symbol;
        return this;
    }
    // Convenience methods for common functions
    daily() {
        return this.function('TIME_SERIES_DAILY');
    }
    dailyAdjusted() {
        return this.function('TIME_SERIES_DAILY_ADJUSTED');
    }
    weekly() {
        return this.function('TIME_SERIES_WEEKLY');
    }
    monthly() {
        return this.function('TIME_SERIES_MONTHLY');
    }
    intraday() {
        return this.function('TIME_SERIES_INTRADAY');
    }
    fxDaily() {
        return this.function('FX_DAILY');
    }
    cryptoDaily() {
        return this.function('DIGITAL_CURRENCY_DAILY');
    }
    interval(interval) {
        this.config.interval = interval;
        return this;
    }
    outputsize(size) {
        this.config.outputsize = size;
        return this;
    }
    compact() {
        return this.outputsize('compact');
    }
    full() {
        return this.outputsize('full');
    }
    datatype(type) {
        this.config.datatype = type;
        return this;
    }
    fromCurrency(currency) {
        this.config.fromCurrency = currency;
        return this;
    }
    toCurrency(currency) {
        this.config.toCurrency = currency;
        return this;
    }
    forex(from, to) {
        this.config.fromCurrency = from;
        this.config.toCurrency = to;
        return this;
    }
    dateRange(start, end) {
        this.config.dateRange = { start, end };
        return this;
    }
    build() {
        if (!this.config.function) {
            throw new Error('Alpha Vantage function is required');
        }
        if (!this.config.symbol) {
            throw new Error('Alpha Vantage symbol is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating Alpha Vantage configurations
 */
export function alphavantage(symbol) {
    return new AlphaVantageBuilder().symbol(symbol);
}

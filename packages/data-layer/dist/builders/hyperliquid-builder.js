import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Hyperliquid configuration
 */
export class HyperliquidBuilder extends BaseBuilder {
    coin(coin) {
        this.config.coin = coin;
        return this;
    }
    dataType(dataType) {
        this.config.dataType = dataType;
        return this;
    }
    // Convenience methods for data types
    candles() {
        return this.dataType('candles');
    }
    fundingHistory() {
        return this.dataType('fundingHistory');
    }
    openInterest() {
        return this.dataType('openInterest');
    }
    interval(interval) {
        this.config.interval = interval;
        return this;
    }
    // Convenience methods for common intervals
    oneMinute() {
        return this.interval('1m');
    }
    fiveMinutes() {
        return this.interval('5m');
    }
    fifteenMinutes() {
        return this.interval('15m');
    }
    oneHour() {
        return this.interval('1h');
    }
    fourHours() {
        return this.interval('4h');
    }
    oneDay() {
        return this.interval('1d');
    }
    oneWeek() {
        return this.interval('1w');
    }
    // Convenience methods for common coins
    btc() {
        return this.coin('BTC');
    }
    eth() {
        return this.coin('ETH');
    }
    sol() {
        return this.coin('SOL');
    }
    dateRange(startTime, endTime) {
        this.config.dateRange = { startTime, endTime };
        return this;
    }
    startTime(time) {
        this.config.dateRange = { ...this.config.dateRange, startTime: time };
        return this;
    }
    endTime(time) {
        this.config.dateRange = { ...this.config.dateRange, endTime: time };
        return this;
    }
    lastDays(days) {
        const endTime = Date.now();
        const startTime = endTime - days * 24 * 60 * 60 * 1000;
        return this.dateRange(startTime, endTime);
    }
    lastHours(hours) {
        const endTime = Date.now();
        const startTime = endTime - hours * 60 * 60 * 1000;
        return this.dateRange(startTime, endTime);
    }
    build() {
        if (!this.config.coin) {
            throw new Error('Hyperliquid coin is required');
        }
        if (!this.config.dataType) {
            throw new Error('Hyperliquid dataType is required');
        }
        if (this.config.dataType === 'candles' && !this.config.interval) {
            throw new Error('Hyperliquid interval is required for candles data type');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating Hyperliquid configurations
 */
export function hyperliquid(coin) {
    return new HyperliquidBuilder().coin(coin);
}

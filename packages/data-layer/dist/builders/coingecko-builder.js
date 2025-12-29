import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for CoinGecko configuration
 */
export class CoinGeckoBuilder extends BaseBuilder {
    coin(coinId) {
        this.config.coinId = coinId;
        return this;
    }
    vsCurrency(currency) {
        this.config.vsCurrency = currency;
        return this;
    }
    endpoint(endpoint) {
        this.config.endpoint = endpoint;
        return this;
    }
    // Convenience methods for endpoints
    marketChart() {
        return this.endpoint('market_chart');
    }
    ohlc() {
        return this.endpoint('ohlc');
    }
    simplePrice() {
        return this.endpoint('simple_price');
    }
    days(days) {
        this.config.days = days;
        return this;
    }
    interval(interval) {
        this.config.interval = interval;
        return this;
    }
    precision(precision) {
        this.config.precision = precision;
        return this;
    }
    includeMarketCap(include = true) {
        this.config.includeMarketCap = include;
        return this;
    }
    include24hrVol(include = true) {
        this.config.include24hrVol = include;
        return this;
    }
    include24hrChange(include = true) {
        this.config.include24hrChange = include;
        return this;
    }
    build() {
        if (!this.config.coinId) {
            throw new Error('CoinGecko coinId is required');
        }
        return this.config;
    }
}
/**
 * Convenience factory function for creating CoinGecko configurations
 */
export function coingecko(coinId) {
    return new CoinGeckoBuilder().coin(coinId);
}

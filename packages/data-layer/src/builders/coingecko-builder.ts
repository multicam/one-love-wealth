import type { CoinGeckoConfig, CoinGeckoEndpoint } from '../providers/coingecko';
import { BaseBuilder } from './base-builder';

/**
 * Fluent builder for CoinGecko configuration
 */
export class CoinGeckoBuilder extends BaseBuilder<CoinGeckoConfig> {

  coin(coinId: string): this {
    this.config.coinId = coinId;
    return this;
  }

  vsCurrency(currency: string): this {
    this.config.vsCurrency = currency;
    return this;
  }

  endpoint(endpoint: CoinGeckoEndpoint): this {
    this.config.endpoint = endpoint;
    return this;
  }

  // Convenience methods for endpoints
  marketChart(): this {
    return this.endpoint('market_chart');
  }

  ohlc(): this {
    return this.endpoint('ohlc');
  }

  simplePrice(): this {
    return this.endpoint('simple_price');
  }

  days(days: number | 'max'): this {
    this.config.days = days;
    return this;
  }

  interval(interval: 'daily' | 'hourly'): this {
    this.config.interval = interval;
    return this;
  }

  precision(precision: number): this {
    this.config.precision = precision;
    return this;
  }

  includeMarketCap(include = true): this {
    this.config.includeMarketCap = include;
    return this;
  }

  include24hrVol(include = true): this {
    this.config.include24hrVol = include;
    return this;
  }

  include24hrChange(include = true): this {
    this.config.include24hrChange = include;
    return this;
  }

  override build(): CoinGeckoConfig {
    if (!this.config.coinId) {
      throw new Error('CoinGecko coinId is required');
    }
    return this.config as CoinGeckoConfig;
  }
}

/**
 * Convenience factory function for creating CoinGecko configurations
 */
export function coingecko(coinId: string): CoinGeckoBuilder {
  return new CoinGeckoBuilder().coin(coinId);
}

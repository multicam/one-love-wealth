import type {
  HyperliquidConfig,
  HyperliquidDataType,
  HyperliquidInterval,
} from '../providers/hyperliquid';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';

/**
 * Fluent builder for Hyperliquid configuration
 */
export class HyperliquidBuilder {
  private config: Partial<HyperliquidConfig> = {};

  coin(coin: string): this {
    this.config.coin = coin;
    return this;
  }

  dataType(dataType: HyperliquidDataType): this {
    this.config.dataType = dataType;
    return this;
  }

  // Convenience methods for data types
  candles(): this {
    return this.dataType('candles');
  }

  fundingHistory(): this {
    return this.dataType('fundingHistory');
  }

  openInterest(): this {
    return this.dataType('openInterest');
  }

  interval(interval: HyperliquidInterval): this {
    this.config.interval = interval;
    return this;
  }

  // Convenience methods for common intervals
  oneMinute(): this {
    return this.interval('1m');
  }

  fiveMinutes(): this {
    return this.interval('5m');
  }

  fifteenMinutes(): this {
    return this.interval('15m');
  }

  oneHour(): this {
    return this.interval('1h');
  }

  fourHours(): this {
    return this.interval('4h');
  }

  oneDay(): this {
    return this.interval('1d');
  }

  oneWeek(): this {
    return this.interval('1w');
  }

  // Convenience methods for common coins
  btc(): this {
    return this.coin('BTC');
  }

  eth(): this {
    return this.coin('ETH');
  }

  sol(): this {
    return this.coin('SOL');
  }

  dateRange(startTime: number, endTime: number): this {
    this.config.dateRange = { startTime, endTime };
    return this;
  }

  startTime(time: number): this {
    this.config.dateRange = { ...this.config.dateRange, startTime: time };
    return this;
  }

  endTime(time: number): this {
    this.config.dateRange = { ...this.config.dateRange, endTime: time };
    return this;
  }

  lastDays(days: number): this {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    return this.dateRange(startTime, endTime);
  }

  lastHours(hours: number): this {
    const endTime = Date.now();
    const startTime = endTime - hours * 60 * 60 * 1000;
    return this.dateRange(startTime, endTime);
  }

  cache(cache: CacheConfig): this {
    this.config.cache = cache;
    return this;
  }

  mockMode(enabled = true): this {
    this.config.mockMode = enabled;
    return this;
  }

  errorRecovery(config: ErrorRecoveryConfig): this {
    this.config.errorRecovery = config;
    return this;
  }

  build(): HyperliquidConfig {
    if (!this.config.coin) {
      throw new Error('Hyperliquid coin is required');
    }
    if (!this.config.dataType) {
      throw new Error('Hyperliquid dataType is required');
    }
    if (this.config.dataType === 'candles' && !this.config.interval) {
      throw new Error('Hyperliquid interval is required for candles data type');
    }
    return this.config as HyperliquidConfig;
  }
}

/**
 * Convenience factory function for creating Hyperliquid configurations
 */
export function hyperliquid(coin: string): HyperliquidBuilder {
  return new HyperliquidBuilder().coin(coin);
}

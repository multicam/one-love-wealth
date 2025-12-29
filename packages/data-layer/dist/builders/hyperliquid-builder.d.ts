import type { HyperliquidConfig, HyperliquidDataType, HyperliquidInterval } from '../providers/hyperliquid';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for Hyperliquid configuration
 */
export declare class HyperliquidBuilder {
    private config;
    coin(coin: string): this;
    dataType(dataType: HyperliquidDataType): this;
    candles(): this;
    fundingHistory(): this;
    openInterest(): this;
    interval(interval: HyperliquidInterval): this;
    oneMinute(): this;
    fiveMinutes(): this;
    fifteenMinutes(): this;
    oneHour(): this;
    fourHours(): this;
    oneDay(): this;
    oneWeek(): this;
    btc(): this;
    eth(): this;
    sol(): this;
    dateRange(startTime: number, endTime: number): this;
    startTime(time: number): this;
    endTime(time: number): this;
    lastDays(days: number): this;
    lastHours(hours: number): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): HyperliquidConfig;
}
/**
 * Convenience factory function for creating Hyperliquid configurations
 */
export declare function hyperliquid(coin: string): HyperliquidBuilder;
//# sourceMappingURL=hyperliquid-builder.d.ts.map
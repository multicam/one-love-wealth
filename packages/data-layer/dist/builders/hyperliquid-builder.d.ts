import type { HyperliquidConfig, HyperliquidDataType, HyperliquidInterval } from '../providers/hyperliquid';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Hyperliquid configuration
 */
export declare class HyperliquidBuilder extends BaseBuilder<HyperliquidConfig> {
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
    build(): HyperliquidConfig;
}
/**
 * Convenience factory function for creating Hyperliquid configurations
 */
export declare function hyperliquid(coin: string): HyperliquidBuilder;
//# sourceMappingURL=hyperliquid-builder.d.ts.map
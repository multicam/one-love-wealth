import type { YahooConfig, YahooPeriod, YahooInterval } from '../providers/yahoo';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Yahoo Finance configuration
 */
export declare class YahooBuilder extends BaseBuilder<YahooConfig> {
    symbol(symbol: string): this;
    period(period: YahooPeriod): this;
    interval(interval: YahooInterval): this;
    /**
     * Convenience method for 10-year daily data (for backtesting)
     */
    tenYearDaily(): this;
    /**
     * Convenience method for maximum available history (for backtesting)
     */
    maxHistory(): this;
    build(): YahooConfig;
}
/**
 * Convenience factory function for creating Yahoo configurations
 */
export declare function yahoo(symbol: string): YahooBuilder;
//# sourceMappingURL=yahoo-builder.d.ts.map
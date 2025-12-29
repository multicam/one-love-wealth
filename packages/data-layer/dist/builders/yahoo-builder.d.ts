import type { YahooConfig } from '../providers/yahoo';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Yahoo Finance configuration
 */
export declare class YahooBuilder extends BaseBuilder<YahooConfig> {
    symbol(symbol: string): this;
    period(period: YahooConfig['period']): this;
    interval(interval: YahooConfig['interval']): this;
    build(): YahooConfig;
}
/**
 * Convenience factory function for creating Yahoo configurations
 */
export declare function yahoo(symbol: string): YahooBuilder;
//# sourceMappingURL=yahoo-builder.d.ts.map
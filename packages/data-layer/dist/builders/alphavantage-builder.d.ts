import type { AlphaVantageConfig, AlphaVantageFunction, AlphaVantageInterval } from '../providers/alphavantage';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for Alpha Vantage configuration
 */
export declare class AlphaVantageBuilder extends BaseBuilder<AlphaVantageConfig> {
    function(func: AlphaVantageFunction): this;
    symbol(symbol: string): this;
    daily(): this;
    dailyAdjusted(): this;
    weekly(): this;
    monthly(): this;
    intraday(): this;
    fxDaily(): this;
    cryptoDaily(): this;
    interval(interval: AlphaVantageInterval): this;
    outputsize(size: 'compact' | 'full'): this;
    compact(): this;
    full(): this;
    datatype(type: 'json' | 'csv'): this;
    fromCurrency(currency: string): this;
    toCurrency(currency: string): this;
    forex(from: string, to: string): this;
    dateRange(start: string, end: string): this;
    build(): AlphaVantageConfig;
}
/**
 * Convenience factory function for creating Alpha Vantage configurations
 */
export declare function alphavantage(symbol: string): AlphaVantageBuilder;
//# sourceMappingURL=alphavantage-builder.d.ts.map
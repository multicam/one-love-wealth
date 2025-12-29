import type { OECDConfig, OECDFrequency } from '../providers/oecd';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for OECD configuration
 */
export declare class OECDBuilder {
    private config;
    dataset(dataset: string): this;
    indicator(indicator: string): this;
    location(location: string): this;
    frequency(frequency: OECDFrequency): this;
    annualFrequency(): this;
    quarterlyFrequency(): this;
    monthlyFrequency(): this;
    usa(): this;
    germany(): this;
    japan(): this;
    uk(): this;
    france(): this;
    oecdTotal(): this;
    g7(): this;
    g20(): this;
    euroArea(): this;
    qna(): this;
    mei(): this;
    startTime(time: string): this;
    endTime(time: string): this;
    timeRange(start: string, end: string): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): OECDConfig;
}
/**
 * Convenience factory function for creating OECD configurations
 */
export declare function oecd(dataset: string, indicator: string): OECDBuilder;
//# sourceMappingURL=oecd-builder.d.ts.map
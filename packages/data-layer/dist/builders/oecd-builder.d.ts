import type { OECDConfig, OECDFrequency } from '../providers/oecd';
import { BaseBuilder } from './base-builder';
/**
 * Fluent builder for OECD configuration
 */
export declare class OECDBuilder extends BaseBuilder<OECDConfig> {
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
    build(): OECDConfig;
}
/**
 * Convenience factory function for creating OECD configurations
 */
export declare function oecd(dataset: string, indicator: string): OECDBuilder;
//# sourceMappingURL=oecd-builder.d.ts.map
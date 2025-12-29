import type { WorldBankConfig } from '../providers/worldbank';
import type { CacheConfig } from '../cache/adapter';
import type { ErrorRecoveryConfig } from '../types/errors';
/**
 * Fluent builder for World Bank configuration
 */
export declare class WorldBankBuilder {
    private config;
    indicatorCode(code: string): this;
    countryCode(code: string): this;
    usa(): this;
    china(): this;
    world(): this;
    euroArea(): this;
    dateRange(start: number, end: number): this;
    startYear(year: number): this;
    endYear(year: number): this;
    mostRecentValues(count: number): this;
    cache(cache: CacheConfig): this;
    mockMode(enabled?: boolean): this;
    errorRecovery(config: ErrorRecoveryConfig): this;
    build(): WorldBankConfig;
}
/**
 * Convenience factory function for creating World Bank configurations
 */
export declare function worldbank(indicatorCode: string): WorldBankBuilder;
//# sourceMappingURL=worldbank-builder.d.ts.map
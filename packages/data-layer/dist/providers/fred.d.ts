import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * FRED Units transformations - server-side calculations
 */
export type FREDUnits = 'lin' | 'chg' | 'ch1' | 'pch' | 'pc1' | 'pca' | 'cch' | 'cca' | 'log';
/**
 * FRED Frequency values for aggregation
 */
export type FREDFrequency = 'd' | 'w' | 'bw' | 'm' | 'q' | 'sa' | 'a' | 'wef' | 'weth' | 'wew' | 'wetu' | 'wem' | 'wesu' | 'wesa' | 'bwew' | 'bwem';
export interface FREDConfig extends ProviderConfig {
    /** FRED series identifier (e.g., 'M2SL', 'IPMAN', 'GDP') */
    seriesId: string;
    /** Server-side data transformation */
    units?: FREDUnits;
    /** Frequency aggregation - downsample data to lower frequency */
    frequency?: FREDFrequency;
    /** How to aggregate when changing frequency */
    aggregationMethod?: 'avg' | 'sum' | 'eop';
    /** Start date (YYYY-MM-DD) */
    startDate?: string;
    /** End date (YYYY-MM-DD) */
    endDate?: string;
    /** Most recent N observations (alternative to date range) */
    limit?: number;
}
export declare class FREDProvider extends BaseProvider<FREDConfig> {
    readonly name = "FRED";
    readonly cachePrefix = "FRED";
    protected buildRequestConfig(config: FREDConfig): RequestConfig;
    protected getCacheKeyComponents(config: FREDConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, _config: FREDConfig): DataPoint[];
    protected generateMockData(config: FREDConfig): DataPoint[];
    private getBaselineValue;
    private simulateValue;
    private applyMockUnitsTransform;
}
//# sourceMappingURL=fred.d.ts.map
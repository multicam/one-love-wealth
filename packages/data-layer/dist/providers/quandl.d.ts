import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * Quandl data frequency options
 */
export type QuandlCollapse = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
/**
 * Quandl transformation options
 */
export type QuandlTransform = 'none' | 'diff' | 'rdiff' | 'rdiff_from' | 'cumul' | 'normalize';
export interface QuandlConfig extends ProviderConfig {
    /** Database code (e.g., 'FRED', 'WIKI', 'LBMA') */
    databaseCode: string;
    /** Dataset code (e.g., 'GDP', 'AAPL', 'GOLD') */
    datasetCode: string;
    /** Which column to extract (default: last column) */
    column?: number;
    /** Start date (YYYY-MM-DD) */
    startDate?: string;
    /** End date (YYYY-MM-DD) */
    endDate?: string;
    /** Data frequency */
    collapse?: QuandlCollapse;
    /** Data transformation */
    transform?: QuandlTransform;
    /** Limit number of rows */
    rows?: number;
}
/**
 * Common Quandl datasets for reference
 */
export declare const QUANDL_DATASETS: {
    readonly FRED_GDP: {
        readonly database: "FRED";
        readonly dataset: "GDP";
    };
    readonly FRED_UNRATE: {
        readonly database: "FRED";
        readonly dataset: "UNRATE";
    };
    readonly FRED_CPIAUCSL: {
        readonly database: "FRED";
        readonly dataset: "CPIAUCSL";
    };
    readonly LBMA_GOLD: {
        readonly database: "LBMA";
        readonly dataset: "GOLD";
    };
    readonly LBMA_SILVER: {
        readonly database: "LBMA";
        readonly dataset: "SILVER";
    };
    readonly CME_CL1: {
        readonly database: "CHRIS";
        readonly dataset: "CME_CL1";
    };
    readonly CME_GC1: {
        readonly database: "CHRIS";
        readonly dataset: "CME_GC1";
    };
    readonly OPEC_ORB: {
        readonly database: "OPEC";
        readonly dataset: "ORB";
    };
};
export declare class QuandlProvider extends BaseProvider<QuandlConfig> {
    readonly name = "Quandl";
    readonly cachePrefix = "QUANDL";
    protected defaultTTL: number;
    protected buildRequestConfig(config: QuandlConfig): RequestConfig;
    protected getCacheKeyComponents(config: QuandlConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: QuandlConfig): DataPoint[];
    protected generateMockData(_config: QuandlConfig): DataPoint[];
}
//# sourceMappingURL=quandl.d.ts.map
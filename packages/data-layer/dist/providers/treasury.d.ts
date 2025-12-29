import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * Available Treasury datasets
 */
export type TreasuryDataset = 'debt_to_penny' | 'historical_debt' | 'avg_interest_rates' | 'interest_expense';
export interface TreasuryConfig extends ProviderConfig {
    /** Treasury dataset to fetch */
    dataset: TreasuryDataset;
    /** Date range */
    dateRange?: {
        start?: string;
        end?: string;
    };
    /** Specific fields to fetch */
    fields?: string[];
}
/**
 * Treasury API endpoint mappings
 */
export declare const TREASURY_ENDPOINTS: Record<TreasuryDataset, string>;
/**
 * Value field mappings per dataset
 */
export declare const TREASURY_VALUE_FIELDS: Record<TreasuryDataset, string>;
/**
 * Date field mappings per dataset
 */
export declare const TREASURY_DATE_FIELDS: Record<TreasuryDataset, string>;
export declare class TreasuryProvider extends BaseProvider<TreasuryConfig> {
    readonly name = "Treasury";
    readonly cachePrefix = "TREASURY";
    protected defaultTTL: number;
    protected buildRequestConfig(config: TreasuryConfig): RequestConfig;
    protected getCacheKeyComponents(config: TreasuryConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: TreasuryConfig): DataPoint[];
    protected generateMockData(config: TreasuryConfig): DataPoint[];
}
//# sourceMappingURL=treasury.d.ts.map
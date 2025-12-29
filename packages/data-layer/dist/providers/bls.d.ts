import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
export interface BLSConfig extends ProviderConfig {
    /** BLS series identifier (e.g., 'LNS14000000', 'CUUR0000SA0') */
    seriesId: string;
    /** Date range by year */
    dateRange?: {
        startYear: number;
        endYear: number;
    };
    /** Include percent changes (API v2 only) */
    calculations?: boolean;
    /** Include annual averages (API v2 only) */
    annualAverage?: boolean;
}
/**
 * Common BLS series IDs for labor market analysis
 */
export declare const BLS_SERIES: {
    readonly UNEMPLOYMENT_RATE: "LNS14000000";
    readonly UNEMPLOYMENT_WHITE: "LNS14000003";
    readonly UNEMPLOYMENT_BLACK: "LNS14000006";
    readonly UNEMPLOYMENT_HISPANIC: "LNS14000009";
    readonly LABOR_FORCE_PARTICIPATION: "LNS11300000";
    readonly CIVILIAN_EMPLOYMENT: "LNS11000000";
    readonly EMPLOYMENT_LEVEL: "LNS12000000";
    readonly NONFARM_PAYROLLS: "CES0000000001";
    readonly MANUFACTURING_EMPLOYMENT: "CES3000000001";
    readonly CPI_ALL_ITEMS: "CUUR0000SA0";
    readonly CPI_ALL_ITEMS_SA: "CUSR0000SA0";
    readonly CPI_CORE: "CUSR0000SA0L2";
    readonly CPI_FOOD: "CUUR0000SAF";
    readonly CPI_HOUSING: "CUUR0000SAH";
    readonly CPI_MEDICAL: "CUUR0000SAM";
    readonly PPI_FINAL_DEMAND: "WPUFD4";
    readonly PPI_FINAL_DEMAND_SA: "WPSFD4";
    readonly PPI_SERVICES: "WPUFD49116";
    readonly PPI_GOODS: "WPUFD49207";
};
export declare class BLSProvider extends BaseProvider<BLSConfig> {
    readonly name = "BLS";
    readonly cachePrefix = "BLS";
    protected defaultTTL: number;
    protected buildRequestConfig(config: BLSConfig): RequestConfig;
    protected getCacheKeyComponents(config: BLSConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: BLSConfig): DataPoint[];
    protected generateMockData(config: BLSConfig): DataPoint[];
}
//# sourceMappingURL=bls.d.ts.map
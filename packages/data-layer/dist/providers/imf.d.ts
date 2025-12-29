import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * IMF frequency values
 */
export type IMFFrequency = 'A' | 'Q' | 'M';
export interface IMFConfig extends ProviderConfig {
    /** IMF database ID (e.g., 'IFS') */
    databaseId: string;
    /** Indicator code (e.g., 'NGDP_R_SA_XDC') */
    indicator: string;
    /** Frequency: Annual, Quarterly, Monthly */
    frequency: IMFFrequency;
    /** ISO 3-letter country code */
    countryCode: string;
    /** Start period (e.g., '2010' or '2010-Q1') */
    startPeriod?: string;
    /** End period */
    endPeriod?: string;
}
/**
 * IMF database IDs
 */
export declare const IMF_DATABASES: {
    readonly IFS: "IFS";
    readonly DOT: "DOT";
    readonly BOP: "BOP";
    readonly GFS: "GFS";
    readonly FSI: "FSI";
    readonly COMMP: "COMMP";
};
/**
 * Common IMF indicators for International Financial Statistics (IFS)
 */
export declare const IMF_IFS_INDICATORS: {
    readonly NGDP_R_SA_XDC: "NGDP_R_SA_XDC";
    readonly NGDP_XDC: "NGDP_XDC";
    readonly NGDP_D_SA_IX: "NGDP_D_SA_IX";
    readonly PCPI_IX: "PCPI_IX";
    readonly PCPI_PC_CP_A_PT: "PCPI_PC_CP_A_PT";
    readonly LUR_PT: "LUR_PT";
    readonly FM_XDC: "FM_XDC";
    readonly FILR_PA: "FILR_PA";
    readonly ENDA_XDC_USD_RATE: "ENDA_XDC_USD_RATE";
    readonly BCA_BP6_USD: "BCA_BP6_USD";
    readonly RAFA_USD: "RAFA_USD";
};
/**
 * Common country codes
 */
export declare const IMF_COUNTRY_CODES: {
    readonly USA: "USA";
    readonly JAPAN: "JPN";
    readonly GERMANY: "DEU";
    readonly UK: "GBR";
    readonly FRANCE: "FRA";
    readonly ITALY: "ITA";
    readonly CANADA: "CAN";
    readonly CHINA: "CHN";
    readonly INDIA: "IND";
    readonly BRAZIL: "BRA";
    readonly RUSSIA: "RUS";
    readonly SOUTH_AFRICA: "ZAF";
    readonly MEXICO: "MEX";
    readonly SOUTH_KOREA: "KOR";
    readonly AUSTRALIA: "AUS";
    readonly WORLD: "W00";
    readonly EURO_AREA: "U2";
};
export declare class IMFProvider extends BaseProvider<IMFConfig> {
    readonly name = "IMF";
    readonly cachePrefix = "IMF";
    protected defaultTTL: number;
    protected buildRequestConfig(config: IMFConfig): RequestConfig;
    protected getCacheKeyComponents(config: IMFConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: IMFConfig): DataPoint[];
    private convertPeriodToDate;
    protected generateMockData(config: IMFConfig): DataPoint[];
}
//# sourceMappingURL=imf.d.ts.map
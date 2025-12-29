import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
/**
 * OECD frequency values
 */
export type OECDFrequency = 'A' | 'Q' | 'M';
export interface OECDConfig extends ProviderConfig {
    /** OECD dataset (e.g., 'QNA') */
    dataset: string;
    /** Indicator code (e.g., 'GDP', 'B1_GE') */
    indicator: string;
    /** Location code (e.g., 'USA', 'OECD') */
    location: string;
    /** Frequency: Annual, Quarterly, Monthly */
    frequency?: OECDFrequency;
    /** Start time (e.g., '2010') */
    startTime?: string;
    /** End time */
    endTime?: string;
}
/**
 * Common OECD datasets
 */
export declare const OECD_DATASETS: {
    readonly QNA: "QNA";
    readonly SNA_TABLE1: "SNA_TABLE1";
    readonly MEI: "MEI";
    readonly PRICES_CPI: "PRICES_CPI";
    readonly MIG: "MIG";
    readonly LFS_SEXAGE_I_R: "LFS_SEXAGE_I_R";
    readonly BTDIXE_I4: "BTDIXE_I4";
    readonly MEI_TRADE: "MEI_TRADE";
    readonly IEA_MONTHLY_OIL_STATISTICS: "IEA_MONTHLY_OIL_STATISTICS";
    readonly FI_INDICATORS: "FI_INDICATORS";
    readonly KEI: "KEI";
};
/**
 * Common OECD indicators for Quarterly National Accounts (QNA)
 */
export declare const OECD_QNA_INDICATORS: {
    readonly GDP: "GDP";
    readonly B1_GE: "B1_GE";
    readonly P3: "P3";
    readonly P31S14_S15: "P31S14_S15";
    readonly P5: "P5";
    readonly P6: "P6";
    readonly P7: "P7";
};
/**
 * Common OECD Main Economic Indicators (MEI)
 */
export declare const OECD_MEI_INDICATORS: {
    readonly CPI: "CPALTT01";
    readonly PPI: "PPPGTT01";
    readonly UNEMP: "LRHUTTTT";
    readonly EMP: "LREMTTTT";
    readonly XTEXVA01: "XTEXVA01";
    readonly XTIMVA01: "XTIMVA01";
    readonly PRMNTO01: "PRMNTO01";
    readonly PRINTO01: "PRINTO01";
};
/**
 * Common OECD country/region codes
 */
export declare const OECD_LOCATIONS: {
    readonly USA: "USA";
    readonly JPN: "JPN";
    readonly DEU: "DEU";
    readonly GBR: "GBR";
    readonly FRA: "FRA";
    readonly ITA: "ITA";
    readonly CAN: "CAN";
    readonly CHN: "CHN";
    readonly IND: "IND";
    readonly BRA: "BRA";
    readonly RUS: "RUS";
    readonly MEX: "MEX";
    readonly KOR: "KOR";
    readonly AUS: "AUS";
    readonly ESP: "ESP";
    readonly NLD: "NLD";
    readonly OECD: "OECD";
    readonly OECDE: "OECDE";
    readonly EU27_2020: "EU27_2020";
    readonly EA19: "EA19";
    readonly G7: "G7";
    readonly G20: "G20";
};
export declare class OECDProvider extends BaseProvider<OECDConfig> {
    readonly name = "OECD";
    readonly cachePrefix = "OECD";
    protected defaultTTL: number;
    protected buildRequestConfig(config: OECDConfig): RequestConfig;
    protected getCacheKeyComponents(config: OECDConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, config: OECDConfig): DataPoint[];
    private convertPeriodToDate;
    protected generateMockData(config: OECDConfig): DataPoint[];
}
//# sourceMappingURL=oecd.d.ts.map
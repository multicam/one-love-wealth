import { BaseProvider, type ProviderConfig } from './base-provider';
import type { DataPoint } from '../types/data-point';
import type { RequestConfig } from '../types/request';
import type { CacheKeyComponents } from '../cache/key-builder';
export interface WorldBankConfig extends ProviderConfig {
    /** World Bank indicator code (e.g., 'NY.GDP.MKTP.CD') */
    indicatorCode: string;
    /** ISO 3-letter country code (e.g., 'USA', 'CHN') */
    countryCode?: string;
    /** Date range by year */
    dateRange?: {
        start?: number;
        end?: number;
    };
    /** Most recent N values (alternative to dateRange) */
    mrv?: number;
}
/**
 * Common World Bank indicator codes for macroeconomic analysis
 */
export declare const WORLD_BANK_INDICATORS: {
    readonly GDP_CURRENT: "NY.GDP.MKTP.CD";
    readonly GDP_GROWTH: "NY.GDP.MKTP.KD.ZG";
    readonly GDP_PER_CAPITA: "NY.GDP.PCAP.CD";
    readonly POPULATION: "SP.POP.TOTL";
    readonly POPULATION_GROWTH: "SP.POP.GROW";
    readonly BIRTH_RATE: "SP.DYN.CBRT.IN";
    readonly DEBT_GDP: "GC.DOD.TOTL.GD.ZS";
    readonly EXTERNAL_DEBT_GNI: "DT.DOD.DECT.GN.ZS";
    readonly BROAD_MONEY_GDP: "FM.LBL.BMNY.GD.ZS";
    readonly RESERVES: "FI.RES.TOTL.CD";
    readonly EXPORTS_GDP: "NE.EXP.GNFS.ZS";
    readonly IMPORTS_GDP: "NE.IMP.GNFS.ZS";
    readonly CURRENT_ACCOUNT_GDP: "BN.CAB.XOKA.GD.ZS";
    readonly INFLATION_CONSUMER: "FP.CPI.TOTL.ZG";
    readonly INFLATION_GDP: "NY.GDP.DEFL.KD.ZG";
};
/**
 * Common country codes (ISO 3166-1 alpha-3)
 */
export declare const WORLD_BANK_COUNTRIES: {
    readonly USA: "USA";
    readonly CHINA: "CHN";
    readonly JAPAN: "JPN";
    readonly GERMANY: "DEU";
    readonly UK: "GBR";
    readonly FRANCE: "FRA";
    readonly ITALY: "ITA";
    readonly CANADA: "CAN";
    readonly INDIA: "IND";
    readonly BRAZIL: "BRA";
    readonly RUSSIA: "RUS";
    readonly SOUTH_KOREA: "KOR";
    readonly AUSTRALIA: "AUS";
    readonly MEXICO: "MEX";
    readonly ALL: "all";
    readonly WORLD: "WLD";
    readonly EURO_AREA: "EMU";
};
export declare class WorldBankProvider extends BaseProvider<WorldBankConfig> {
    readonly name = "WorldBank";
    readonly cachePrefix = "WORLDBANK";
    protected defaultTTL: number;
    protected buildRequestConfig(config: WorldBankConfig): RequestConfig;
    protected getCacheKeyComponents(config: WorldBankConfig): CacheKeyComponents;
    protected transformResponse(json: unknown, _config: WorldBankConfig): DataPoint[];
    protected generateMockData(config: WorldBankConfig): DataPoint[];
}
//# sourceMappingURL=worldbank.d.ts.map
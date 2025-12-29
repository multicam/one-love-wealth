import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Common World Bank indicator codes for macroeconomic analysis
 */
export const WORLD_BANK_INDICATORS = {
    // GDP Indicators
    GDP_CURRENT: 'NY.GDP.MKTP.CD',
    GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',
    GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',
    // Population
    POPULATION: 'SP.POP.TOTL',
    POPULATION_GROWTH: 'SP.POP.GROW',
    BIRTH_RATE: 'SP.DYN.CBRT.IN',
    // Debt Indicators
    DEBT_GDP: 'GC.DOD.TOTL.GD.ZS',
    EXTERNAL_DEBT_GNI: 'DT.DOD.DECT.GN.ZS',
    // Money & Finance
    BROAD_MONEY_GDP: 'FM.LBL.BMNY.GD.ZS',
    RESERVES: 'FI.RES.TOTL.CD',
    // Trade
    EXPORTS_GDP: 'NE.EXP.GNFS.ZS',
    IMPORTS_GDP: 'NE.IMP.GNFS.ZS',
    CURRENT_ACCOUNT_GDP: 'BN.CAB.XOKA.GD.ZS',
    // Inflation
    INFLATION_CONSUMER: 'FP.CPI.TOTL.ZG',
    INFLATION_GDP: 'NY.GDP.DEFL.KD.ZG',
};
/**
 * Common country codes (ISO 3166-1 alpha-3)
 */
export const WORLD_BANK_COUNTRIES = {
    USA: 'USA',
    CHINA: 'CHN',
    JAPAN: 'JPN',
    GERMANY: 'DEU',
    UK: 'GBR',
    FRANCE: 'FRA',
    ITALY: 'ITA',
    CANADA: 'CAN',
    INDIA: 'IND',
    BRAZIL: 'BRA',
    RUSSIA: 'RUS',
    SOUTH_KOREA: 'KOR',
    AUSTRALIA: 'AUS',
    MEXICO: 'MEX',
    ALL: 'all',
    WORLD: 'WLD',
    EURO_AREA: 'EMU',
};
export class WorldBankProvider extends BaseProvider {
    name = 'WorldBank';
    cachePrefix = 'WORLDBANK';
    defaultTTL = 90 * 24 * 60 * 60 * 1000; // 90 days (quarterly/annual data)
    buildRequestConfig(config) {
        const params = {
            indicator: config.indicatorCode,
            country: config.countryCode || 'USA',
        };
        if (config.dateRange) {
            if (config.dateRange.start && config.dateRange.end) {
                params.date = `${config.dateRange.start}:${config.dateRange.end}`;
            }
        }
        if (config.mrv) {
            params.mrv = String(config.mrv);
        }
        return {
            provider: 'worldbank',
            endpoint: '/indicator',
            params,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            indicator: config.indicatorCode,
            country: config.countryCode || 'USA',
        };
        if (config.dateRange?.start)
            params.startYear = config.dateRange.start;
        if (config.dateRange?.end)
            params.endYear = config.dateRange.end;
        if (config.mrv)
            params.mrv = config.mrv;
        return {
            provider: this.cachePrefix,
            endpoint: 'indicator',
            params,
        };
    }
    transformResponse(json, _config) {
        // World Bank API returns [pagination, data] two-element array
        if (!Array.isArray(json) || json.length < 2) {
            throw new DataLayerError('Invalid World Bank response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const data = json[1];
        if (!Array.isArray(data)) {
            throw new DataLayerError('World Bank data is not an array', ErrorCode.INVALID_RESPONSE, this.name);
        }
        return data
            .filter((item) => item.value !== null && item.value !== undefined)
            .map((item) => ({
            time: new Date(`${item.date}-12-31`).getTime(),
            value: item.value,
        }))
            .reverse() // World Bank returns newest first
            .filter((dp) => !isNaN(dp.value));
    }
    generateMockData(config) {
        const mockData = [];
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 30;
        let baseValue = 100;
        let growthRate = 0.02;
        let volatility = 0.05;
        // Adjust based on indicator type
        if (config.indicatorCode.includes('NY.GDP.MKTP')) {
            if (config.countryCode === 'USA') {
                baseValue = 15_000_000_000_000;
            }
            else if (config.countryCode === 'CHN') {
                baseValue = 10_000_000_000_000;
            }
            else {
                baseValue = 1_000_000_000_000;
            }
            growthRate = 0.03;
            volatility = 0.08;
        }
        else if (config.indicatorCode.includes('.ZG') || config.indicatorCode.includes('GROWTH')) {
            baseValue = 2.5;
            growthRate = 0;
            volatility = 0.5;
        }
        else if (config.indicatorCode.includes('.GD.ZS') || config.indicatorCode.includes('DEBT')) {
            baseValue = 60;
            growthRate = 0.01;
            volatility = 0.05;
        }
        else if (config.indicatorCode.includes('SP.POP')) {
            if (config.countryCode === 'USA') {
                baseValue = 280_000_000;
            }
            else if (config.countryCode === 'CHN') {
                baseValue = 1_200_000_000;
            }
            else {
                baseValue = 50_000_000;
            }
            growthRate = 0.01;
            volatility = 0.005;
        }
        let currentValue = baseValue;
        for (let year = startYear; year <= currentYear; year++) {
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            currentValue = currentValue * (1 + growthRate + randomChange);
            if (config.indicatorCode.includes('.ZG') || config.indicatorCode.includes('GROWTH')) {
                currentValue = Math.max(-5, Math.min(10, currentValue));
            }
            else if (config.indicatorCode.includes('.GD.ZS')) {
                currentValue = Math.max(20, Math.min(150, currentValue));
            }
            else {
                currentValue = Math.max(0, currentValue);
            }
            mockData.push({
                time: new Date(`${year}-12-31`).getTime(),
                value: Math.round(currentValue * 100) / 100,
            });
        }
        return mockData;
    }
}

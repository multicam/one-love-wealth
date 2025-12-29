import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * IMF database IDs
 */
export const IMF_DATABASES = {
    IFS: 'IFS',
    DOT: 'DOT',
    BOP: 'BOP',
    GFS: 'GFS',
    FSI: 'FSI',
    COMMP: 'COMMP',
};
/**
 * Common IMF indicators for International Financial Statistics (IFS)
 */
export const IMF_IFS_INDICATORS = {
    NGDP_R_SA_XDC: 'NGDP_R_SA_XDC',
    NGDP_XDC: 'NGDP_XDC',
    NGDP_D_SA_IX: 'NGDP_D_SA_IX',
    PCPI_IX: 'PCPI_IX',
    PCPI_PC_CP_A_PT: 'PCPI_PC_CP_A_PT',
    LUR_PT: 'LUR_PT',
    FM_XDC: 'FM_XDC',
    FILR_PA: 'FILR_PA',
    ENDA_XDC_USD_RATE: 'ENDA_XDC_USD_RATE',
    BCA_BP6_USD: 'BCA_BP6_USD',
    RAFA_USD: 'RAFA_USD',
};
/**
 * Common country codes
 */
export const IMF_COUNTRY_CODES = {
    USA: 'USA',
    JAPAN: 'JPN',
    GERMANY: 'DEU',
    UK: 'GBR',
    FRANCE: 'FRA',
    ITALY: 'ITA',
    CANADA: 'CAN',
    CHINA: 'CHN',
    INDIA: 'IND',
    BRAZIL: 'BRA',
    RUSSIA: 'RUS',
    SOUTH_AFRICA: 'ZAF',
    MEXICO: 'MEX',
    SOUTH_KOREA: 'KOR',
    AUSTRALIA: 'AUS',
    WORLD: 'W00',
    EURO_AREA: 'U2',
};
export class IMFProvider extends BaseProvider {
    name = 'IMF';
    cachePrefix = 'IMF';
    defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    buildRequestConfig(config) {
        const params = {
            database: config.databaseId,
            indicator: config.indicator,
            frequency: config.frequency,
            country: config.countryCode,
        };
        if (config.startPeriod)
            params.start = config.startPeriod;
        if (config.endPeriod)
            params.end = config.endPeriod;
        return {
            provider: 'imf',
            endpoint: '/data',
            params,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            database: config.databaseId,
            indicator: config.indicator,
            frequency: config.frequency,
            country: config.countryCode,
        };
        if (config.startPeriod)
            params.start = config.startPeriod;
        if (config.endPeriod)
            params.end = config.endPeriod;
        return {
            provider: this.cachePrefix,
            endpoint: config.databaseId,
            params,
        };
    }
    transformResponse(json, config) {
        const response = json;
        const compactData = response.CompactData || json;
        if (!compactData?.DataSet?.Series) {
            throw new DataLayerError('Invalid IMF response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const series = Array.isArray(compactData.DataSet.Series)
            ? compactData.DataSet.Series
            : [compactData.DataSet.Series];
        if (series.length === 0) {
            throw new DataLayerError(`No data found for ${config.countryCode}/${config.indicator}`, ErrorCode.NOT_FOUND, this.name);
        }
        const firstSeries = series[0];
        if (!firstSeries || !firstSeries.Obs) {
            throw new DataLayerError(`No observations found for ${config.countryCode}/${config.indicator}`, ErrorCode.NOT_FOUND, this.name);
        }
        const observations = Array.isArray(firstSeries.Obs)
            ? firstSeries.Obs
            : [firstSeries.Obs];
        const results = [];
        for (const obs of observations) {
            const period = obs['@TIME_PERIOD'];
            const value = obs['@OBS_VALUE'];
            if (!period || value === undefined || value === null) {
                continue;
            }
            const date = this.convertPeriodToDate(period, config.frequency);
            const parsedValue = parseFloat(String(value));
            if (!isNaN(parsedValue)) {
                results.push({
                    time: new Date(date).getTime(),
                    value: parsedValue,
                });
            }
        }
        return results.sort((a, b) => a.time - b.time);
    }
    convertPeriodToDate(period, frequency) {
        if (frequency === 'A') {
            return `${period}-12-31`;
        }
        else if (frequency === 'Q') {
            const parts = period.split('-Q');
            const year = parts[0] ?? period;
            const quarter = parts[1] ?? '1';
            const month = (parseInt(quarter) * 3).toString().padStart(2, '0');
            return `${year}-${month}-01`;
        }
        else {
            const parts = period.split('-');
            const year = parts[0] ?? period;
            const month = parts[1] ?? '01';
            return `${year}-${month}-01`;
        }
    }
    generateMockData(config) {
        const points = [];
        const currentYear = new Date().getFullYear();
        let value = 100;
        if (config.frequency === 'A') {
            for (let i = currentYear - 19; i <= currentYear; i++) {
                value += (Math.random() - 0.45) * 5;
                points.push({
                    time: new Date(`${i}-12-31`).getTime(),
                    value,
                });
            }
        }
        else if (config.frequency === 'Q') {
            for (let i = 0; i < 40; i++) {
                const year = currentYear - 9 + Math.floor(i / 4);
                const quarter = (i % 4) + 1;
                const month = quarter * 3;
                value += (Math.random() - 0.48) * 3;
                points.push({
                    time: new Date(`${year}-${month.toString().padStart(2, '0')}-01`).getTime(),
                    value,
                });
            }
        }
        else {
            for (let i = 0; i < 60; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - (59 - i));
                value += (Math.random() - 0.48) * 2;
                points.push({
                    time: date.getTime(),
                    value,
                });
            }
        }
        return points;
    }
}

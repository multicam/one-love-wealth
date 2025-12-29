import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Common OECD datasets
 */
export const OECD_DATASETS = {
    QNA: 'QNA',
    SNA_TABLE1: 'SNA_TABLE1',
    MEI: 'MEI',
    PRICES_CPI: 'PRICES_CPI',
    MIG: 'MIG',
    LFS_SEXAGE_I_R: 'LFS_SEXAGE_I_R',
    BTDIXE_I4: 'BTDIXE_I4',
    MEI_TRADE: 'MEI_TRADE',
    IEA_MONTHLY_OIL_STATISTICS: 'IEA_MONTHLY_OIL_STATISTICS',
    FI_INDICATORS: 'FI_INDICATORS',
    KEI: 'KEI',
};
/**
 * Common OECD indicators for Quarterly National Accounts (QNA)
 */
export const OECD_QNA_INDICATORS = {
    GDP: 'GDP',
    B1_GE: 'B1_GE',
    P3: 'P3',
    P31S14_S15: 'P31S14_S15',
    P5: 'P5',
    P6: 'P6',
    P7: 'P7',
};
/**
 * Common OECD Main Economic Indicators (MEI)
 */
export const OECD_MEI_INDICATORS = {
    CPI: 'CPALTT01',
    PPI: 'PPPGTT01',
    UNEMP: 'LRHUTTTT',
    EMP: 'LREMTTTT',
    XTEXVA01: 'XTEXVA01',
    XTIMVA01: 'XTIMVA01',
    PRMNTO01: 'PRMNTO01',
    PRINTO01: 'PRINTO01',
};
/**
 * Common OECD country/region codes
 */
export const OECD_LOCATIONS = {
    USA: 'USA',
    JPN: 'JPN',
    DEU: 'DEU',
    GBR: 'GBR',
    FRA: 'FRA',
    ITA: 'ITA',
    CAN: 'CAN',
    CHN: 'CHN',
    IND: 'IND',
    BRA: 'BRA',
    RUS: 'RUS',
    MEX: 'MEX',
    KOR: 'KOR',
    AUS: 'AUS',
    ESP: 'ESP',
    NLD: 'NLD',
    OECD: 'OECD',
    OECDE: 'OECDE',
    EU27_2020: 'EU27_2020',
    EA19: 'EA19',
    G7: 'G7',
    G20: 'G20',
};
export class OECDProvider extends BaseProvider {
    name = 'OECD';
    cachePrefix = 'OECD';
    defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    buildRequestConfig(config) {
        const params = {
            dataset: config.dataset,
            indicator: config.indicator,
            location: config.location,
        };
        if (config.frequency)
            params.frequency = config.frequency;
        if (config.startTime)
            params.start = config.startTime;
        if (config.endTime)
            params.end = config.endTime;
        return {
            provider: 'oecd',
            endpoint: '/data',
            params,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            dataset: config.dataset,
            indicator: config.indicator,
            location: config.location,
        };
        if (config.frequency)
            params.frequency = config.frequency;
        if (config.startTime)
            params.start = config.startTime;
        if (config.endTime)
            params.end = config.endTime;
        return {
            provider: this.cachePrefix,
            endpoint: config.dataset,
            params,
        };
    }
    transformResponse(json, config) {
        const response = json;
        if (!response.dataSets || !response.structure) {
            throw new DataLayerError('Invalid OECD response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const dataset = response.dataSets[0];
        if (!dataset || !dataset.observations) {
            throw new DataLayerError(`No data found for ${config.location}/${config.indicator}`, ErrorCode.NOT_FOUND, this.name);
        }
        const dimensions = response.structure.dimensions?.observation;
        const timeDimension = dimensions?.find((d) => d.id === 'TIME_PERIOD');
        if (!timeDimension || !timeDimension.values) {
            throw new DataLayerError('No time dimension found in OECD response', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const timePeriods = timeDimension.values;
        const points = [];
        for (const [key, value] of Object.entries(dataset.observations)) {
            const indices = key.split(':').map((i) => parseInt(i));
            if (indices.length === 0) {
                continue;
            }
            const lastIndexValue = indices[indices.length - 1];
            if (lastIndexValue === undefined || isNaN(lastIndexValue)) {
                continue;
            }
            const timeIndex = lastIndexValue;
            const period = timePeriods[timeIndex];
            if (!period || !period.id) {
                continue;
            }
            const obsValue = Array.isArray(value) ? value[0] : value;
            if (obsValue === null || obsValue === undefined) {
                continue;
            }
            const date = this.convertPeriodToDate(period.id);
            points.push({
                time: new Date(date).getTime(),
                value: obsValue,
            });
        }
        return points
            .filter((point) => point.value !== undefined && !isNaN(point.value))
            .sort((a, b) => a.time - b.time);
    }
    convertPeriodToDate(period) {
        if (period.includes('-Q')) {
            const parts = period.split('-Q');
            const year = parts[0] ?? period;
            const quarter = parts[1] ?? '1';
            const month = (parseInt(quarter) * 3).toString().padStart(2, '0');
            return `${year}-${month}-01`;
        }
        else if (period.includes('-')) {
            return `${period}-01`;
        }
        else {
            return `${period}-12-31`;
        }
    }
    generateMockData(config) {
        const points = [];
        const currentYear = new Date().getFullYear();
        let value = 100;
        const frequency = config.frequency || 'A';
        if (frequency === 'A') {
            for (let i = currentYear - 19; i <= currentYear; i++) {
                value += (Math.random() - 0.45) * 5;
                points.push({
                    time: new Date(`${i}-12-31`).getTime(),
                    value,
                });
            }
        }
        else if (frequency === 'Q') {
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

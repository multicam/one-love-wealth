import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Common Quandl datasets for reference
 */
export const QUANDL_DATASETS = {
    FRED_GDP: { database: 'FRED', dataset: 'GDP' },
    FRED_UNRATE: { database: 'FRED', dataset: 'UNRATE' },
    FRED_CPIAUCSL: { database: 'FRED', dataset: 'CPIAUCSL' },
    LBMA_GOLD: { database: 'LBMA', dataset: 'GOLD' },
    LBMA_SILVER: { database: 'LBMA', dataset: 'SILVER' },
    CME_CL1: { database: 'CHRIS', dataset: 'CME_CL1' },
    CME_GC1: { database: 'CHRIS', dataset: 'CME_GC1' },
    OPEC_ORB: { database: 'OPEC', dataset: 'ORB' },
};
export class QuandlProvider extends BaseProvider {
    name = 'Quandl';
    cachePrefix = 'QUANDL';
    defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
    buildRequestConfig(config) {
        const params = {
            database: config.databaseCode,
            dataset: config.datasetCode,
        };
        if (config.column !== undefined) {
            params.column_index = String(config.column);
        }
        if (config.startDate)
            params.start_date = config.startDate;
        if (config.endDate)
            params.end_date = config.endDate;
        if (config.collapse && config.collapse !== 'none') {
            params.collapse = config.collapse;
        }
        if (config.transform && config.transform !== 'none') {
            params.transform = config.transform;
        }
        if (config.rows)
            params.rows = String(config.rows);
        return {
            provider: 'quandl',
            endpoint: '/datasets',
            params,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            database: config.databaseCode,
            dataset: config.datasetCode,
        };
        if (config.column !== undefined)
            params.column = config.column;
        if (config.startDate)
            params.startDate = config.startDate;
        if (config.endDate)
            params.endDate = config.endDate;
        if (config.collapse)
            params.collapse = config.collapse;
        if (config.transform)
            params.transform = config.transform;
        if (config.rows)
            params.rows = config.rows;
        return {
            provider: this.cachePrefix,
            endpoint: `${config.databaseCode}/${config.datasetCode}`,
            params,
        };
    }
    transformResponse(json, config) {
        const response = json;
        const dataset = response.dataset || response.dataset_data;
        if (!dataset) {
            throw new DataLayerError('Invalid Quandl response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const data = dataset.data;
        if (!Array.isArray(data) || data.length === 0) {
            throw new DataLayerError(`No data found for ${config.databaseCode}/${config.datasetCode}`, ErrorCode.NOT_FOUND, this.name);
        }
        const columnNames = dataset.column_names || [];
        const columnIndex = config.column !== undefined ? config.column : columnNames.length - 1;
        const results = [];
        for (const row of data) {
            const date = row[0];
            const value = row[columnIndex];
            if (!date || value === null || value === undefined) {
                continue;
            }
            const parsedValue = parseFloat(String(value));
            if (!isNaN(parsedValue)) {
                results.push({
                    time: new Date(String(date)).getTime(),
                    value: parsedValue,
                });
            }
        }
        return results.sort((a, b) => a.time - b.time);
    }
    generateMockData(_config) {
        const points = [];
        const today = new Date();
        let value = 100;
        for (let i = 199; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            value += (Math.random() - 0.5) * 5;
            value = Math.max(value, 50);
            points.push({
                time: date.getTime(),
                value,
            });
        }
        return points;
    }
}

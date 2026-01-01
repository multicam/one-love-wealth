import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Common BLS series IDs for labor market analysis
 */
export const BLS_SERIES = {
    // Unemployment Rate
    UNEMPLOYMENT_RATE: 'LNS14000000',
    UNEMPLOYMENT_WHITE: 'LNS14000003',
    UNEMPLOYMENT_BLACK: 'LNS14000006',
    UNEMPLOYMENT_HISPANIC: 'LNS14000009',
    // Labor Force Participation
    LABOR_FORCE_PARTICIPATION: 'LNS11300000',
    CIVILIAN_EMPLOYMENT: 'LNS11000000',
    EMPLOYMENT_LEVEL: 'LNS12000000',
    // Employment
    NONFARM_PAYROLLS: 'CES0000000001',
    MANUFACTURING_EMPLOYMENT: 'CES3000000001',
    // Consumer Price Index (CPI)
    CPI_ALL_ITEMS: 'CUUR0000SA0',
    CPI_ALL_ITEMS_SA: 'CUSR0000SA0',
    CPI_CORE: 'CUSR0000SA0L2',
    CPI_FOOD: 'CUUR0000SAF',
    CPI_HOUSING: 'CUUR0000SAH',
    CPI_MEDICAL: 'CUUR0000SAM',
    // Producer Price Index (PPI)
    PPI_FINAL_DEMAND: 'WPUFD4',
    PPI_FINAL_DEMAND_SA: 'WPSFD4',
    PPI_SERVICES: 'WPUFD49116',
    PPI_GOODS: 'WPUFD49207',
};
export class BLSProvider extends BaseProvider {
    name = 'BLS';
    cachePrefix = 'BLS';
    defaultTTL = 30 * 24 * 60 * 60 * 1000; // 30 days (monthly data)
    buildRequestConfig(config) {
        let startYear;
        let endYear;
        if (config.dateRange) {
            startYear = config.dateRange.startYear;
            endYear = config.dateRange.endYear;
        }
        else {
            endYear = new Date().getFullYear();
            startYear = endYear - 5;
        }
        // BLS v2 API requires POST with JSON body
        const body = {
            seriesid: [config.seriesId],
            startyear: String(startYear),
            endyear: String(endYear),
        };
        if (config.calculations) {
            body.calculations = true;
        }
        if (config.annualAverage) {
            body.annualaverage = true;
        }
        // Pass date range in params for cache key building
        const params = {
            seriesId: config.seriesId,
            startYear: String(startYear),
            endYear: String(endYear),
        };
        return {
            provider: 'bls',
            endpoint: '/timeseries/data/',
            params,
            method: 'POST',
            body,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            seriesId: config.seriesId,
        };
        if (config.dateRange) {
            params.startYear = config.dateRange.startYear;
            params.endYear = config.dateRange.endYear;
        }
        if (config.calculations)
            params.calculations = config.calculations;
        if (config.annualAverage)
            params.annualAverage = config.annualAverage;
        return {
            provider: this.cachePrefix,
            endpoint: 'timeseries',
            params,
        };
    }
    transformResponse(json, config) {
        const response = json;
        if (response.status !== 'REQUEST_SUCCEEDED') {
            const messages = response.message?.join(', ') || 'Unknown error';
            throw new DataLayerError(`BLS API error: ${messages}`, ErrorCode.INVALID_RESPONSE, this.name);
        }
        const series = response.Results?.series?.[0];
        if (!series || !Array.isArray(series.data)) {
            throw new DataLayerError('Invalid BLS response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        return series.data
            .filter((d) => {
            if (config.annualAverage)
                return true;
            return d.period !== 'M13' && d.period !== 'A01';
        })
            .map((d) => {
            let dateStr;
            if (d.period.startsWith('M')) {
                const month = d.period.replace('M', '').padStart(2, '0');
                dateStr = `${d.year}-${month}-01`;
            }
            else if (d.period.startsWith('Q')) {
                const quarter = parseInt(d.period.replace('Q', ''));
                const month = ((quarter - 1) * 3 + 1).toString().padStart(2, '0');
                dateStr = `${d.year}-${month}-01`;
            }
            else {
                dateStr = `${d.year}-12-31`;
            }
            return {
                time: new Date(dateStr).getTime(),
                value: parseFloat(d.value),
            };
        })
            .reverse()
            .filter((dp) => !isNaN(dp.value));
    }
    generateMockData(config) {
        const mockData = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        let baseValue = 5;
        let volatility = 0.1;
        let trend = 0;
        if (config.seriesId.startsWith('LNS14')) {
            baseValue = 4.5;
            volatility = 0.15;
            trend = -0.0005;
        }
        else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
            baseValue = 63;
            volatility = 0.05;
            trend = 0.0002;
        }
        else if (config.seriesId.startsWith('CES')) {
            baseValue = 150_000_000;
            volatility = 0.002;
            trend = 0.001;
        }
        else if (config.seriesId.startsWith('CUUR') || config.seriesId.startsWith('CUSR')) {
            baseValue = 250;
            volatility = 0.01;
            trend = 0.002;
        }
        else if (config.seriesId.startsWith('WP')) {
            baseValue = 180;
            volatility = 0.015;
            trend = 0.0015;
        }
        let currentValue = baseValue;
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            currentValue = currentValue * (1 + trend + randomChange);
            if (config.seriesId.startsWith('LNS14')) {
                currentValue = Math.max(2, Math.min(10, currentValue));
            }
            else if (config.seriesId.startsWith('LNS11') || config.seriesId.startsWith('LNS12')) {
                currentValue = Math.max(60, Math.min(67, currentValue));
            }
            else {
                currentValue = Math.max(0, currentValue);
            }
            mockData.push({
                time: currentDate.getTime(),
                value: Math.round(currentValue * 100) / 100,
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return mockData;
    }
}

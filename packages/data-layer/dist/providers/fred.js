import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
export class FREDProvider extends BaseProvider {
    name = 'FRED';
    cachePrefix = 'FRED';
    buildRequestConfig(config) {
        const params = {
            series_id: config.seriesId,
        };
        if (config.startDate)
            params.observation_start = config.startDate;
        if (config.endDate)
            params.observation_end = config.endDate;
        if (config.limit) {
            params.limit = String(config.limit);
            params.sort_order = 'desc';
        }
        if (config.units)
            params.units = config.units;
        if (config.frequency)
            params.frequency = config.frequency;
        if (config.aggregationMethod)
            params.aggregation_method = config.aggregationMethod;
        return {
            provider: 'fred',
            endpoint: '/series/observations',
            params,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            seriesId: config.seriesId,
        };
        if (config.units)
            params.units = config.units;
        if (config.frequency)
            params.frequency = config.frequency;
        if (config.startDate)
            params.startDate = config.startDate;
        if (config.endDate)
            params.endDate = config.endDate;
        if (config.limit)
            params.limit = config.limit;
        return {
            provider: this.cachePrefix,
            endpoint: 'observations',
            params,
        };
    }
    transformResponse(json, _config) {
        const response = json;
        if (!response.observations) {
            throw new DataLayerError('Invalid FRED response: missing observations', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const result = [];
        for (const obs of response.observations) {
            const value = parseFloat(obs.value);
            if (!isNaN(value)) {
                result.push({
                    time: new Date(obs.date).getTime(),
                    value,
                });
            }
        }
        return result;
    }
    generateMockData(config) {
        const now = Date.now();
        const data = [];
        let value = this.getBaselineValue(config.seriesId);
        // Generate 5 years of monthly data by default
        const months = config.limit || 60;
        for (let i = months; i >= 0; i--) {
            const time = now - i * 30 * 24 * 60 * 60 * 1000; // ~monthly intervals
            value = this.simulateValue(config.seriesId, value, i);
            data.push({ time, value });
        }
        // Apply units transformation for mock data
        return this.applyMockUnitsTransform(data, config.units);
    }
    getBaselineValue(seriesId) {
        const baselines = {
            'M2SL': 20000,
            'IPMAN': 100,
            'GFDEGDQ188S': 120,
            'A091RC1Q027SBEA': 500,
            'PPIACO': 250,
            'GS10': 4.0,
            'FEDFUNDS': 4.0,
            'NFCI': -0.5,
            'WPU10': 120,
            'CIVPART': 62,
            'SP500': 4000,
            'NASDAQ100': 15000,
            'GDPC1': 20000,
            'GDP': 25000,
            'DTWEXBGS': 100,
            'UMCSENT': 70,
            'GFDEBTN': 30000,
            'TDSP': 10,
            'CPIAUCSL': 300,
            'UNRATE': 4.0,
        };
        return baselines[seriesId] ?? 100;
    }
    simulateValue(seriesId, currentValue, monthsAgo) {
        // Series-specific simulation patterns
        if (seriesId === 'IPMAN') {
            return 100 + 5 * Math.sin((monthsAgo * Math.PI) / 24);
        }
        if (seriesId === 'GFDEGDQ188S' || seriesId === 'TOTDTEUSQ163N') {
            return currentValue * 1.002;
        }
        if (seriesId === 'GS10' || seriesId === 'FEDFUNDS') {
            return 4.0 + 1.5 * Math.sin((monthsAgo * Math.PI) / 36);
        }
        if (seriesId === 'NFCI') {
            return -0.5 + Math.random() * 0.5;
        }
        if (seriesId === 'UNRATE') {
            return 3.5 + Math.random() * 1.5;
        }
        if (seriesId === 'SP500' || seriesId === 'NASDAQ100') {
            return currentValue * (1 + (Math.random() - 0.35) * 0.05);
        }
        // Default: slight upward trend
        return currentValue * 1.001;
    }
    applyMockUnitsTransform(data, units) {
        if (!units || units === 'lin')
            return data;
        if (units === 'pc1' && data.length > 12) {
            // Percent change from year ago
            return data.slice(12).map((point, i) => {
                const current = point.value ?? 0;
                const prevPoint = data[i];
                const previous = prevPoint?.value ?? 1;
                return {
                    time: point.time,
                    value: ((current - previous) / previous) * 100,
                };
            });
        }
        if (units === 'pch' && data.length > 1) {
            // Percent change from previous period
            return data.slice(1).map((point, i) => {
                const current = point.value ?? 0;
                const prevPoint = data[i];
                const previous = prevPoint?.value ?? 1;
                return {
                    time: point.time,
                    value: ((current - previous) / previous) * 100,
                };
            });
        }
        if (units === 'log') {
            // Natural log transformation
            return data.map((point) => ({
                time: point.time,
                value: Math.log(point.value ?? 1),
            }));
        }
        if (units === 'chg' && data.length > 1) {
            // Change from previous period
            return data.slice(1).map((point, i) => {
                const prevPoint = data[i];
                return {
                    time: point.time,
                    value: (point.value ?? 0) - (prevPoint?.value ?? 0),
                };
            });
        }
        if (units === 'ch1' && data.length > 12) {
            // Change from year ago
            return data.slice(12).map((point, i) => {
                const prevPoint = data[i];
                return {
                    time: point.time,
                    value: (point.value ?? 0) - (prevPoint?.value ?? 0),
                };
            });
        }
        return data;
    }
}

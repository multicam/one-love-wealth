import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
export class YahooProvider extends BaseProvider {
    name = 'Yahoo Finance';
    cachePrefix = 'YAHOO';
    buildRequestConfig(config) {
        const params = {};
        // Yahoo uses range (period1/period2) or period string
        if (config.period) {
            params.range = config.period;
        }
        else {
            params.range = '1y';
        }
        if (config.interval)
            params.interval = config.interval;
        // Yahoo Finance API: /chart/{symbol}?range=1y&interval=1d
        return {
            provider: 'yahoo',
            endpoint: `/${config.symbol}`,
            params,
        };
    }
    getCacheKeyComponents(config) {
        return {
            provider: this.cachePrefix,
            params: {
                symbol: config.symbol,
                period: config.period || '1y',
                interval: config.interval || '1d',
            },
        };
    }
    transformResponse(json, _config) {
        const response = json;
        if (!response.chart?.result?.[0]) {
            throw new DataLayerError('Invalid Yahoo Finance response format', ErrorCode.INVALID_RESPONSE, this.name);
        }
        const result = response.chart.result[0];
        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0] || {};
        return timestamps.map((ts, i) => ({
            time: ts * 1000, // Convert to milliseconds
            open: quotes.open?.[i],
            high: quotes.high?.[i],
            low: quotes.low?.[i],
            close: quotes.close?.[i],
            volume: quotes.volume?.[i],
        }));
    }
    generateMockData(config) {
        const data = [];
        const now = Date.now();
        let price = 100;
        // Determine number of days based on period
        const periodDays = {
            '1d': 1,
            '5d': 5,
            '1mo': 30,
            '3mo': 90,
            '6mo': 180,
            '1y': 365,
            '2y': 730,
            '5y': 1825,
            'max': 365,
        };
        const days = periodDays[config.period || '1y'] || 365;
        for (let i = days; i >= 0; i--) {
            const time = now - i * 24 * 60 * 60 * 1000;
            const open = price;
            const change = (Math.random() - 0.5) * 5;
            const close = open + change;
            const high = Math.max(open, close) * (1 + Math.random() * 0.02);
            const low = Math.min(open, close) * (1 - Math.random() * 0.02);
            data.push({
                time,
                open,
                high,
                low,
                close,
                volume: Math.floor(Math.random() * 10000000),
            });
            price = close;
        }
        return data;
    }
}

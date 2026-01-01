import { BaseProvider } from './base-provider';
import { DataLayerError, ErrorCode } from '../types/errors';
/**
 * Common crypto coins on Hyperliquid
 */
export const HYPERLIQUID_COINS = {
    BTC: 'BTC',
    ETH: 'ETH',
    SOL: 'SOL',
    DOGE: 'DOGE',
    ARB: 'ARB',
    AVAX: 'AVAX',
    MATIC: 'MATIC',
    OP: 'OP',
};
export class HyperliquidProvider extends BaseProvider {
    name = 'Hyperliquid';
    cachePrefix = 'HYPERLIQUID';
    defaultTTL = 5 * 60 * 1000; // 5 minutes for crypto data
    buildRequestConfig(config) {
        // Build request body based on data type
        let body;
        if (config.dataType === 'candles') {
            body = {
                type: 'candleSnapshot',
                req: {
                    coin: config.coin,
                    interval: config.interval || '1d',
                    startTime: config.dateRange?.startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
                    endTime: config.dateRange?.endTime || Date.now(),
                },
            };
        }
        else if (config.dataType === 'fundingHistory') {
            body = {
                type: 'fundingHistory',
                coin: config.coin,
                startTime: config.dateRange?.startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
            };
        }
        else {
            // openInterest
            body = {
                type: 'metaAndAssetCtxs',
            };
        }
        // Params for cache key
        const params = {
            coin: config.coin,
            dataType: config.dataType,
        };
        if (config.interval)
            params.interval = config.interval;
        if (config.dateRange?.startTime)
            params.startTime = String(config.dateRange.startTime);
        if (config.dateRange?.endTime)
            params.endTime = String(config.dateRange.endTime);
        return {
            provider: 'hyperliquid',
            endpoint: '/info',
            params,
            method: 'POST',
            body,
        };
    }
    getCacheKeyComponents(config) {
        const params = {
            coin: config.coin,
            dataType: config.dataType,
        };
        if (config.interval)
            params.interval = config.interval;
        if (config.dateRange?.startTime)
            params.startTime = config.dateRange.startTime;
        if (config.dateRange?.endTime)
            params.endTime = config.dateRange.endTime;
        return {
            provider: this.cachePrefix,
            endpoint: config.dataType,
            params,
        };
    }
    transformResponse(json, config) {
        if (config.dataType === 'candles') {
            if (!Array.isArray(json)) {
                throw new DataLayerError('Invalid Hyperliquid candles response format', ErrorCode.INVALID_RESPONSE, this.name);
            }
            return json
                .map((candle) => ({
                time: candle.t,
                value: parseFloat(candle.c),
                open: parseFloat(candle.o),
                high: parseFloat(candle.h),
                low: parseFloat(candle.l),
                close: parseFloat(candle.c),
                volume: parseFloat(candle.v),
            }))
                .filter((dp) => !isNaN(dp.value));
        }
        if (config.dataType === 'fundingHistory') {
            if (!Array.isArray(json)) {
                throw new DataLayerError('Invalid Hyperliquid funding history response format', ErrorCode.INVALID_RESPONSE, this.name);
            }
            return json
                .map((item) => ({
                time: item.time,
                value: parseFloat(item.fundingRate) * 100, // Convert to percentage
            }))
                .filter((dp) => !isNaN(dp.value));
        }
        if (config.dataType === 'openInterest') {
            const response = json;
            if (response.openInterest === undefined) {
                throw new DataLayerError('Invalid Hyperliquid open interest response format', ErrorCode.INVALID_RESPONSE, this.name);
            }
            return [
                {
                    time: Date.now(),
                    value: parseFloat(response.openInterest),
                },
            ];
        }
        return [];
    }
    generateMockData(config) {
        const mockData = [];
        const endDate = new Date();
        const startDate = new Date();
        if (config.dataType === 'candles') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }
        else {
            startDate.setDate(startDate.getDate() - 30);
        }
        let baseValue = 1;
        let volatility = 0.03;
        if (config.dataType === 'candles') {
            if (config.coin === 'BTC') {
                baseValue = 45000;
                volatility = 0.03;
            }
            else if (config.coin === 'ETH') {
                baseValue = 2500;
                volatility = 0.04;
            }
            else if (config.coin === 'SOL') {
                baseValue = 100;
                volatility = 0.05;
            }
            else {
                baseValue = 1;
                volatility = 0.06;
            }
        }
        else if (config.dataType === 'fundingHistory') {
            baseValue = 0.01;
            volatility = 2;
        }
        else if (config.dataType === 'openInterest') {
            baseValue = 1000000;
            volatility = 0.1;
        }
        let currentValue = baseValue;
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            currentValue = currentValue * (1 + randomChange);
            if (config.dataType === 'fundingHistory') {
                currentValue = Math.max(-0.1, Math.min(0.1, currentValue));
            }
            else {
                currentValue = Math.max(baseValue * 0.5, currentValue);
            }
            if (config.dataType === 'candles') {
                const open = currentValue;
                const change = (Math.random() - 0.5) * currentValue * 0.02;
                const close = open + change;
                const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                const low = Math.min(open, close) * (1 - Math.random() * 0.01);
                mockData.push({
                    time: currentDate.getTime(),
                    value: close,
                    open,
                    high,
                    low,
                    close,
                    volume: Math.floor(Math.random() * 10000000),
                });
            }
            else {
                mockData.push({
                    time: currentDate.getTime(),
                    value: Math.round(currentValue * 100) / 100,
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return mockData;
    }
}

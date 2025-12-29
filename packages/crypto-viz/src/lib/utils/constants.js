export const SUPPORTED_CRYPTOS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'sui', symbol: 'SUI', name: 'Sui' }
];

export const TIMEFRAMES = [
    { days: 1, label: '1D' },
    { days: 7, label: '7D' },
    { days: 14, label: '14D' },
    { days: 30, label: '1M' },
    { days: 60, label: '2M' },
    { days: 90, label: '3M' },
    { days: 180, label: '6M' },
    { days: 365, label: '1Y' }
];

export const DATA_SOURCES = {
    coingecko: {
        id: 'coingecko',
        name: 'CoinGecko',
        baseUrl: 'https://api.coingecko.com/api/v3',
        intervals: [
            { id: 'auto', label: 'Auto', seconds: null }
        ],
        intervalsByTimeframe: {
            1: [{ id: 'auto', label: '30min', seconds: 1800 }],
            7: [{ id: 'auto', label: '4h', seconds: 14400 }],
            14: [{ id: 'auto', label: '4h', seconds: 14400 }],
            30: [{ id: 'auto', label: '4h', seconds: 14400 }],
            60: [{ id: 'auto', label: '4d', seconds: 345600 }],
            90: [{ id: 'auto', label: '4d', seconds: 345600 }],
            180: [{ id: 'auto', label: '4d', seconds: 345600 }],
            365: [{ id: 'auto', label: '4d', seconds: 345600 }]
        },
        maxCandles: 180,
        hasVolume: false
    },
    binance: {
        id: 'binance',
        name: 'Binance',
        baseUrl: 'https://api.binance.com/api/v3',
        intervals: [
            { id: '1m', label: '1min', seconds: 60 },
            { id: '3m', label: '3min', seconds: 180 },
            { id: '5m', label: '5min', seconds: 300 },
            { id: '15m', label: '15min', seconds: 900 },
            { id: '30m', label: '30min', seconds: 1800 },
            { id: '1h', label: '1h', seconds: 3600 },
            { id: '2h', label: '2h', seconds: 7200 },
            { id: '4h', label: '4h', seconds: 14400 },
            { id: '6h', label: '6h', seconds: 21600 },
            { id: '8h', label: '8h', seconds: 28800 },
            { id: '12h', label: '12h', seconds: 43200 },
            { id: '1d', label: '1d', seconds: 86400 },
            { id: '3d', label: '3d', seconds: 259200 },
            { id: '1w', label: '1w', seconds: 604800 }
        ],
        intervalsByTimeframe: {
            1: [
                { id: '15m', label: '15min', seconds: 900 },
                { id: '30m', label: '30min', seconds: 1800 },
                { id: '1h', label: '1h', seconds: 3600 }
            ],
            7: [
                { id: '1h', label: '1h', seconds: 3600 },
                { id: '2h', label: '2h', seconds: 7200 },
                { id: '4h', label: '4h', seconds: 14400 }
            ],
            14: [
                { id: '2h', label: '2h', seconds: 7200 },
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '6h', label: '6h', seconds: 21600 }
            ],
            30: [
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '6h', label: '6h', seconds: 21600 },
                { id: '12h', label: '12h', seconds: 43200 }
            ],
            60: [
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '6h', label: '6h', seconds: 21600 },
                { id: '12h', label: '12h', seconds: 43200 }
            ],
            90: [
                { id: '6h', label: '6h', seconds: 21600 },
                { id: '12h', label: '12h', seconds: 43200 },
                { id: '1d', label: '1d', seconds: 86400 }
            ],
            180: [
                { id: '12h', label: '12h', seconds: 43200 },
                { id: '1d', label: '1d', seconds: 86400 },
                { id: '3d', label: '3d', seconds: 259200 }
            ],
            365: [
                { id: '1d', label: '1d', seconds: 86400 },
                { id: '3d', label: '3d', seconds: 259200 },
                { id: '1w', label: '1w', seconds: 604800 }
            ]
        },
        maxCandles: 1000,
        hasVolume: true
    },
    coinbase: {
        id: 'coinbase',
        name: 'Coinbase',
        baseUrl: 'https://api.exchange.coinbase.com',
        intervals: [
            { id: '60', label: '1min', seconds: 60 },
            { id: '300', label: '5min', seconds: 300 },
            { id: '900', label: '15min', seconds: 900 },
            { id: '3600', label: '1h', seconds: 3600 },
            { id: '21600', label: '6h', seconds: 21600 },
            { id: '86400', label: '1d', seconds: 86400 }
        ],
        intervalsByTimeframe: {
            1: [
                { id: '300', label: '5min', seconds: 300 },
                { id: '900', label: '15min', seconds: 900 }
            ],
            7: [
                { id: '900', label: '15min', seconds: 900 },
                { id: '3600', label: '1h', seconds: 3600 }
            ],
            14: [
                { id: '3600', label: '1h', seconds: 3600 },
                { id: '21600', label: '6h', seconds: 21600 }
            ],
            30: [
                { id: '3600', label: '1h', seconds: 3600 },
                { id: '21600', label: '6h', seconds: 21600 }
            ],
            60: [
                { id: '21600', label: '6h', seconds: 21600 },
                { id: '86400', label: '1d', seconds: 86400 }
            ],
            90: [
                { id: '21600', label: '6h', seconds: 21600 },
                { id: '86400', label: '1d', seconds: 86400 }
            ],
            180: [
                { id: '86400', label: '1d', seconds: 86400 }
            ],
            365: [
                { id: '86400', label: '1d', seconds: 86400 }
            ]
        },
        maxCandles: 300,
        hasVolume: true
    },
    hyperliquid: {
        id: 'hyperliquid',
        name: 'Hyperliquid',
        baseUrl: 'https://api.hyperliquid.xyz',
        intervals: [
            { id: '1m', label: '1min', seconds: 60 },
            { id: '5m', label: '5min', seconds: 300 },
            { id: '15m', label: '15min', seconds: 900 },
            { id: '30m', label: '30min', seconds: 1800 },
            { id: '1h', label: '1h', seconds: 3600 },
            { id: '2h', label: '2h', seconds: 7200 },
            { id: '4h', label: '4h', seconds: 14400 },
            { id: '8h', label: '8h', seconds: 28800 },
            { id: '12h', label: '12h', seconds: 43200 },
            { id: '1d', label: '1d', seconds: 86400 },
            { id: '3d', label: '3d', seconds: 259200 },
            { id: '1w', label: '1w', seconds: 604800 }
        ],
        intervalsByTimeframe: {
            1: [
                { id: '15m', label: '15min', seconds: 900 },
                { id: '30m', label: '30min', seconds: 1800 },
                { id: '1h', label: '1h', seconds: 3600 }
            ],
            7: [
                { id: '1h', label: '1h', seconds: 3600 },
                { id: '2h', label: '2h', seconds: 7200 },
                { id: '4h', label: '4h', seconds: 14400 }
            ],
            14: [
                { id: '2h', label: '2h', seconds: 7200 },
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '8h', label: '8h', seconds: 28800 }
            ],
            30: [
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '8h', label: '8h', seconds: 28800 },
                { id: '12h', label: '12h', seconds: 43200 }
            ],
            60: [
                { id: '4h', label: '4h', seconds: 14400 },
                { id: '8h', label: '8h', seconds: 28800 },
                { id: '12h', label: '12h', seconds: 43200 }
            ],
            90: [
                { id: '8h', label: '8h', seconds: 28800 },
                { id: '12h', label: '12h', seconds: 43200 },
                { id: '1d', label: '1d', seconds: 86400 }
            ],
            180: [
                { id: '12h', label: '12h', seconds: 43200 },
                { id: '1d', label: '1d', seconds: 86400 },
                { id: '3d', label: '3d', seconds: 259200 }
            ],
            365: [
                { id: '1d', label: '1d', seconds: 86400 },
                { id: '3d', label: '3d', seconds: 259200 },
                { id: '1w', label: '1w', seconds: 604800 }
            ]
        },
        maxCandles: 5000,
        hasVolume: true
    },
    yahoo: {
        id: 'yahoo',
        name: 'Yahoo',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        intervals: [
            { id: '15m', label: '15min', seconds: 900 },
            { id: '30m', label: '30min', seconds: 1800 },
            { id: '1h', label: '1h', seconds: 3600 },
            { id: '1d', label: '1d', seconds: 86400 },
            { id: '1wk', label: '1w', seconds: 604800 }
        ],
        intervalsByTimeframe: {
            1: [
                { id: '15m', label: '15min', seconds: 900 },
                { id: '30m', label: '30min', seconds: 1800 }
            ],
            7: [
                { id: '30m', label: '30min', seconds: 1800 },
                { id: '1h', label: '1h', seconds: 3600 }
            ],
            14: [
                { id: '1h', label: '1h', seconds: 3600 }
            ],
            30: [
                { id: '1h', label: '1h', seconds: 3600 }
            ],
            60: [
                { id: '1h', label: '1h', seconds: 3600 },
                { id: '1d', label: '1d', seconds: 86400 }
            ],
            90: [
                { id: '1d', label: '1d', seconds: 86400 }
            ],
            180: [
                { id: '1d', label: '1d', seconds: 86400 }
            ],
            365: [
                { id: '1d', label: '1d', seconds: 86400 },
                { id: '1wk', label: '1w', seconds: 604800 }
            ]
        },
        maxCandles: 500,
        hasVolume: true
    }
};

export const DATA_SOURCES_LIST = Object.values(DATA_SOURCES);

export function getAvailableIntervals(sourceId, days) {
    const source = DATA_SOURCES[sourceId];
    if (!source) return [];
    return source.intervalsByTimeframe[days] || source.intervalsByTimeframe[30] || [];
}

export function getDefaultInterval(sourceId, days) {
    const intervals = getAvailableIntervals(sourceId, days);
    return intervals[0] || null;
}

export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export const DEFAULT_SETTINGS = {
    timeframe: 30,
    interval: null,
    refreshInterval: 30,
    candlestickHeight: 400,
    dataSource: 'coingecko',
    indicators: {
        stochastic: { enabled: true, kPeriod: 14, dPeriod: 3, smooth: 3 },
        stochasticRSI: { enabled: true, rsiPeriod: 14, stochPeriod: 14, kPeriod: 3, dPeriod: 3 },
        kalman: { enabled: true, processNoise: 0.01, measurementNoise: 0.1 }
    }
};

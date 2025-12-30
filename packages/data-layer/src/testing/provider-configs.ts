/**
 * Test configurations for each provider
 */

import type { ProviderTestConfig } from './types';
import { getMaxAgeForProvider } from './quality-checker';

/**
 * Provider test configurations with sensible defaults for testing
 */
export const PROVIDER_TEST_CONFIGS: Record<string, ProviderTestConfig> = {
  fred: {
    name: 'FRED',
    configBuilder: () => ({
      seriesId: 'M2SL', // M2 Money Supply
      limit: 100,
    }),
    maxAgeMs: getMaxAgeForProvider('fred'),
    expectedMinPoints: 50,
  },

  coingecko: {
    name: 'CoinGecko',
    configBuilder: () => ({
      coinId: 'bitcoin',
      vsCurrency: 'usd',
      days: 30,
    }),
    maxAgeMs: getMaxAgeForProvider('coingecko'),
    expectedMinPoints: 20,
  },

  yahoo: {
    name: 'Yahoo Finance',
    configBuilder: () => ({
      symbol: '^GSPC', // S&P 500
      interval: '1d',
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 90 days ago
      },
    }),
    maxAgeMs: getMaxAgeForProvider('yahoo'),
    expectedMinPoints: 60,
  },

  worldbank: {
    name: 'World Bank',
    configBuilder: () => ({
      indicatorCode: 'NY.GDP.MKTP.CD', // GDP (current US$)
      countryCode: 'USA',
      dateRange: {
        start: 2010,
        end: 2024,
      },
    }),
    maxAgeMs: getMaxAgeForProvider('worldbank'),
    expectedMinPoints: 10,
  },

  bls: {
    name: 'BLS',
    configBuilder: () => ({
      seriesId: 'LNS14000000', // Unemployment Rate
      dateRange: {
        startYear: 2020,
        endYear: 2024,
      },
    }),
    maxAgeMs: getMaxAgeForProvider('bls'),
    expectedMinPoints: 40,
  },

  treasury: {
    name: 'Treasury',
    configBuilder: () => ({
      dataset: 'debt_to_penny',
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 90 days ago
      },
    }),
    maxAgeMs: getMaxAgeForProvider('treasury'),
    expectedMinPoints: 60,
  },

  hyperliquid: {
    name: 'Hyperliquid',
    configBuilder: () => ({
      coin: 'BTC',
      dataType: 'candles',
      interval: '1d',
      dateRange: {
        startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        endTime: Date.now(),
      },
    }),
    maxAgeMs: getMaxAgeForProvider('hyperliquid'),
    expectedMinPoints: 20,
  },

  alphavantage: {
    name: 'Alpha Vantage',
    configBuilder: () => ({
      function: 'TIME_SERIES_DAILY',
      symbol: 'AAPL',
      outputsize: 'compact',
    }),
    maxAgeMs: getMaxAgeForProvider('alphavantage'),
    expectedMinPoints: 50,
  },

  quandl: {
    name: 'Quandl',
    configBuilder: () => ({
      databaseCode: 'LBMA',
      datasetCode: 'GOLD',
      rows: 100,
    }),
    maxAgeMs: getMaxAgeForProvider('quandl'),
    expectedMinPoints: 50,
  },

  imf: {
    name: 'IMF',
    configBuilder: () => ({
      databaseId: 'IFS',
      indicator: 'NGDP_R_SA_XDC', // Real GDP
      frequency: 'Q',
      countryCode: 'USA',
      startPeriod: '2020',
    }),
    maxAgeMs: getMaxAgeForProvider('imf'),
    expectedMinPoints: 12,
  },

  oecd: {
    name: 'OECD',
    configBuilder: () => ({
      dataset: 'QNA',
      indicator: 'GDP',
      location: 'USA',
      frequency: 'Q',
      startTime: '2020-Q1',
    }),
    maxAgeMs: getMaxAgeForProvider('oecd'),
    expectedMinPoints: 12,
  },
};

/**
 * Get all provider names
 */
export function getAllProviderNames(): string[] {
  return Object.keys(PROVIDER_TEST_CONFIGS);
}

/**
 * Get provider test config by name (case-insensitive)
 */
export function getProviderTestConfig(
  providerName: string
): ProviderTestConfig | undefined {
  const key = providerName.toLowerCase();
  return PROVIDER_TEST_CONFIGS[key];
}

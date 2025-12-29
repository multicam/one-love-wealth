import type { EnhancedGraphDefinition } from '../types/graph-definition';

/**
 * Enhanced graph definitions using the new data provider system
 *
 * Key improvements over legacy format:
 * - Server-side YoY calculations via FRED units=pc1
 * - Client-side transforms for providers that don't support them
 * - Type-safe chart configurations
 * - Sophisticated time alignment (lead/lag)
 * - Multi-provider support
 *
 * NOTE: This file contains example migrations. The full migration of all 46 graphs
 * should be done in batches with verification at each step.
 */
export const ENHANCED_GRAPHS_LIST: EnhancedGraphDefinition[] = [
  // === GRAPH 15: ISM vs Liquidity (YoY) ===
  // BEFORE: Described "M2 YoY" but used raw M2SL values
  // AFTER: Real YoY percentage from FRED units=pc1
  {
    id: '15',
    title: '15. ISM vs Liquidity (YoY)',
    description: 'ISM PMI vs M2 YoY Growth (Lead 6 months). Now using FRED server-side YoY calculation.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism-pmi',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'm2-yoy',
        name: 'M2 YoY',
        seriesId: 'M2SL',
        units: 'pc1', // ⭐ Server-side YoY calculation!
        display: { color: '#3b82f6', label: 'M2 YoY %', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [
        {
          seriesIndex: 1,
          months: 6,
          direction: 'lead',
          description: 'M2 leads by 6 months'
        }
      ]
    }
  },

  // === GRAPH 36: Liquidity Index YoY% ===
  // BEFORE: Described "YoY%" but used raw M2SL values
  // AFTER: Real YoY percentage from FRED units=pc1
  {
    id: '36',
    title: '36. Liquidity Index YoY%',
    description: 'Total Liquidity Index Year-over-Year percentage change.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2-yoy',
        name: 'M2 YoY',
        seriesId: 'M2SL',
        units: 'pc1', // ⭐ Server-side YoY calculation!
        display: { color: '#3b82f6', label: 'M2 YoY %' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 19: Liquidity vs Bitcoin Correlation ===
  // BEFORE: Line chart (approximate)
  // AFTER: Proper scatter plot with regression line
  {
    id: '19',
    title: '19. Liquidity vs Bitcoin Correlation',
    description: 'Weekly Liquidity vs Bitcoin relationship (2013-Today). Strong positive correlation.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'M2 Money Supply',
        seriesId: 'M2SL',
        frequency: 'w', // Aggregate to weekly
        aggregationMethod: 'avg',
        display: { color: '#3b82f6', label: 'M2' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'scatter',
      regression: true,
      trendline: true,
      yAxisLog: true
    }
  },

  // === GRAPH 2: Digital Assets Performance ===
  // BEFORE: Different scales, hard to compare
  // AFTER: Normalized to 100 at start for easy comparison
  {
    id: '2',
    title: '2. Digital Assets Performance',
    description: 'Bitcoin vs major asset classes. Normalized to 100 for comparison.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      },
      {
        type: 'fred',
        id: 'sp500',
        name: 'S&P 500',
        seriesId: 'SP500',
        display: { color: '#3b82f6', label: 'S&P 500' }
      },
      {
        type: 'fred',
        id: 'gold',
        name: 'Commodities',
        seriesId: 'PPIACO',
        display: { color: '#fbbf24', label: 'Commodities (Gold Proxy)' }
      }
    ],
    transforms: [
      // Normalize all series to 100 at start
      { operation: { type: 'normalize', base: 100 } }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: false
    },
    timeAlignment: {
      dateRange: { start: '2013-01-01' } // Bitcoin data starts ~2013
    }
  },

  // === GRAPH 3: Bitcoin vs ISM ===
  // Multi-provider graph with log scale
  {
    id: '3',
    title: '3. Bitcoin vs ISM',
    description: 'Bitcoin price (Log scale) overlaid with ISM Manufacturing PMI.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC Price', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true,
      dualAxis: true
    }
  },

  // === GRAPH 1: ISM vs Interest Rate Model ===
  // Time shift example
  {
    id: '1',
    title: '1. ISM vs Interest Rate Model',
    description: 'ISM PMI vs 10Y Treasury Yield. Rates often lead the business cycle by ~6 months.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: '10y-treasury',
        name: '10Y Treasury',
        seriesId: 'GS10',
        display: { color: '#3b82f6', label: 'Rates (Inverted)', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [
        {
          seriesIndex: 1,
          months: 6,
          direction: 'lead',
          description: 'Rates lead ISM by ~6 months'
        }
      ]
    }
  },

  // === EXAMPLE: Bitcoin YoY (Client-Side Transform) ===
  // Demonstrates client-side YoY when server can't provide it
  {
    id: 'btc-yoy-example',
    title: 'Example: Bitcoin YoY (Client-Side)',
    description: 'Bitcoin Year-over-Year percentage change calculated client-side (CoinGecko does not have YoY parameter).',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC YoY %' }
      }
    ],
    transforms: [
      // Client-side YoY calculation (365 days = 1 year)
      { operation: { type: 'yoy', periods: 365 } }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 4: ISM vs Financial Conditions ===
  {
    id: '4',
    title: '4. ISM vs Financial Conditions',
    description: 'ISM PMI vs Financial Conditions Index (Proxy: Chicago Fed NFCI). FCI leads ISM by ~9 months.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'nfci',
        name: 'Chicago Fed NFCI',
        seriesId: 'NFCI',
        display: { color: '#8b5cf6', label: 'FCI', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 1,
        months: 9,
        direction: 'lead',
        description: 'FCI leads ISM by ~9 months'
      }]
    }
  },

  // === GRAPH 5: US Government Debt % GDP ===
  {
    id: '5',
    title: '5. US Government Debt % GDP',
    description: 'Total Federal Debt as a percentage of GDP. Shows the long-term trend of fiscal dominance.',
    dataSources: [
      {
        type: 'fred',
        id: 'debt-gdp',
        name: 'Debt/GDP',
        seriesId: 'GFDEGDQ188S',
        display: { color: '#ef4444', label: 'Debt % GDP' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 6: ISM vs Industrial Metals ===
  {
    id: '6',
    title: '6. ISM vs Industrial Metals',
    description: 'ISM PMI vs Industrial Metals Price Index (Producer Price Index proxy).',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'metals',
        name: 'Industrial Metals',
        seriesId: 'WPU10',
        display: { color: '#f97316', label: 'Metals PPI', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 7: US Labor Force Participation ===
  {
    id: '7',
    title: '7. US Labor Force Participation',
    description: 'Civilian Labor Force Participation Rate. A structural economic indicator.',
    dataSources: [
      {
        type: 'fred',
        id: 'participation',
        name: 'Participation Rate',
        seriesId: 'CIVPART',
        display: { color: '#64748b', label: 'Participation %' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 8: ISM vs S&P 500 YoY ===
  {
    id: '8',
    title: '8. ISM vs S&P 500 YoY',
    description: 'ISM PMI vs S&P 500 Year-over-Year change.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'sp500-yoy',
        name: 'S&P 500 YoY',
        seriesId: 'SP500',
        units: 'pc1', // Server-side YoY
        display: { color: '#3b82f6', label: 'S&P 500 YoY %', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 9: US Real GDP YoY ===
  {
    id: '9',
    title: '9. US Real GDP YoY',
    description: 'Real Gross Domestic Product, Percent Change from Year Ago.',
    dataSources: [
      {
        type: 'fred',
        id: 'gdp-yoy',
        name: 'Real GDP YoY',
        seriesId: 'GDPC1',
        units: 'pc1', // Server-side YoY
        display: { color: '#3b82f6', label: 'Real GDP YoY %' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 10: Fed Net Liquidity vs Debt ===
  {
    id: '10',
    title: '10. Fed Net Liquidity vs Debt',
    description: 'Correlation between Fed Net Liquidity and Government Debt levels.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'Net Liquidity (Proxy M2)',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'Liquidity', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'debt-gdp',
        name: 'Debt % GDP',
        seriesId: 'GFDEGDQ188S',
        display: { color: '#ef4444', label: 'Debt', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 11: ISM vs BTC Dominance ===
  {
    id: '11',
    title: '11. ISM vs BTC Dominance',
    description: 'ISM PMI vs Bitcoin Dominance. Rising ISM often coincides with Altcoin season (Lower BTC Dom).',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC (Proxy for Dom)', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 12: ISM vs ETH/BTC Ratio ===
  {
    id: '12',
    title: '12. ISM vs ETH/BTC Ratio',
    description: 'Ethereum strength relative to Bitcoin often correlates with business cycle expansion (Rising ISM).',
    dataSources: [
      {
        type: 'coingecko',
        id: 'eth',
        name: 'ETH/BTC',
        coinId: 'ethereum',
        display: { color: '#8b5cf6', label: 'ETH Price (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 13: Economic Surprise vs Bitcoin ===
  {
    id: '13',
    title: '13. Economic Surprise vs Bitcoin',
    description: 'Economic Surprise Index proxy (Consumer Sentiment) vs Bitcoin Momentum.',
    dataSources: [
      {
        type: 'fred',
        id: 'sentiment',
        name: 'Sentiment',
        seriesId: 'UMCSENT',
        display: { color: '#3b82f6', label: 'Sentiment', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 1,
        months: 1,
        direction: 'lead',
        description: 'Sentiment leads BTC by 1 month'
      }]
    }
  },

  // === GRAPH 14: Bitcoin vs Global Liquidity ===
  {
    id: '14',
    title: '14. Bitcoin vs Global Liquidity',
    description: 'Bitcoin tracks Global Liquidity (M2) closely.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'm2',
        name: 'Global M2 (Proxy)',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true,
      yAxisLog: true
    }
  },

  // === GRAPH 16: Liquidity YoY vs Financial Conditions ===
  {
    id: '16',
    title: '16. Liquidity YoY vs Financial Conditions',
    description: 'M2 YoY% vs Financial Conditions Index (Lead 3 months).',
    dataSources: [
      {
        type: 'fred',
        id: 'm2-yoy',
        name: 'M2 YoY',
        seriesId: 'M2SL',
        units: 'pc1', // Server-side YoY
        display: { color: '#3b82f6', label: 'M2 YoY %', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'nfci',
        name: 'Chicago Fed NFCI',
        seriesId: 'NFCI',
        display: { color: '#8b5cf6', label: 'FCI', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 0,
        months: 3,
        direction: 'lead',
        description: 'M2 leads FCI by 3 months'
      }]
    }
  },

  // === GRAPH 17: Liquidity Trend ===
  {
    id: '17',
    title: '17. Liquidity Trend',
    description: 'Global Liquidity Index (M2) showing long-term growth trend with 8% annualized rate.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'M2 Money Supply',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 18: Liquidity Index vs Bitcoin ===
  {
    id: '18',
    title: '18. Liquidity Index vs Bitcoin',
    description: 'Total Liquidity Index ($BN) vs Bitcoin price.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'M2 Money Supply',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true,
      yAxisLog: true
    }
  },

  // === GRAPH 20: US Total Debt % GDP ===
  {
    id: '20',
    title: '20. US Total Debt % GDP',
    description: 'Total Public + Private Debt as % of GDP.',
    dataSources: [
      {
        type: 'fred',
        id: 'total-debt',
        name: 'Total Debt',
        seriesId: 'TOTDTEUSQ163N',
        display: { color: '#ef4444', label: 'Total Debt' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 21: DXY Dollar Index ===
  {
    id: '21',
    title: '21. DXY Dollar Index',
    description: 'Trade Weighted U.S. Dollar Index.',
    dataSources: [
      {
        type: 'fred',
        id: 'dxy',
        name: 'DXY',
        seriesId: 'DTWEXBGS',
        display: { color: '#10b981', label: 'DXY' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 22: Bitcoin Historical Comparison ===
  {
    id: '22',
    title: '22. Bitcoin Historical Comparison',
    description: 'Bitcoin: January 2020-April 2021 cycle comparison with current price action.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 23: Labor Force vs Debt ===
  {
    id: '23',
    title: '23. Labor Force vs Debt',
    description: 'Labor Force Participation vs Debt % GDP (Inverted).',
    dataSources: [
      {
        type: 'fred',
        id: 'participation',
        name: 'Participation',
        seriesId: 'CIVPART',
        display: { color: '#64748b', label: 'Labor', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'debt-gdp',
        name: 'Debt % GDP',
        seriesId: 'GFDEGDQ188S',
        display: { color: '#ef4444', label: 'Debt', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 24: Bitcoin Log Scale with Trends ===
  {
    id: '24',
    title: '24. Bitcoin Log Scale with Trends',
    description: 'Bitcoin price on log scale with long-term trend lines.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 25: Labor Force vs Birth Rate ===
  {
    id: '25',
    title: '25. Labor Force vs Birth Rate',
    description: 'Labor Force Participation vs Birth Rate (Lead 16 Years / 192 months).',
    dataSources: [
      {
        type: 'fred',
        id: 'participation',
        name: 'Participation',
        seriesId: 'CIVPART',
        display: { color: '#64748b', label: 'Labor', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'birth-rate',
        name: 'Birth Rate',
        seriesId: 'SPDYNCBRTINUSA',
        display: { color: '#f472b6', label: 'Birth Rate', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 1,
        months: 192,
        direction: 'lead',
        description: 'Birth Rate leads Labor Force by 16 years'
      }]
    }
  },

  // === GRAPH 26: ISM vs 4-Year Cycle ===
  {
    id: '26',
    title: '26. ISM vs 4-Year Cycle',
    description: 'ISM PMI fitted with a 4-year sine wave to identify business cycle phases.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 27: Liquidity vs Interest Payments ===
  {
    id: '27',
    title: '27. Liquidity vs Interest Payments',
    description: 'Fed Net Liquidity vs Govt Interest Payments (Lead 36 months).',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'Liquidity',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'interest',
        name: 'Interest',
        seriesId: 'A091RC1Q027SBEA',
        display: { color: '#ef4444', label: 'Interest', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 0,
        months: 36,
        direction: 'lead',
        description: 'Liquidity leads Interest Payments by 36 months'
      }]
    }
  },

  // === GRAPH 28: Productivity Growth ===
  {
    id: '28',
    title: '28. Productivity Growth',
    description: 'Nonfarm Business Sector: Output Per Hour of All Persons (5Y change).',
    dataSources: [
      {
        type: 'fred',
        id: 'productivity',
        name: 'Productivity',
        seriesId: 'OPHNFB',
        display: { color: '#10b981', label: 'Productivity' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 29: ISM vs Bitcoin Implied Pricing ===
  {
    id: '29',
    title: '29. ISM vs Bitcoin Implied Pricing',
    description: 'ISM PMI vs Bitcoin-derived implied ISM from regression model.',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true,
      yAxisLog: true
    }
  },

  // === GRAPH 30: US Birth Rate ===
  {
    id: '30',
    title: '30. US Birth Rate',
    description: 'Birth Rate, Crude (per 1,000 people).',
    dataSources: [
      {
        type: 'fred',
        id: 'birth-rate',
        name: 'Birth Rate',
        seriesId: 'SPDYNCBRTINUSA',
        display: { color: '#f472b6', label: 'Birth Rate' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 31: Bitcoin 2015-2017 Cycle ===
  {
    id: '31',
    title: '31. Bitcoin 2015-2017 Cycle',
    description: 'Bitcoin: December 2015-December 2017 cycle comparison with current.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 32: NASDAQ vs Bitcoin ===
  {
    id: '32',
    title: '32. NASDAQ vs Bitcoin',
    description: 'NASDAQ 100 vs Bitcoin correlation.',
    dataSources: [
      {
        type: 'fred',
        id: 'nasdaq',
        name: 'NASDAQ 100',
        seriesId: 'NASDAQ100',
        display: { color: '#3b82f6', label: 'NDX', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true,
      yAxisLog: true
    }
  },

  // === GRAPH 33: Crypto Market Cap Context ===
  {
    id: '33',
    title: '33. Crypto Market Cap Context',
    description: 'Digital assets at ~$3T market cap. Comparison with Gold and M2 money supply.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC (Crypto Proxy)' }
      },
      {
        type: 'fred',
        id: 'gold',
        name: 'Gold',
        seriesId: 'PPIACO',
        display: { color: '#fbbf24', label: 'Commodities (Gold Proxy)' }
      },
      {
        type: 'fred',
        id: 'm2',
        name: 'M2',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 34: ISM vs 5.4-Year Cycle ===
  {
    id: '34',
    title: '34. ISM vs 5.4-Year Cycle',
    description: 'ISM PMI fitted with a 5.4-year sine wave (Kitchin cycle).',
    dataSources: [
      {
        type: 'fred',
        id: 'ism',
        name: 'ISM PMI',
        seriesId: 'IPMAN',
        display: { color: '#10b981', label: 'ISM (Proxy)' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 35: Debt Maturity Distribution ===
  {
    id: '35',
    title: '35. Debt Maturity Distribution',
    description: 'Marketable Interest-Bearing Public Debt maturity profile. Proxy: Total Public Debt.',
    dataSources: [
      {
        type: 'fred',
        id: 'public-debt',
        name: 'Public Debt',
        seriesId: 'GFDEBTN',
        display: { color: '#ef4444', label: 'Public Debt' }
      }
    ],
    chartConfig: {
      type: 'line' // Note: Original was bar chart, could be enhanced to 'bar' when implemented
    }
  },

  // === GRAPH 37: Global M2 vs Bitcoin ===
  {
    id: '37',
    title: '37. Global M2 vs Bitcoin',
    description: 'Global M2 (Lead 12 weeks / 3 months) vs Bitcoin.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'Global M2',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 0,
        months: 3,
        direction: 'lead',
        description: 'M2 leads Bitcoin by 12 weeks'
      }]
    }
  },

  // === GRAPH 38: NASDAQ vs Liquidity Index ===
  {
    id: '38',
    title: '38. NASDAQ vs Liquidity Index',
    description: 'NASDAQ 100 vs Total Liquidity Index (January 2012=100).',
    dataSources: [
      {
        type: 'fred',
        id: 'nasdaq',
        name: 'NASDAQ 100',
        seriesId: 'NASDAQ100',
        display: { color: '#3b82f6', label: 'NDX', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'm2',
        name: 'M2',
        seriesId: 'M2SL',
        display: { color: '#8b5cf6', label: 'M2', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    }
  },

  // === GRAPH 39: Global M2 vs NASDAQ ===
  {
    id: '39',
    title: '39. Global M2 vs NASDAQ',
    description: 'Global M2 (Lead 12 weeks / 3 months) vs NASDAQ 100.',
    dataSources: [
      {
        type: 'fred',
        id: 'm2',
        name: 'Global M2',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'nasdaq',
        name: 'NASDAQ 100',
        seriesId: 'NASDAQ100',
        display: { color: '#8b5cf6', label: 'NDX', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 0,
        months: 3,
        direction: 'lead',
        description: 'M2 leads NASDAQ by 12 weeks'
      }]
    }
  },

  // === GRAPH 40: Bitcoin 2018-2019 Cycle ===
  {
    id: '40',
    title: '40. Bitcoin 2018-2019 Cycle',
    description: 'Bitcoin: November 2018-July 2019 cycle comparison with current.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // === GRAPH 41: Bitcoin vs Gold ===
  {
    id: '41',
    title: '41. Bitcoin vs Gold',
    description: 'Bitcoin vs Gold (Lead 188 days / ~6 months).',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'gold',
        name: 'Gold',
        seriesId: 'PPIACO',
        display: { color: '#fbbf24', label: 'Commodities (Gold Proxy)', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      shifts: [{
        seriesIndex: 1,
        months: 6,
        direction: 'lead',
        description: 'Gold leads Bitcoin by ~6 months'
      }]
    }
  },

  // === GRAPH 42: Public Debt % GDP ===
  {
    id: '42',
    title: '42. Public Debt % GDP',
    description: 'Federal Debt: Total Public Debt as Percent of GDP.',
    dataSources: [
      {
        type: 'fred',
        id: 'public-debt-gdp',
        name: 'Public Debt',
        seriesId: 'GFDEGDQ188S',
        display: { color: '#ef4444', label: 'Public Debt' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 43: NASDAQ Total Return vs Bitcoin ===
  {
    id: '43',
    title: '43. NASDAQ Total Return vs Bitcoin',
    description: 'NASDAQ 100 Total Return vs Bitcoin (January 2012=100).',
    dataSources: [
      {
        type: 'fred',
        id: 'nasdaq',
        name: 'NASDAQ 100',
        seriesId: 'NASDAQ100',
        display: { color: '#3b82f6', label: 'NDX', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true,
      yAxisLog: true
    }
  },

  // === GRAPH 44: US Private Debt % GDP ===
  {
    id: '44',
    title: '44. US Private Debt % GDP',
    description: 'Total Private Debt as % of GDP (Proxy: Household Debt Service Ratio).',
    dataSources: [
      {
        type: 'fred',
        id: 'household-debt',
        name: 'Household Debt',
        seriesId: 'TDSP',
        display: { color: '#f97316', label: 'Debt Service' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 45: GDP Growth Components ===
  {
    id: '45',
    title: '45. GDP Growth Components',
    description: 'The Magic Formula: GDP Growth = Population Growth + Productivity Growth + Debt Growth.',
    dataSources: [
      {
        type: 'fred',
        id: 'gdp',
        name: 'Real GDP',
        seriesId: 'GDPC1',
        display: { color: '#3b82f6', label: 'GDP' }
      },
      {
        type: 'fred',
        id: 'productivity',
        name: 'Productivity',
        seriesId: 'OPHNFB',
        display: { color: '#10b981', label: 'Productivity' }
      },
      {
        type: 'fred',
        id: 'debt',
        name: 'Debt',
        seriesId: 'GFDEGDQ188S',
        display: { color: '#ef4444', label: 'Debt' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 46: Bitcoin Cycles (Log) ===
  {
    id: '46',
    title: '46. Bitcoin Cycles (Log)',
    description: 'Long-term Bitcoin price history on a logarithmic scale to visualize cycle phases and "Banana Zones".',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    chartConfig: {
      type: 'line',
      yAxisLog: true
    }
  },

  // ===========================
  // Phase 16B: New Graphs Using Underutilized Providers
  // ===========================

  // === GRAPH 47: S&P 500 vs NASDAQ 100 (Yahoo) ===
  {
    id: '47',
    title: '47. S&P 500 vs NASDAQ 100 Correlation',
    description: 'Compare the performance of S&P 500 and NASDAQ 100 indices to identify divergences between broad market and tech-heavy sectors.',
    dataSources: [
      {
        type: 'yahoo',
        id: 'sp500',
        name: 'S&P 500',
        symbol: '^GSPC',
        interval: '1d',
        display: { color: '#3b82f6', label: 'S&P 500', yAxisId: 'left' }
      },
      {
        type: 'yahoo',
        id: 'nasdaq100',
        name: 'NASDAQ 100',
        symbol: '^NDX',
        interval: '1d',
        display: { color: '#8b5cf6', label: 'NASDAQ 100', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 500
    }
  },

  // === GRAPH 48: VIX vs Market Performance (Yahoo) ===
  {
    id: '48',
    title: '48. VIX Fear Index vs S&P 500',
    description: 'Volatility Index (VIX) inversely correlates with stock market performance. Rising VIX signals increased market fear and uncertainty.',
    dataSources: [
      {
        type: 'yahoo',
        id: 'vix',
        name: 'VIX',
        symbol: '^VIX',
        interval: '1d',
        display: { color: '#ef4444', label: 'VIX', yAxisId: 'left' }
      },
      {
        type: 'yahoo',
        id: 'sp500',
        name: 'S&P 500',
        symbol: '^GSPC',
        interval: '1d',
        display: { color: '#10b981', label: 'S&P 500', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 500
    }
  },

  // === GRAPH 49: Tech Stocks vs Bitcoin (Yahoo + CoinGecko) ===
  {
    id: '49',
    title: '49. Tech Giants vs Bitcoin',
    description: 'Compare performance of major tech stocks (AAPL, MSFT, GOOGL) against Bitcoin to identify correlation patterns.',
    dataSources: [
      {
        type: 'yahoo',
        id: 'aapl',
        name: 'Apple',
        symbol: 'AAPL',
        interval: '1d',
        display: { color: '#a3a3a3', label: 'AAPL' }
      },
      {
        type: 'yahoo',
        id: 'msft',
        name: 'Microsoft',
        symbol: 'MSFT',
        interval: '1d',
        display: { color: '#06b6d4', label: 'MSFT' }
      },
      {
        type: 'yahoo',
        id: 'googl',
        name: 'Google',
        symbol: 'GOOGL',
        interval: '1d',
        display: { color: '#ef4444', label: 'GOOGL' }
      },
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 500
    }
  },

  // === GRAPH 50: USA vs China GDP Growth (World Bank) ===
  {
    id: '50',
    title: '50. USA vs China GDP Growth',
    description: 'Annual GDP growth comparison between the world\'s two largest economies. Tracks relative economic momentum.',
    dataSources: [
      {
        type: 'worldbank',
        id: 'usa-gdp-growth',
        name: 'USA GDP Growth',
        indicatorCode: 'NY.GDP.MKTP.KD.ZG',
        countryCode: 'USA',
        display: { color: '#3b82f6', label: 'USA GDP Growth %', yAxisId: 'left' }
      },
      {
        type: 'worldbank',
        id: 'chn-gdp-growth',
        name: 'China GDP Growth',
        indicatorCode: 'NY.GDP.MKTP.KD.ZG',
        countryCode: 'CHN',
        display: { color: '#ef4444', label: 'China GDP Growth %', yAxisId: 'left' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: false
    }
  },

  // === GRAPH 51: Global Debt Levels (World Bank) ===
  {
    id: '51',
    title: '51. Global Government Debt (% of GDP)',
    description: 'Government debt as percentage of GDP for major economies. Rising debt levels constrain future fiscal policy.',
    dataSources: [
      {
        type: 'worldbank',
        id: 'usa-debt',
        name: 'USA Debt',
        indicatorCode: 'GC.DOD.TOTL.GD.ZS',
        countryCode: 'USA',
        display: { color: '#3b82f6', label: 'USA' }
      },
      {
        type: 'worldbank',
        id: 'chn-debt',
        name: 'China Debt',
        indicatorCode: 'GC.DOD.TOTL.GD.ZS',
        countryCode: 'CHN',
        display: { color: '#ef4444', label: 'China' }
      },
      {
        type: 'worldbank',
        id: 'jpn-debt',
        name: 'Japan Debt',
        indicatorCode: 'GC.DOD.TOTL.GD.ZS',
        countryCode: 'JPN',
        display: { color: '#f59e0b', label: 'Japan' }
      },
      {
        type: 'worldbank',
        id: 'eur-debt',
        name: 'Euro Area Debt',
        indicatorCode: 'GC.DOD.TOTL.GD.ZS',
        countryCode: 'EMU',
        display: { color: '#8b5cf6', label: 'Euro Area' }
      }
    ],
    chartConfig: {
      type: 'line'
    }
  },

  // === GRAPH 52: Unemployment vs Labor Force Participation (BLS) ===
  {
    id: '52',
    title: '52. Unemployment vs Labor Force Participation',
    description: 'Unemployment rate vs labor force participation rate. Falling participation can mask true employment weakness.',
    dataSources: [
      {
        type: 'bls',
        id: 'unemployment',
        name: 'Unemployment Rate',
        seriesId: 'LNS14000000',
        display: { color: '#ef4444', label: 'Unemployment %', yAxisId: 'left' }
      },
      {
        type: 'bls',
        id: 'participation',
        name: 'Labor Force Participation',
        seriesId: 'LNS11300000',
        display: { color: '#3b82f6', label: 'Participation %', yAxisId: 'right' }
      }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 300
    }
  },

  // === GRAPH 53: CPI vs PPI Inflation Pressure (BLS) ===
  {
    id: '53',
    title: '53. CPI vs PPI - Inflation Pipeline',
    description: 'Producer Price Index (PPI) leads Consumer Price Index (CPI). Rising PPI signals future consumer inflation pressure.',
    dataSources: [
      {
        type: 'bls',
        id: 'cpi',
        name: 'CPI',
        seriesId: 'CUUR0000SA0',
        display: { color: '#ef4444', label: 'CPI' }
      },
      {
        type: 'bls',
        id: 'ppi',
        name: 'PPI',
        seriesId: 'WPSFD49207',
        display: { color: '#f59e0b', label: 'PPI' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 300
    }
  },

  // === GRAPH 54: Debt Growth vs Interest Rates (Treasury + FRED) ===
  {
    id: '54',
    title: '54. US Debt Growth vs 10Y Yields',
    description: 'Federal debt growth alongside 10-year Treasury yields. Rising debt + rising rates = unsustainable fiscal dynamics.',
    dataSources: [
      {
        type: 'treasury',
        id: 'debt',
        name: 'Total Public Debt',
        dataset: 'debt_to_penny',
        display: { color: '#ef4444', label: 'Total Debt ($T)', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: '10y-yield',
        name: '10Y Yield',
        seriesId: 'DGS10',
        display: { color: '#3b82f6', label: '10Y Yield %', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'scale', factor: 1e-12 }, seriesIndex: 0 } // Convert to trillions
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 500
    }
  },

  // === GRAPH 55: Daily Debt Accumulation (Treasury) ===
  {
    id: '55',
    title: '55. US Daily Debt Trend',
    description: 'Daily US federal debt outstanding. Visualize debt ceiling standoffs and fiscal spending patterns.',
    dataSources: [
      {
        type: 'treasury',
        id: 'daily-debt',
        name: 'Daily Debt',
        dataset: 'debt_to_penny',
        display: { color: '#ef4444', label: 'Total Debt ($T)' }
      }
    ],
    transforms: [
      { operation: { type: 'scale', factor: 1e-12 } } // Convert to trillions
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 1000
    }
  },

  // === GRAPH 56: Bitcoin Funding Rate vs Spot (Hyperliquid) ===
  {
    id: '56',
    title: '56. BTC Perpetual Funding Rate vs Price',
    description: 'Bitcoin perpetual futures funding rate vs spot price. Extreme positive funding signals overheated long positions.',
    dataSources: [
      {
        type: 'hyperliquid',
        id: 'btc-funding',
        name: 'BTC Funding Rate',
        coin: 'BTC',
        dataType: 'fundingHistory',
        display: { color: '#8b5cf6', label: 'Funding Rate %', yAxisId: 'left' }
      },
      {
        type: 'coingecko',
        id: 'btc-price',
        name: 'BTC Price',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC Price', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'scale', factor: 100 }, seriesIndex: 0 } // Convert funding to percentage
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 500
    }
  },

  // =========================================================================
  // Phase 17A: Critical Macro Indicators (Graphs 57-60)
  // =========================================================================

  /**
   * Graph 59: Treasury Yield Curve Spread
   * 10-Year vs 2-Year Treasury yields - recession predictor
   * Data source: Alpha Vantage TREASURY_YIELD
   * Inverted yield curve (2Y > 10Y) historically precedes recessions
   */
  {
    id: '59',
    title: '59. Treasury Yield Curve Spread (10Y-2Y)',
    description:
      'Compare 10-year and 2-year US Treasury yields. An inverted yield curve (when 2-year yields exceed 10-year yields) has historically been a reliable predictor of economic recessions. The spread narrowing or going negative signals market expectations of Fed rate cuts due to economic slowdown.',
    dataSources: [
      {
        type: 'alphavantage',
        id: '10y-treasury',
        name: '10-Year Treasury',
        function: 'TREASURY_YIELD',
        symbol: '10year', // Used as maturity parameter
        display: { color: '#3b82f6', label: '10-Year Yield', yAxisId: 'left' }
      },
      {
        type: 'alphavantage',
        id: '2y-treasury',
        name: '2-Year Treasury',
        function: 'TREASURY_YIELD',
        symbol: '2year', // Used as maturity parameter
        display: { color: '#ef4444', label: '2-Year Yield', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 1000 // ~4 years of daily data
    }
  },

  /**
   * Graph 60: Real GDP vs Stock Market
   * Compare real economic growth to S&P 500 performance
   * Data source: Alpha Vantage REAL_GDP and S&P 500
   * Shows disconnect between markets and economy
   */
  {
    id: '60',
    title: '60. Real GDP vs Stock Market Performance',
    description:
      'Compare real GDP growth to S&P 500 index performance, both normalized to 100. Reveals periods when stock market gains outpace economic fundamentals, or when the economy grows faster than markets reflect. Large divergences may signal overvaluation or undervaluation.',
    dataSources: [
      {
        type: 'alphavantage',
        id: 'real-gdp',
        name: 'Real GDP',
        function: 'REAL_GDP',
        symbol: 'GDP', // Required but not used for economic indicators
        display: { color: '#3b82f6', label: 'Real GDP', yAxisId: 'left' }
      },
      {
        type: 'alphavantage',
        id: 'sp500',
        name: 'S&P 500',
        function: 'TIME_SERIES_DAILY',
        symbol: '^GSPC',
        display: { color: '#10b981', label: 'S&P 500', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 100 // GDP is quarterly, limit to ~25 years
    }
  },

  /**
   * Graph 66: Global Inflation Comparison
   * CPI year-over-year for USA, Eurozone, China, Japan, India
   * Data source: IMF International Financial Statistics
   * Shows diverging global inflation trends and monetary policy impacts
   */
  {
    id: '66',
    title: '66. Global Inflation Comparison (5 Major Economies)',
    description:
      'Year-over-year CPI inflation rates for USA, Eurozone, China, Japan, and India. Reveals diverging inflation dynamics across major economies, reflecting different monetary policies, supply chain pressures, and domestic demand conditions. Useful for understanding global central bank policy coordination challenges.',
    dataSources: [
      {
        type: 'imf',
        id: 'usa-cpi',
        name: 'USA CPI',
        databaseId: 'IFS',
        indicator: 'PCPI_IX',
        frequency: 'M',
        countryCode: 'USA',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'eur-cpi',
        name: 'Eurozone CPI',
        databaseId: 'IFS',
        indicator: 'PCPI_IX',
        frequency: 'M',
        countryCode: 'U2',
        display: { color: '#8b5cf6', label: 'Eurozone', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'chn-cpi',
        name: 'China CPI',
        databaseId: 'IFS',
        indicator: 'PCPI_IX',
        frequency: 'M',
        countryCode: 'CHN',
        display: { color: '#ef4444', label: 'China', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'jpn-cpi',
        name: 'Japan CPI',
        databaseId: 'IFS',
        indicator: 'PCPI_IX',
        frequency: 'M',
        countryCode: 'JPN',
        display: { color: '#f59e0b', label: 'Japan', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'ind-cpi',
        name: 'India CPI',
        databaseId: 'IFS',
        indicator: 'PCPI_IX',
        frequency: 'M',
        countryCode: 'IND',
        display: { color: '#10b981', label: 'India', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'yoy' }, seriesIndex: 0 },
      { operation: { type: 'yoy' }, seriesIndex: 1 },
      { operation: { type: 'yoy' }, seriesIndex: 2 },
      { operation: { type: 'yoy' }, seriesIndex: 3 },
      { operation: { type: 'yoy' }, seriesIndex: 4 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 120 // 10 years of monthly data
    }
  },

  /**
   * Graph 73: Business Confidence Indices
   * OECD Composite Leading Indicators for USA, Eurozone, China, Japan
   * Data source: OECD MEI_CLI dataset
   * Leading indicator of economic turning points
   */
  {
    id: '73',
    title: '73. Business Confidence Indices (OECD CLI)',
    description:
      'OECD Composite Leading Indicators (CLI) for major economies. The CLI is designed to provide early signals of turning points in business cycles, showing fluctuations in economic activity around long-term potential. Values above 100 suggest expansion, below 100 suggest contraction. Watch for divergences between countries.',
    dataSources: [
      {
        type: 'oecd',
        id: 'usa-cli',
        name: 'USA CLI',
        dataset: 'MEI_CLI',
        indicator: 'LOLITOAA',
        location: 'USA',
        frequency: 'M',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'ea-cli',
        name: 'Euro Area CLI',
        dataset: 'MEI_CLI',
        indicator: 'LOLITOAA',
        location: 'EA19',
        frequency: 'M',
        display: { color: '#8b5cf6', label: 'Euro Area', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'chn-cli',
        name: 'China CLI',
        dataset: 'MEI_CLI',
        indicator: 'LOLITOAA',
        location: 'CHN',
        frequency: 'M',
        display: { color: '#ef4444', label: 'China', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'jpn-cli',
        name: 'Japan CLI',
        dataset: 'MEI_CLI',
        indicator: 'LOLITOAA',
        location: 'JPN',
        frequency: 'M',
        display: { color: '#f59e0b', label: 'Japan', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 120 // 10 years of monthly data
    }
  },

  // =========================================================================
  // Phase 17B: International Comparisons (Graphs 61, 67-72, 74)
  // =========================================================================

  /**
   * Graph 61: Federal Funds Rate vs Tech Stocks
   * Interest rate impact on growth stocks
   * Data sources: Alpha Vantage (Fed Funds), Yahoo (NASDAQ)
   * Inverse correlation: rising rates typically pressure tech valuations
   */
  {
    id: '61',
    title: '61. Federal Funds Rate vs NASDAQ 100',
    description:
      'Compare the Federal Funds Rate to NASDAQ 100 performance. Rising interest rates increase the discount rate for future earnings, typically pressuring growth stock valuations. Falling rates support tech multiples. Watch for lag between rate changes and market response.',
    dataSources: [
      {
        type: 'alphavantage',
        id: 'fed-funds',
        name: 'Federal Funds Rate',
        function: 'FEDERAL_FUNDS_RATE',
        symbol: 'FFR', // Required but not used
        display: { color: '#ef4444', label: 'Fed Funds Rate %', yAxisId: 'left' }
      },
      {
        type: 'yahoo',
        id: 'nasdaq',
        name: 'NASDAQ 100',
        symbol: '^NDX',
        interval: '1d',
        display: { color: '#8b5cf6', label: 'NASDAQ 100', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 } // Normalize NASDAQ only
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 1000 // ~4 years daily
    }
  },

  /**
   * Graph 67: Current Account Balances
   * Trade dynamics for major economies
   * Data source: IMF Balance of Payments
   * Persistent deficits (USA) vs surpluses (DEU, JPN, CHN) show global imbalances
   */
  {
    id: '67',
    title: '67. Current Account Balances (G4 Economies)',
    description:
      'Current account balances in USD billions for USA, China, Germany, and Japan. The current account measures trade in goods/services plus investment income and transfers. Persistent US deficits are financed by foreign capital inflows, while surplus countries accumulate foreign assets. Watch for sudden shifts signaling financial stress.',
    dataSources: [
      {
        type: 'imf',
        id: 'usa-ca',
        name: 'USA Current Account',
        databaseId: 'IFS',
        indicator: 'BCA_BP6_USD',
        frequency: 'Q',
        countryCode: 'USA',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'chn-ca',
        name: 'China Current Account',
        databaseId: 'IFS',
        indicator: 'BCA_BP6_USD',
        frequency: 'Q',
        countryCode: 'CHN',
        display: { color: '#ef4444', label: 'China', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'deu-ca',
        name: 'Germany Current Account',
        databaseId: 'IFS',
        indicator: 'BCA_BP6_USD',
        frequency: 'Q',
        countryCode: 'DEU',
        display: { color: '#f59e0b', label: 'Germany', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'jpn-ca',
        name: 'Japan Current Account',
        databaseId: 'IFS',
        indicator: 'BCA_BP6_USD',
        frequency: 'Q',
        countryCode: 'JPN',
        display: { color: '#10b981', label: 'Japan', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 60 // 15 years quarterly
    }
  },

  /**
   * Graph 68: Government Debt Sustainability
   * G7 debt-to-GDP ratios
   * Data source: IMF Government Finance Statistics
   * Post-COVID fiscal positions and sustainability concerns
   */
  {
    id: '68',
    title: '68. Government Debt-to-GDP (G7 Countries)',
    description:
      'General government gross debt as percentage of GDP for G7 countries. Shows fiscal sustainability and government borrowing capacity. Post-COVID debt levels remain elevated. Above 90% debt/GDP associated with slower growth. Japan leads with 250%+, Italy ~140%, others 100-120%.',
    dataSources: [
      {
        type: 'imf',
        id: 'usa-debt',
        name: 'USA Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'USA',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'jpn-debt',
        name: 'Japan Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'JPN',
        display: { color: '#ef4444', label: 'Japan', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'deu-debt',
        name: 'Germany Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'DEU',
        display: { color: '#f59e0b', label: 'Germany', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'gbr-debt',
        name: 'UK Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'GBR',
        display: { color: '#8b5cf6', label: 'UK', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'fra-debt',
        name: 'France Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'FRA',
        display: { color: '#10b981', label: 'France', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'ita-debt',
        name: 'Italy Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'ITA',
        display: { color: '#ec4899', label: 'Italy', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'can-debt',
        name: 'Canada Debt/GDP',
        databaseId: 'GFS',
        indicator: 'GG_XWD_G01_GDP_PT',
        frequency: 'A',
        countryCode: 'CAN',
        display: { color: '#14b8a6', label: 'Canada', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 25 // 25 years annual
    }
  },

  /**
   * Graph 69: Exchange Rate Volatility
   * Major currency pairs vs USD
   * Data source: IMF International Financial Statistics
   * Currency market stress and central bank policy divergence
   */
  {
    id: '69',
    title: '69. Major Currency Exchange Rates vs USD',
    description:
      'Exchange rates for EUR, GBP, JPY, and CNY against USD. Shows currency market dynamics and relative monetary policy stances. EUR/USD reflects Fed vs ECB policy divergence. JPY weakness from negative rates. CNY managed by PBOC within band. Sharp moves signal financial stress or policy shifts.',
    dataSources: [
      {
        type: 'imf',
        id: 'eur-usd',
        name: 'EUR/USD',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'U2', // Eurozone
        display: { color: '#3b82f6', label: 'EUR/USD', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'gbp-usd',
        name: 'GBP/USD',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'GBR',
        display: { color: '#10b981', label: 'GBP/USD', yAxisId: 'right' }
      },
      {
        type: 'imf',
        id: 'jpy-usd',
        name: 'JPY/USD',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'JPN',
        display: { color: '#ef4444', label: 'JPY/USD', yAxisId: 'right' }
      },
      {
        type: 'imf',
        id: 'cny-usd',
        name: 'CNY/USD',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'CHN',
        display: { color: '#f59e0b', label: 'CNY/USD', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  /**
   * Graph 70: Emerging Markets GDP Growth
   * BRICS real GDP growth rates
   * Data source: IMF International Financial Statistics
   * Growth divergence in major emerging economies
   */
  {
    id: '70',
    title: '70. Emerging Markets GDP Growth (BRICS)',
    description:
      'Year-over-year real GDP growth for Brazil, Russia, India, China, and South Africa. Shows growth dynamics in major emerging markets. India leads with 6-7% growth, China slowing to 4-5%, others more volatile. Watch for convergence/divergence patterns indicating relative competitiveness and policy effectiveness.',
    dataSources: [
      {
        type: 'imf',
        id: 'bra-gdp',
        name: 'Brazil GDP',
        databaseId: 'IFS',
        indicator: 'NGDP_R_SA_XDC',
        frequency: 'Q',
        countryCode: 'BRA',
        display: { color: '#10b981', label: 'Brazil', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'rus-gdp',
        name: 'Russia GDP',
        databaseId: 'IFS',
        indicator: 'NGDP_R_SA_XDC',
        frequency: 'Q',
        countryCode: 'RUS',
        display: { color: '#3b82f6', label: 'Russia', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'ind-gdp',
        name: 'India GDP',
        databaseId: 'IFS',
        indicator: 'NGDP_R_SA_XDC',
        frequency: 'Q',
        countryCode: 'IND',
        display: { color: '#f59e0b', label: 'India', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'chn-gdp',
        name: 'China GDP',
        databaseId: 'IFS',
        indicator: 'NGDP_R_SA_XDC',
        frequency: 'Q',
        countryCode: 'CHN',
        display: { color: '#ef4444', label: 'China', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'zaf-gdp',
        name: 'South Africa GDP',
        databaseId: 'IFS',
        indicator: 'NGDP_R_SA_XDC',
        frequency: 'Q',
        countryCode: 'ZAF',
        display: { color: '#8b5cf6', label: 'South Africa', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'yoy' }, seriesIndex: 0 },
      { operation: { type: 'yoy' }, seriesIndex: 1 },
      { operation: { type: 'yoy' }, seriesIndex: 2 },
      { operation: { type: 'yoy' }, seriesIndex: 3 },
      { operation: { type: 'yoy' }, seriesIndex: 4 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 60 // 15 years quarterly
    }
  },

  /**
   * Graph 71: Productivity Gap
   * Labor productivity comparison (GDP per hour worked)
   * Data source: OECD Productivity Database
   * Competitiveness indicator explaining wage growth differences
   */
  {
    id: '71',
    title: '71. Labor Productivity Gap (USA vs EUR vs JPN)',
    description:
      'GDP per hour worked in USD (PPP adjusted) for USA, Euro Area, and Japan. Measures economic output per labor hour, indicating efficiency and competitiveness. Higher productivity supports higher wages. USA leads, followed by Eurozone, then Japan. Gaps reflect technology adoption, capital intensity, and structural factors.',
    dataSources: [
      {
        type: 'oecd',
        id: 'usa-prod',
        name: 'USA Productivity',
        dataset: 'PDB_LV',
        indicator: 'T_GDPHRS',
        location: 'USA',
        frequency: 'A',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'ea-prod',
        name: 'Euro Area Productivity',
        dataset: 'PDB_LV',
        indicator: 'T_GDPHRS',
        location: 'EA19',
        frequency: 'A',
        display: { color: '#8b5cf6', label: 'Euro Area', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'jpn-prod',
        name: 'Japan Productivity',
        dataset: 'PDB_LV',
        indicator: 'T_GDPHRS',
        location: 'JPN',
        frequency: 'A',
        display: { color: '#ef4444', label: 'Japan', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 25 // 25 years annual
    }
  },

  /**
   * Graph 72: Income Inequality Trends
   * Gini coefficients across OECD countries
   * Data source: OECD Income Distribution Database
   * Social stability indicator and policy effectiveness
   */
  {
    id: '72',
    title: '72. Income Inequality Trends (Gini Coefficients)',
    description:
      'Gini coefficients for disposable income (post-tax and transfers) across major economies. Ranges 0-1, where 0 = perfect equality, 1 = complete inequality. USA has highest inequality (~0.39), Nordic countries lowest (~0.26-0.28). Rising inequality linked to social unrest, political polarization, and slower growth.',
    dataSources: [
      {
        type: 'oecd',
        id: 'usa-gini',
        name: 'USA Gini',
        dataset: 'IDD',
        indicator: 'GINI',
        location: 'USA',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'deu-gini',
        name: 'Germany Gini',
        dataset: 'IDD',
        indicator: 'GINI',
        location: 'DEU',
        display: { color: '#f59e0b', label: 'Germany', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'gbr-gini',
        name: 'UK Gini',
        dataset: 'IDD',
        indicator: 'GINI',
        location: 'GBR',
        display: { color: '#10b981', label: 'UK', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'jpn-gini',
        name: 'Japan Gini',
        dataset: 'IDD',
        indicator: 'GINI',
        location: 'JPN',
        display: { color: '#ef4444', label: 'Japan', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'swe-gini',
        name: 'Sweden Gini',
        dataset: 'IDD',
        indicator: 'GINI',
        location: 'SWE',
        display: { color: '#8b5cf6', label: 'Sweden', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 25 // 25 years (data updated every 2-3 years)
    }
  },

  /**
   * Graph 74: Research & Development Spending
   * R&D expenditure as % of GDP
   * Data source: OECD Main Science and Technology Indicators
   * Innovation investment trends across countries
   */
  {
    id: '74',
    title: '74. R&D Spending (% of GDP)',
    description:
      'Gross domestic expenditure on R&D (GERD) as percentage of GDP. Measures innovation investment intensity. Israel and South Korea lead at 6% and 5%, USA and Germany at ~3%, China rising rapidly. Higher R&D correlates with productivity growth, competitiveness, and high-value industry development.',
    dataSources: [
      {
        type: 'oecd',
        id: 'usa-rd',
        name: 'USA R&D',
        dataset: 'MSTI_PUB',
        indicator: 'GERD_PC_GDP',
        location: 'USA',
        display: { color: '#3b82f6', label: 'USA', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'chn-rd',
        name: 'China R&D',
        dataset: 'MSTI_PUB',
        indicator: 'GERD_PC_GDP',
        location: 'CHN',
        display: { color: '#ef4444', label: 'China', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'deu-rd',
        name: 'Germany R&D',
        dataset: 'MSTI_PUB',
        indicator: 'GERD_PC_GDP',
        location: 'DEU',
        display: { color: '#f59e0b', label: 'Germany', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'jpn-rd',
        name: 'Japan R&D',
        dataset: 'MSTI_PUB',
        indicator: 'GERD_PC_GDP',
        location: 'JPN',
        display: { color: '#ec4899', label: 'Japan', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'kor-rd',
        name: 'South Korea R&D',
        dataset: 'MSTI_PUB',
        indicator: 'GERD_PC_GDP',
        location: 'KOR',
        display: { color: '#8b5cf6', label: 'South Korea', yAxisId: 'left' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 25 // 25 years annual
    }
  },

  // =========================================================================
  // Phase 17C: Multi-Provider Dashboards (Graphs 75-80)
  // =========================================================================

  /**
   * Graph 75: Housing Affordability Crisis
   * OECD house price-to-income ratios + FRED mortgage rates
   * Data sources: OECD, FRED
   * Shows housing affordability deterioration across countries
   */
  {
    id: '75',
    title: '75. Housing Affordability Crisis',
    description:
      'Combines OECD house price-to-income ratios with US mortgage rates. Rising price-to-income ratios indicate worsening affordability as house prices outpace income growth. High mortgage rates compound the problem by increasing monthly payments. Multiple OECD countries show ratios above historical norms, signaling affordability crisis.',
    dataSources: [
      {
        type: 'oecd',
        id: 'usa-housing',
        name: 'USA House Price to Income',
        dataset: 'HOUSE_PRICES',
        indicator: 'PRICE_INCOME_RATIO',
        location: 'USA',
        display: { color: '#3b82f6', label: 'USA Price/Income', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'can-housing',
        name: 'Canada House Price to Income',
        dataset: 'HOUSE_PRICES',
        indicator: 'PRICE_INCOME_RATIO',
        location: 'CAN',
        display: { color: '#10b981', label: 'Canada Price/Income', yAxisId: 'left' }
      },
      {
        type: 'oecd',
        id: 'aus-housing',
        name: 'Australia House Price to Income',
        dataset: 'HOUSE_PRICES',
        indicator: 'PRICE_INCOME_RATIO',
        location: 'AUS',
        display: { color: '#f59e0b', label: 'Australia Price/Income', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'mortgage-rate',
        name: '30Y Mortgage Rate',
        seriesId: 'MORTGAGE30US',
        display: { color: '#ef4444', label: '30Y Mortgage %', yAxisId: 'right' }
      }
    ],
    transforms: [],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 100 // ~25 years quarterly
    }
  },

  /**
   * Graph 76: Complete Inflation Picture
   * 360° view of inflation from multiple sources
   * Data sources: BLS (CPI, Import Prices), FRED (PCE)
   * Leading vs lagging indicators
   */
  {
    id: '76',
    title: '76. Complete Inflation Picture (Multi-Source)',
    description:
      'Comprehensive inflation view combining CPI (consumer prices), PCE (Fed\'s preferred measure), import prices (supply chain), and producer prices. Import prices lead consumer inflation. PPI leads CPI. PCE more stable than CPI. Divergences signal inflation composition changes (goods vs services, domestic vs imported).',
    dataSources: [
      {
        type: 'bls',
        id: 'cpi',
        name: 'CPI All Items',
        seriesId: 'CUUR0000SA0',
        display: { color: '#3b82f6', label: 'CPI', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'pce',
        name: 'PCE Price Index',
        seriesId: 'PCEPI',
        display: { color: '#8b5cf6', label: 'PCE', yAxisId: 'left' }
      },
      {
        type: 'bls',
        id: 'import-prices',
        name: 'Import Price Index',
        seriesId: 'EIUIR',
        display: { color: '#ef4444', label: 'Import Prices', yAxisId: 'left' }
      },
      {
        type: 'bls',
        id: 'ppi',
        name: 'Producer Price Index',
        seriesId: 'WPUFD4',
        display: { color: '#f59e0b', label: 'PPI', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'yoy' }, seriesIndex: 0 },
      { operation: { type: 'yoy' }, seriesIndex: 1 },
      { operation: { type: 'yoy' }, seriesIndex: 2 },
      { operation: { type: 'yoy' }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  /**
   * Graph 77: Credit Conditions Dashboard
   * Complete view of credit market health
   * Data sources: Alpha Vantage, FRED, Treasury
   * Financial stability indicator
   */
  {
    id: '77',
    title: '77. Credit Conditions Dashboard',
    description:
      'Comprehensive credit market conditions: Fed Funds Rate (policy stance), credit spreads (risk premium), bank credit growth (lending activity), and total public debt (fiscal burden). Rising spreads signal stress. Contracting bank credit precedes recessions. All normalized for comparison.',
    dataSources: [
      {
        type: 'alphavantage',
        id: 'fed-funds',
        name: 'Federal Funds Rate',
        function: 'FEDERAL_FUNDS_RATE',
        symbol: 'FFR',
        display: { color: '#ef4444', label: 'Fed Funds Rate %', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'credit-spread',
        name: 'BAA-10Y Spread',
        seriesId: 'BAA10Y',
        display: { color: '#f59e0b', label: 'Credit Spread', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'bank-credit',
        name: 'Total Bank Credit',
        seriesId: 'TOTBKCR',
        display: { color: '#3b82f6', label: 'Bank Credit', yAxisId: 'right' }
      },
      {
        type: 'treasury',
        id: 'total-debt',
        name: 'Total Public Debt',
        dataset: 'debt_to_penny',
        display: { color: '#8b5cf6', label: 'Public Debt', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 1000 // ~4 years daily
    }
  },

  /**
   * Graph 78: Global Trade Flow
   * Complete trade cycle indicators
   * Data sources: BLS, FRED, IMF
   * Supply chain and trade health
   */
  {
    id: '78',
    title: '78. Global Trade Flow Indicators',
    description:
      'Trade cycle indicators: US trade balance (goods/services deficit), USD index (currency competitiveness), export prices (pricing power), and imports (domestic demand). Weakening USD supports exports. Rising imports signal strong domestic demand. Trade balance reflects competitiveness and savings/investment balance.',
    dataSources: [
      {
        type: 'fred',
        id: 'trade-balance',
        name: 'Trade Balance',
        seriesId: 'BOPGSTB',
        display: { color: '#3b82f6', label: 'Trade Balance $B', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'usd-index',
        name: 'USD Trade Weighted Index',
        seriesId: 'DTWEXBGS',
        display: { color: '#ef4444', label: 'USD Index', yAxisId: 'right' }
      },
      {
        type: 'bls',
        id: 'export-prices',
        name: 'Export Price Index',
        seriesId: 'EIUIR100',
        display: { color: '#10b981', label: 'Export Prices', yAxisId: 'right' }
      },
      {
        type: 'bls',
        id: 'import-volume',
        name: 'Import Price Index',
        seriesId: 'EIUIR',
        display: { color: '#f59e0b', label: 'Import Prices', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  /**
   * Graph 79: Crypto vs Macro
   * Bitcoin vs macroeconomic drivers
   * Data sources: CoinGecko, Hyperliquid, FRED, Alpha Vantage
   * Liquidity-driven asset behavior
   */
  {
    id: '79',
    title: '79. Crypto vs Macro Conditions',
    description:
      'Bitcoin price vs macroeconomic drivers: M2 money supply (liquidity), real interest rates (opportunity cost), USD index (global liquidity), and funding rates (leverage demand). BTC correlates with liquidity expansion and negative real rates. Rising USD typically pressures BTC. High funding rates signal overheated positioning.',
    dataSources: [
      {
        type: 'coingecko',
        id: 'btc',
        name: 'Bitcoin',
        coinId: 'bitcoin',
        display: { color: '#f59e0b', label: 'BTC Price', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'm2',
        name: 'M2 Money Supply',
        seriesId: 'M2SL',
        display: { color: '#3b82f6', label: 'M2', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'real-rates',
        name: '10Y Real Yield',
        seriesId: 'DFII10',
        display: { color: '#ef4444', label: 'Real Rates %', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'usd-broad',
        name: 'USD Broad Index',
        seriesId: 'DTWEXBGS',
        display: { color: '#8b5cf6', label: 'USD Index', yAxisId: 'right' }
      },
      {
        type: 'hyperliquid',
        id: 'btc-funding',
        name: 'BTC Funding Rate',
        coin: 'BTC',
        dataType: 'fundingHistory',
        display: { color: '#10b981', label: 'Funding %', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 },
      { operation: { type: 'scale', factor: 100 }, seriesIndex: 4 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 500 // ~2 years daily
    }
  },

  /**
   * Graph 80: Labor Market Deep Dive
   * Complete employment picture
   * Data sources: BLS, FRED, OECD
   * Most comprehensive labor market view
   */
  {
    id: '80',
    title: '80. Labor Market Deep Dive (5 Indicators)',
    description:
      'Comprehensive labor market: unemployment rate (headline), labor force participation (structural health), job openings (demand), wage growth (inflation pressure), and productivity (efficiency). Low unemployment + high participation = tight market. JOLTS openings show demand. Wage growth vs productivity determines inflation.',
    dataSources: [
      {
        type: 'bls',
        id: 'unemployment',
        name: 'Unemployment Rate',
        seriesId: 'LNS14000000',
        display: { color: '#ef4444', label: 'Unemployment %', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'participation',
        name: 'Labor Force Participation',
        seriesId: 'CIVPART',
        display: { color: '#3b82f6', label: 'Participation %', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'jolts',
        name: 'Job Openings (JOLTS)',
        seriesId: 'JTSJOL',
        display: { color: '#10b981', label: 'Job Openings', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'wages',
        name: 'Average Hourly Earnings',
        seriesId: 'CES0500000003',
        display: { color: '#f59e0b', label: 'Wages', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'productivity',
        name: 'Labor Productivity',
        seriesId: 'OPHNFB',
        display: { color: '#8b5cf6', label: 'Productivity', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'yoy' }, seriesIndex: 3 },
      { operation: { type: 'yoy' }, seriesIndex: 4 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  // =========================================================================
  // Phase 17D: Specialized & Alternative Data (Graphs 58, 62-65)
  // =========================================================================

  /**
   * Graph 58: Tech Giants vs Market Cap
   * Market concentration in big tech
   * Data source: Alpha Vantage
   * Shows tech sector dominance
   */
  {
    id: '58',
    title: '58. Tech Giants Market Capitalization',
    description:
      'Market caps of AAPL, MSFT, GOOGL, and AMZN. Shows concentration of market value in largest tech companies. Combined market cap often exceeds entire sectors. Stock prices normalized to show relative performance. Rising concentration indicates tech dominance and potential systemic risk.',
    dataSources: [
      {
        type: 'alphavantage',
        id: 'aapl',
        name: 'Apple',
        function: 'TIME_SERIES_DAILY',
        symbol: 'AAPL',
        display: { color: '#3b82f6', label: 'Apple', yAxisId: 'left' }
      },
      {
        type: 'alphavantage',
        id: 'msft',
        name: 'Microsoft',
        function: 'TIME_SERIES_DAILY',
        symbol: 'MSFT',
        display: { color: '#10b981', label: 'Microsoft', yAxisId: 'left' }
      },
      {
        type: 'alphavantage',
        id: 'googl',
        name: 'Alphabet',
        function: 'TIME_SERIES_DAILY',
        symbol: 'GOOGL',
        display: { color: '#ef4444', label: 'Google', yAxisId: 'left' }
      },
      {
        type: 'alphavantage',
        id: 'amzn',
        name: 'Amazon',
        function: 'TIME_SERIES_DAILY',
        symbol: 'AMZN',
        display: { color: '#f59e0b', label: 'Amazon', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 500 // ~2 years daily
    }
  },

  /**
   * Graph 62: Commodity Prices Basket
   * Global economic health indicator
   * Data source: Quandl
   * Note: Requires Quandl API key - dataset codes may need verification
   */
  {
    id: '62',
    title: '62. Commodity Prices Basket',
    description:
      'Oil (WTI), Gold, Copper, and Wheat prices. Commodities reflect global economic activity and inflation. Oil tracks energy demand. Copper ("Dr. Copper") predicts manufacturing. Gold is safe haven. Wheat represents food prices. All normalized for comparison. NOTE: Requires Quandl API key and may need paid tier.',
    dataSources: [
      {
        type: 'quandl',
        id: 'oil',
        name: 'WTI Crude Oil',
        databaseCode: 'CHRIS',
        datasetCode: 'CME_CL1',
        column: 4, // Settlement price
        display: { color: '#3b82f6', label: 'Oil (WTI)', yAxisId: 'left' }
      },
      {
        type: 'quandl',
        id: 'gold',
        name: 'Gold',
        databaseCode: 'LBMA',
        datasetCode: 'GOLD',
        column: 1, // USD PM
        display: { color: '#f59e0b', label: 'Gold', yAxisId: 'left' }
      },
      {
        type: 'quandl',
        id: 'copper',
        name: 'Copper',
        databaseCode: 'CHRIS',
        datasetCode: 'CME_HG1',
        column: 4, // Settlement
        display: { color: '#ef4444', label: 'Copper', yAxisId: 'left' }
      },
      {
        type: 'quandl',
        id: 'wheat',
        name: 'Wheat',
        databaseCode: 'CHRIS',
        datasetCode: 'CME_W1',
        column: 4, // Settlement
        display: { color: '#10b981', label: 'Wheat', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 1000 // ~4 years daily
    }
  },

  /**
   * Graph 63: Housing Market Indicators
   * Complete housing cycle view
   * Data source: Quandl + FRED alternative
   * Note: Quandl housing data may require paid tier - using FRED as alternative
   */
  {
    id: '63',
    title: '63. Housing Market Indicators',
    description:
      'Housing market health: home prices (FRED Case-Shiller), mortgage rates (FRED), housing starts (FRED). Rising prices + low rates = boom. High rates + falling starts = slowdown. Prices lag starts by 12-18 months. NOTE: Uses FRED instead of Quandl for better availability.',
    dataSources: [
      {
        type: 'fred',
        id: 'home-prices',
        name: 'Case-Shiller Home Price Index',
        seriesId: 'CSUSHPISA',
        display: { color: '#3b82f6', label: 'Home Prices', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'mortgage',
        name: '30Y Mortgage Rate',
        seriesId: 'MORTGAGE30US',
        display: { color: '#ef4444', label: 'Mortgage Rate %', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'starts',
        name: 'Housing Starts',
        seriesId: 'HOUST',
        display: { color: '#10b981', label: 'Housing Starts', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  /**
   * Graph 64: Energy Transition Dashboard
   * Renewables vs fossil fuels
   * Data source: FRED (EIA data)
   * Note: Using FRED/EIA instead of Quandl for better availability
   */
  {
    id: '64',
    title: '64. Energy Transition Dashboard',
    description:
      'Energy production mix: renewable vs fossil fuels. Tracks clean energy adoption and fossil fuel decline. Solar and wind growing exponentially. Coal declining in developed markets. Natural gas transitional fuel. All normalized to show relative growth. NOTE: Uses FRED (EIA data) for availability.',
    dataSources: [
      {
        type: 'fred',
        id: 'solar',
        name: 'Solar Generation',
        seriesId: 'ELEC.GEN.SUN-US-99.M',
        display: { color: '#f59e0b', label: 'Solar', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'wind',
        name: 'Wind Generation',
        seriesId: 'ELEC.GEN.WND-US-99.M',
        display: { color: '#3b82f6', label: 'Wind', yAxisId: 'left' }
      },
      {
        type: 'fred',
        id: 'coal',
        name: 'Coal Generation',
        seriesId: 'ELEC.GEN.COL-US-99.M',
        display: { color: '#8b5cf6', label: 'Coal', yAxisId: 'right' }
      },
      {
        type: 'fred',
        id: 'natgas',
        name: 'Natural Gas Generation',
        seriesId: 'ELEC.GEN.NG-US-99.M',
        display: { color: '#10b981', label: 'Natural Gas', yAxisId: 'right' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line',
      dualAxis: true
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  },

  /**
   * Graph 65: Emerging Markets FX
   * EM currency stress indicator
   * Data source: IMF (instead of Quandl)
   * Note: Using IMF for free access to FX data
   */
  {
    id: '65',
    title: '65. Emerging Markets Currency Stress',
    description:
      'Emerging market currencies vs USD: Brazilian Real (BRL), Indian Rupee (INR), Turkish Lira (TRY), South African Rand (ZAR). EM FX weakening signals capital flight, tightening conditions, or domestic stress. Strong USD typically pressures EM currencies. Synchronized weakness = systemic EM stress. NOTE: Uses IMF data for free access.',
    dataSources: [
      {
        type: 'imf',
        id: 'brl',
        name: 'Brazilian Real',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'BRA',
        display: { color: '#10b981', label: 'BRL/USD', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'inr',
        name: 'Indian Rupee',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'IND',
        display: { color: '#f59e0b', label: 'INR/USD', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'try',
        name: 'Turkish Lira',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'TUR',
        display: { color: '#ef4444', label: 'TRY/USD', yAxisId: 'left' }
      },
      {
        type: 'imf',
        id: 'zar',
        name: 'South African Rand',
        databaseId: 'IFS',
        indicator: 'ENDA_XDC_USD_RATE',
        frequency: 'M',
        countryCode: 'ZAF',
        display: { color: '#8b5cf6', label: 'ZAR/USD', yAxisId: 'left' }
      }
    ],
    transforms: [
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 0 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 1 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 2 },
      { operation: { type: 'normalize', base: 100 }, seriesIndex: 3 }
    ],
    chartConfig: {
      type: 'line'
    },
    timeAlignment: {
      recentPoints: 120 // 10 years monthly
    }
  }
];

/**
 * Get enhanced graph by ID
 *
 * @param id - Graph ID
 * @returns Enhanced graph definition or undefined
 */
export function getEnhancedGraph(id: string): EnhancedGraphDefinition | undefined {
  return ENHANCED_GRAPHS_LIST.find(g => g.id === id);
}

/**
 * Get all enhanced graph IDs
 *
 * @returns Array of graph IDs
 */
export function getEnhancedGraphIds(): string[] {
  return ENHANCED_GRAPHS_LIST.map(g => g.id);
}

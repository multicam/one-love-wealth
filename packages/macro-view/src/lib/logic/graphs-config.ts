export interface GraphDefinition {
	id: string;
	title: string;
	description: string;
	dataSources: {
		name: string;
		id: string; // FRED ID, CoinGecko ID, or Yahoo symbol
		type: 'fred' | 'coingecko' | 'yahoo';
		color?: string;
        label?: string;
	}[];
	chartConfig: {
		type: 'line';
		yAxisLog?: boolean;
		dualAxis?: boolean;
        timeShift?: number; // months (visual shift)
	};
}

export const GRAPHS_LIST: GraphDefinition[] = [
    // === GRAPH 1 ===
    {
        id: '1',
        title: '1. ISM vs Interest Rate Model',
        description: 'ISM PMI (Green) vs 10Y Treasury Yield (Blue). Rates often lead the business cycle by ~6 months.',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: '10Y Treasury', id: 'GS10', type: 'fred', color: '#3b82f6', label: 'Rates (Inverted)' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 6 }
    },
    // === GRAPH 2 (Table - approximated as line chart) ===
    {
        id: '2',
        title: '2. Digital Assets Performance',
        description: 'Bitcoin vs major asset classes. Digital assets have been top performers in 11 of the last 15 years.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' },
            { name: 'S&P 500', id: '^GSPC', type: 'yahoo', color: '#3b82f6', label: 'S&P 500' },
            { name: 'Gold', id: 'GLD', type: 'yahoo', color: '#f97316', label: 'Gold (GLD)' }
        ],
        chartConfig: { type: 'line', yAxisLog: true, dualAxis: false }
    },
    // === GRAPH 3 ===
    {
        id: '3',
        title: '3. Bitcoin vs ISM',
        description: 'Bitcoin price (Log scale) overlaid with ISM Manufacturing PMI. ISM cycles often lead crypto market trends.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC Price' },
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' }
        ],
        chartConfig: { type: 'line', yAxisLog: true, dualAxis: true }
    },
    // === GRAPH 4 ===
    {
        id: '4',
        title: '4. ISM vs Financial Conditions',
        description: 'ISM PMI vs Financial Conditions Index (Proxy: Chicago Fed NFCI). FCI leads ISM by ~9 months.',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'Chicago Fed NFCI', id: 'NFCI', type: 'fred', color: '#8b5cf6', label: 'FCI' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 9 }
    },
    // === GRAPH 5 ===
    {
        id: '5',
        title: '5. US Government Debt % GDP',
        description: 'Total Federal Debt as a percentage of GDP. Shows the long-term trend of fiscal dominance.',
        dataSources: [
            { name: 'Debt/GDP', id: 'GFDEGDQ188S', type: 'fred', color: '#ef4444', label: 'Debt % GDP' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 6 ===
    {
        id: '6',
        title: '6. ISM vs Industrial Metals',
        description: 'ISM PMI vs Industrial Metals Price Index (Producer Price Index proxy).',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'Industrial Metals', id: 'WPU10', type: 'fred', color: '#f97316', label: 'Metals PPI' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 7 ===
    {
        id: '7',
        title: '7. US Labor Force Participation',
        description: 'Civilian Labor Force Participation Rate. A structural economic indicator.',
        dataSources: [
            { name: 'Participation Rate', id: 'CIVPART', type: 'fred', color: '#64748b', label: 'Participation %' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 8 ===
    {
        id: '8',
        title: '8. ISM vs S&P 500 YoY',
        description: 'ISM PMI vs S&P 500 Year-over-Year change.',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'S&P 500', id: 'SP500', type: 'fred', color: '#3b82f6', label: 'S&P 500' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 9 ===
    {
        id: '9',
        title: '9. US Real GDP YoY',
        description: 'Real Gross Domestic Product, Percent Change from Year Ago.',
        dataSources: [
            { name: 'Real GDP', id: 'GDPC1', type: 'fred', color: '#3b82f6', label: 'Real GDP' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 10 ===
    {
        id: '10',
        title: '10. Fed Net Liquidity vs Debt',
        description: 'Correlation between Fed Net Liquidity and Government Debt levels.',
        dataSources: [
            { name: 'Net Liquidity (Proxy M2)', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'Liquidity' },
            { name: 'Debt % GDP', id: 'GFDEGDQ188S', type: 'fred', color: '#ef4444', label: 'Debt' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 11 ===
    {
        id: '11',
        title: '11. ISM vs BTC Dominance',
        description: 'ISM PMI vs Bitcoin Dominance. Rising ISM often coincides with Altcoin season (Lower BTC Dom).',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC (Proxy for Dom)' } 
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 12 ===
    {
        id: '12',
        title: '12. ISM vs ETH/BTC Ratio',
        description: 'Ethereum strength relative to Bitcoin often correlates with business cycle expansion (Rising ISM).',
        dataSources: [
            { name: 'ETH/BTC', id: 'ethereum', type: 'coingecko', color: '#8b5cf6', label: 'ETH Price (Proxy)' },
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 13 ===
    {
        id: '13',
        title: '13. Economic Surprise vs Bitcoin',
        description: 'Economic Surprise Index proxy (Consumer Sentiment) vs Bitcoin Momentum.',
        dataSources: [
            { name: 'Sentiment', id: 'UMCSENT', type: 'fred', color: '#3b82f6', label: 'Sentiment' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 1 }
    },
    // === GRAPH 14 ===
    {
        id: '14',
        title: '14. Bitcoin vs Global Liquidity',
        description: 'Bitcoin tracks Global Liquidity (M2) closely.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' },
            { name: 'Global M2 (Proxy)', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 15 ===
    {
        id: '15',
        title: '15. ISM vs Liquidity (YoY)',
        description: 'ISM PMI vs M2 YoY Growth (Lead 6 months).',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'M2 YoY', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2 YoY' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 6 }
    },
    // === GRAPH 16 ===
    {
        id: '16',
        title: '16. Liquidity YoY vs Financial Conditions',
        description: 'M2 YoY% vs Financial Conditions Index (Lead 3 months).',
        dataSources: [
            { name: 'M2 YoY', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2 YoY' },
            { name: 'Chicago Fed NFCI', id: 'NFCI', type: 'fred', color: '#8b5cf6', label: 'FCI' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 3 }
    },
    // === GRAPH 17 ===
    {
        id: '17',
        title: '17. Liquidity Trend',
        description: 'Global Liquidity Index (M2) showing long-term growth trend with 8% annualized rate.',
        dataSources: [
            { name: 'M2 Money Supply', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 18 ===
    {
        id: '18',
        title: '18. Liquidity Index vs Bitcoin',
        description: 'Total Liquidity Index ($BN) vs Bitcoin price.',
        dataSources: [
            { name: 'M2 Money Supply', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 19 (Scatter - approximated as line) ===
    {
        id: '19',
        title: '19. Liquidity vs Bitcoin Correlation',
        description: 'Weekly Liquidity vs Bitcoin relationship (2013-Today). Strong positive correlation.',
        dataSources: [
            { name: 'M2 Money Supply', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 20 ===
    {
        id: '20',
        title: '20. US Total Debt % GDP',
        description: 'Total Public + Private Debt as % of GDP.',
        dataSources: [
            { name: 'Total Debt', id: 'TOTDTEUSQ163N', type: 'fred', color: '#ef4444', label: 'Total Debt' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 21 ===
    {
        id: '21',
        title: '21. DXY Dollar Index',
        description: 'Trade Weighted U.S. Dollar Index.',
        dataSources: [
            { name: 'DXY', id: 'DTWEXBGS', type: 'fred', color: '#10b981', label: 'DXY' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 22 ===
    {
        id: '22',
        title: '22. Bitcoin Historical Comparison',
        description: 'Bitcoin: January 2020-April 2021 cycle comparison with current price action.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 23 ===
    {
        id: '23',
        title: '23. Labor Force vs Debt',
        description: 'Labor Force Participation vs Debt % GDP (Inverted).',
        dataSources: [
            { name: 'Participation', id: 'CIVPART', type: 'fred', color: '#64748b', label: 'Labor' },
            { name: 'Debt % GDP', id: 'GFDEGDQ188S', type: 'fred', color: '#ef4444', label: 'Debt' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 24 ===
    {
        id: '24',
        title: '24. Bitcoin Log Scale with Trends',
        description: 'Bitcoin price on log scale with long-term trend lines.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 25 ===
    {
        id: '25',
        title: '25. Labor Force vs Birth Rate',
        description: 'Labor Force Participation vs Birth Rate (Lead 16 Years).',
        dataSources: [
            { name: 'Participation', id: 'CIVPART', type: 'fred', color: '#64748b', label: 'Labor' },
            { name: 'Birth Rate', id: 'SPDYNCBRTINUSA', type: 'fred', color: '#f472b6', label: 'Birth Rate' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 192 }
    },
    // === GRAPH 26 ===
    {
        id: '26',
        title: '26. ISM vs 4-Year Cycle',
        description: 'ISM PMI fitted with a 4-year sine wave to identify business cycle phases.',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 27 ===
    {
        id: '27',
        title: '27. Liquidity vs Interest Payments',
        description: 'Fed Net Liquidity vs Govt Interest Payments (Lead 36 months).',
        dataSources: [
            { name: 'Liquidity', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' },
            { name: 'Interest', id: 'A091RC1Q027SBEA', type: 'fred', color: '#ef4444', label: 'Interest' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 36 }
    },
    // === GRAPH 28 ===
    {
        id: '28',
        title: '28. Productivity Growth',
        description: 'Nonfarm Business Sector: Output Per Hour of All Persons (5Y change).',
        dataSources: [
            { name: 'Productivity', id: 'OPHNFB', type: 'fred', color: '#10b981', label: 'Productivity' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 29 ===
    {
        id: '29',
        title: '29. ISM vs Bitcoin Implied Pricing',
        description: 'ISM PMI vs Bitcoin-derived implied ISM from regression model.',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 30 ===
    {
        id: '30',
        title: '30. US Birth Rate',
        description: 'Birth Rate, Crude (per 1,000 people).',
        dataSources: [
            { name: 'Birth Rate', id: 'SPDYNCBRTINUSA', type: 'fred', color: '#f472b6', label: 'Birth Rate' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 31 ===
    {
        id: '31',
        title: '31. Bitcoin 2015-2017 Cycle',
        description: 'Bitcoin: December 2015-December 2017 cycle comparison with current.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 32 ===
    {
        id: '32',
        title: '32. NASDAQ vs Bitcoin',
        description: 'NASDAQ 100 vs Bitcoin correlation.',
        dataSources: [
            { name: 'NASDAQ 100', id: '^NDX', type: 'yahoo', color: '#3b82f6', label: 'NDX' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 33 (Infographic - approximated as comparison chart) ===
    {
        id: '33',
        title: '33. Crypto Market Cap Context',
        description: 'Digital assets at ~$3T market cap. Comparison with Gold and M2 money supply.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC (Crypto Proxy)' },
            { name: 'Gold', id: 'GLD', type: 'yahoo', color: '#f97316', label: 'Gold (GLD)' },
            { name: 'M2', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 34 ===
    {
        id: '34',
        title: '34. ISM vs 5.4-Year Cycle',
        description: 'ISM PMI fitted with a 5.4-year sine wave (Kitchin cycle).',
        dataSources: [
            { name: 'ISM PMI', id: 'IPMAN', type: 'fred', color: '#10b981', label: 'ISM (Proxy)' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 35 (Bar chart - approximated as line) ===
    {
        id: '35',
        title: '35. Debt Maturity Distribution',
        description: 'Marketable Interest-Bearing Public Debt maturity profile. Proxy: Total Public Debt.',
        dataSources: [
            { name: 'Public Debt', id: 'GFDEBTN', type: 'fred', color: '#ef4444', label: 'Public Debt' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 36 ===
    {
        id: '36',
        title: '36. Liquidity Index YoY%',
        description: 'Total Liquidity Index Year-over-Year percentage change.',
        dataSources: [
            { name: 'M2 YoY', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2 YoY' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 37 ===
    {
        id: '37',
        title: '37. Global M2 vs Bitcoin',
        description: 'Global M2 (Lead 12 weeks) vs Bitcoin.',
        dataSources: [
            { name: 'Global M2', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 3 }
    },
    // === GRAPH 38 ===
    {
        id: '38',
        title: '38. NASDAQ vs Liquidity Index',
        description: 'NASDAQ 100 vs Total Liquidity Index (January 2012=100).',
        dataSources: [
            { name: 'NASDAQ 100', id: '^NDX', type: 'yahoo', color: '#3b82f6', label: 'NDX' },
            { name: 'M2', id: 'M2SL', type: 'fred', color: '#8b5cf6', label: 'M2' }
        ],
        chartConfig: { type: 'line', dualAxis: true }
    },
    // === GRAPH 39 ===
    {
        id: '39',
        title: '39. Global M2 vs NASDAQ',
        description: 'Global M2 (Lead 12 weeks) vs NASDAQ 100.',
        dataSources: [
            { name: 'Global M2', id: 'M2SL', type: 'fred', color: '#3b82f6', label: 'M2' },
            { name: 'NASDAQ 100', id: '^NDX', type: 'yahoo', color: '#8b5cf6', label: 'NDX' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 3 }
    },
    // === GRAPH 40 ===
    {
        id: '40',
        title: '40. Bitcoin 2018-2019 Cycle',
        description: 'Bitcoin: November 2018-July 2019 cycle comparison with current.',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    },
    // === GRAPH 41 ===
    {
        id: '41',
        title: '41. Bitcoin vs Gold',
        description: 'Bitcoin vs Gold (Lead 188 days / ~6 months).',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' },
            { name: 'Gold', id: 'GLD', type: 'yahoo', color: '#f97316', label: 'Gold (GLD)' }
        ],
        chartConfig: { type: 'line', dualAxis: true, timeShift: 6 }
    },
    // === GRAPH 42 ===
    {
        id: '42',
        title: '42. Public Debt % GDP',
        description: 'Federal Debt: Total Public Debt as Percent of GDP.',
        dataSources: [
            { name: 'Public Debt', id: 'GFDEGDQ188S', type: 'fred', color: '#ef4444', label: 'Public Debt' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 43 ===
    {
        id: '43',
        title: '43. NASDAQ Total Return vs Bitcoin',
        description: 'NASDAQ 100 Total Return vs Bitcoin (January 2012=100).',
        dataSources: [
            { name: 'NASDAQ 100', id: '^NDX', type: 'yahoo', color: '#3b82f6', label: 'NDX' },
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', dualAxis: true, yAxisLog: true }
    },
    // === GRAPH 44 ===
    {
        id: '44',
        title: '44. US Private Debt % GDP',
        description: 'Total Private Debt as % of GDP (Proxy: Household Debt Service Ratio).',
        dataSources: [
            { name: 'Household Debt', id: 'TDSP', type: 'fred', color: '#f97316', label: 'Debt Service' }
        ],
        chartConfig: { type: 'line', yAxisLog: false }
    },
    // === GRAPH 45 (Text/Conceptual - approximated as multi-series) ===
    {
        id: '45',
        title: '45. GDP Growth Components',
        description: 'The Magic Formula: GDP Growth = Population Growth + Productivity Growth + Debt Growth.',
        dataSources: [
            { name: 'Real GDP', id: 'GDPC1', type: 'fred', color: '#3b82f6', label: 'GDP' },
            { name: 'Productivity', id: 'OPHNFB', type: 'fred', color: '#10b981', label: 'Productivity' },
            { name: 'Debt', id: 'GFDEGDQ188S', type: 'fred', color: '#ef4444', label: 'Debt' }
        ],
        chartConfig: { type: 'line', dualAxis: false }
    },
    // === GRAPH 46 ===
    {
        id: '46',
        title: '46. Bitcoin Cycles (Log)',
        description: 'Long-term Bitcoin price history on a logarithmic scale to visualize cycle phases and "Banana Zones".',
        dataSources: [
            { name: 'Bitcoin', id: 'bitcoin', type: 'coingecko', color: '#f59e0b', label: 'BTC' }
        ],
        chartConfig: { type: 'line', yAxisLog: true }
    }
];

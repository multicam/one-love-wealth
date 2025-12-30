# Data Provider Reference

Complete guide to all 11 data providers in the Macro View data layer.

## Table of Contents

### Core Providers (Phases 6-10)
1. [FRED - Federal Reserve Economic Data](#fred---federal-reserve-economic-data)
2. [CoinGecko - Cryptocurrency Data](#coingecko---cryptocurrency-data)
3. [Yahoo Finance - Stock Market Data](#yahoo-finance---stock-market-data)
4. [World Bank - Global Economic Data](#world-bank---global-economic-data)
5. [BLS - Bureau of Labor Statistics](#bls---bureau-of-labor-statistics)
6. [Treasury - US Fiscal Data](#treasury---us-fiscal-data)
7. [Hyperliquid - Crypto Derivatives](#hyperliquid---crypto-derivatives)

### Extended Providers (Phase 16E)
8. [Alpha Vantage - Stock Market & Economic Indicators](#alpha-vantage---stock-market--economic-indicators)
9. [Quandl - Alternative Economic Data](#quandl---alternative-economic-data)
10. [IMF - International Monetary Fund](#imf---international-monetary-fund)
11. [OECD - Development Statistics](#oecd---development-statistics)

---

## FRED - Federal Reserve Economic Data

**Icon:** 📊 | **Type:** `'fred'` | **API Key:** Required | **Rate Limit:** 120 requests/minute

### Overview

FRED (Federal Reserve Economic Data) provides access to 800,000+ US and international economic time series from 100+ sources.

### Configuration

```typescript
interface FREDDataSourceConfig {
  type: 'fred';
  id: string;
  name: string;
  seriesId: string; // FRED series ID (e.g., 'M2SL', 'GDPC1')

  // Optional parameters
  units?: 'lin' | 'chg' | 'ch1' | 'pch' | 'pc1' | 'pca' | 'cch' | 'cca' | 'log';
  frequency?: 'd' | 'w' | 'bw' | 'm' | 'q' | 'sa' | 'a' | 'wef' | 'weth' | 'wew' | 'wetu' | 'wem' | 'wesu' | 'wesa' | 'bwew' | 'bwem';
  aggregationMethod?: 'avg' | 'sum' | 'eop';
  dateRange?: {
    start?: string; // YYYY-MM-DD
    end?: string;
    limit?: number; // Recent N observations
  };

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Units (Server-Side Transformations)

| Unit | Description | Use Case |
|------|-------------|----------|
| `lin` | Levels (no transformation) | Raw data values |
| `chg` | Change | Absolute difference from previous period |
| `ch1` | Change from Year Ago | Absolute change YoY |
| `pch` | Percent Change | Period-over-period % |
| **`pc1`** | **Percent Change from Year Ago** | **YoY % (most common)** ⭐ |
| `pca` | Compounded Annual Rate of Change | Annualized growth |
| `cch` | Continuously Compounded Rate of Change | Log returns |
| `cca` | Continuously Compounded Annual Rate of Change | Annualized log returns |
| `log` | Natural Log | Log transformation |

### Common Series

```typescript
// Money Supply
'M2SL'            // M2 Money Stock
'M1SL'            // M1 Money Stock
'WALCL'           // Fed Balance Sheet

// Economic Indicators
'GDPC1'           // Real GDP
'IPMAN'           // ISM Manufacturing PMI
'UMCSENT'         // Consumer Sentiment
'CPIAUCSL'        // Consumer Price Index

// Labor Market
'UNRATE'          // Unemployment Rate
'CIVPART'         // Labor Force Participation
'PAYEMS'          // Nonfarm Payrolls

// Financial Markets
'GS10'            // 10-Year Treasury Yield
'FEDFUNDS'        // Federal Funds Rate
'NFCI'            // Financial Conditions Index
'SP500'           // S&P 500 Index

// Debt
'GFDEGDQ188S'     // Federal Debt/GDP
'GFDEBTN'         // Total Public Debt
```

### Example Usage

```typescript
// Simple: Get raw M2 data
const m2 = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2',
  name: 'M2 Money Supply',
  seriesId: 'M2SL'
});

// Advanced: Get YoY% change with weekly aggregation
const m2YoY = await dataProviderRegistry.fetch({
  type: 'fred',
  id: 'm2-yoy-weekly',
  name: 'M2 YoY Weekly',
  seriesId: 'M2SL',
  units: 'pc1', // Year-over-year percentage change
  frequency: 'w', // Weekly
  aggregationMethod: 'avg',
  dateRange: {
    start: '2020-01-01',
    limit: 200
  }
});
```

### Best Practices

- **Always use `units: 'pc1'`** for YoY calculations instead of client-side transforms
- Cache TTL: 24 hours (economic data updates daily)
- Use `limit` parameter to reduce data transfer
- Specify `frequency` when you need specific time intervals

---

## CoinGecko - Cryptocurrency Data

**Icon:** 🦎 | **Type:** `'coingecko'` | **API Key:** Optional | **Rate Limit:** 10-50 req/min (tier-based)

### Overview

CoinGecko provides cryptocurrency prices, market data, and historical charts for 10,000+ cryptocurrencies.

### Configuration

```typescript
interface CoinGeckoDataSourceConfig {
  type: 'coingecko';
  id: string;
  name: string;
  coinId: string; // CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')

  // Optional parameters
  vsCurrency?: 'usd' | 'eur' | 'gbp' | 'btc' | 'eth' | 'xau' | string;
  days?: number | 'max'; // Days of history (1, 7, 30, 90, 365, 'max')
  interval?: 'daily' | 'hourly' | '5m';

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Common Coins

```typescript
'bitcoin'         // Bitcoin (BTC)
'ethereum'        // Ethereum (ETH)
'solana'          // Solana (SOL)
'cardano'         // Cardano (ADA)
'polkadot'        // Polkadot (DOT)
'avalanche-2'     // Avalanche (AVAX)
'chainlink'       // Chainlink (LINK)
```

### Vs Currency Options

```typescript
'usd'     // US Dollar
'eur'     // Euro
'gbp'     // British Pound
'btc'     // Bitcoin (for altcoin/BTC ratios)
'eth'     // Ethereum
'xau'     // Gold (interesting for BTC/Gold ratio)
```

### Example Usage

```typescript
// Bitcoin price in USD
const btc = await dataProviderRegistry.fetch({
  type: 'coingecko',
  id: 'btc-usd',
  name: 'Bitcoin',
  coinId: 'bitcoin',
  vsCurrency: 'usd',
  days: 'max'
});

// ETH/BTC ratio (Ethereum strength vs Bitcoin)
const ethBtc = await dataProviderRegistry.fetch({
  type: 'coingecko',
  id: 'eth-btc',
  name: 'ETH/BTC Ratio',
  coinId: 'ethereum',
  vsCurrency: 'btc', // Price in BTC
  days: 365
});

// Bitcoin vs Gold
const btcGold = await dataProviderRegistry.fetch({
  type: 'coingecko',
  id: 'btc-gold',
  name: 'Bitcoin vs Gold',
  coinId: 'bitcoin',
  vsCurrency: 'xau',
  days: 'max'
});
```

### Best Practices

- Cache TTL: 5 minutes (crypto prices are volatile)
- Use `days: 'max'` for long-term analysis
- **No server-side YoY** - use client-side transforms for percentage calculations
- Consider using `vsCurrency: 'btc'` for altcoin analysis

---

## Yahoo Finance - Stock Market Data

**Icon:** 💹 | **Type:** `'yahoo'` | **API Key:** Not needed (server-side proxy) | **Rate Limit:** Handled by proxy

### Overview

Yahoo Finance provides stock market data including prices, indices, and financial instruments.

### Configuration

```typescript
interface YahooDataSourceConfig {
  type: 'yahoo';
  id: string;
  name: string;
  symbol: string; // Yahoo symbol (e.g., '^GSPC', 'AAPL')

  // Optional parameters
  interval?: '1d' | '1wk' | '1mo';
  dateRange?: {
    start?: string; // YYYY-MM-DD
    end?: string;
  };
  includeAdjustedClose?: boolean;

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Common Symbols

```typescript
// Indices
'^GSPC'           // S&P 500
'^NDX'            // NASDAQ 100
'^DJI'            // Dow Jones Industrial Average
'^VIX'            // CBOE Volatility Index
'^FTSE'           // FTSE 100 (UK)
'^N225'           // Nikkei 225 (Japan)

// Individual Stocks
'AAPL'            // Apple Inc.
'MSFT'            // Microsoft Corp.
'GOOGL'           // Alphabet Inc.
'TSLA'            // Tesla Inc.
'NVDA'            // NVIDIA Corp.

// ETFs
'SPY'             // SPDR S&P 500 ETF
'QQQ'             // Invesco QQQ (NASDAQ 100)
'GLD'             // SPDR Gold Trust
```

### Example Usage

```typescript
// S&P 500 daily data
const sp500 = await dataProviderRegistry.fetch({
  type: 'yahoo',
  id: 'sp500',
  name: 'S&P 500',
  symbol: '^GSPC',
  interval: '1d',
  dateRange: {
    start: '2020-01-01'
  }
});

// Apple weekly data with adjusted close
const aapl = await dataProviderRegistry.fetch({
  type: 'yahoo',
  id: 'aapl-weekly',
  name: 'Apple Inc.',
  symbol: 'AAPL',
  interval: '1wk',
  includeAdjustedClose: true
});
```

### Best Practices

- Cache TTL: 24 hours (daily close data)
- Use `1wk` interval for long-term analysis
- Use `includeAdjustedClose: true` for total return calculations
- **No server-side transforms** - use client-side for YoY calculations

---

## World Bank - Global Economic Data

**Icon:** 🏦 | **Type:** `'worldbank'` | **API Key:** Not needed | **Rate Limit:** None official

### Overview

World Bank Open Data provides access to global development data including GDP, population, debt, and social indicators for 200+ countries.

### Configuration

```typescript
interface WorldBankDataSourceConfig {
  type: 'worldbank';
  id: string;
  name: string;
  indicatorCode: string; // World Bank indicator (e.g., 'NY.GDP.MKTP.CD')

  // Optional parameters
  countryCode?: string; // ISO 3-letter code (default: 'USA')
  dateRange?: {
    start?: number; // Year (e.g., 2000)
    end?: number;   // Year (e.g., 2023)
  };

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Common Indicators

```typescript
// GDP & Growth
'NY.GDP.MKTP.CD'           // GDP (current US$)
'NY.GDP.MKTP.KD.ZG'        // GDP growth (annual %)
'NY.GDP.PCAP.CD'           // GDP per capita

// Population
'SP.POP.TOTL'              // Population, total
'SP.POP.GROW'              // Population growth (annual %)
'SP.URB.TOTL.IN.ZS'        // Urban population (% of total)

// Debt & Finance
'GC.DOD.TOTL.GD.ZS'        // Central government debt (% of GDP)
'DT.DOD.DECT.GD.ZS'        // External debt (% of GDP)

// Trade & Investment
'NE.EXP.GNFS.ZS'           // Exports (% of GDP)
'NE.IMP.GNFS.ZS'           // Imports (% of GDP)
'BX.KLT.DINV.WD.GD.ZS'     // FDI (% of GDP)

// Inflation & Prices
'FP.CPI.TOTL.ZG'           // Inflation, consumer prices (%)
'PA.NUS.FCRF'              // Exchange rate (LCU per US$)

// Labor & Employment
'SL.UEM.TOTL.ZS'           // Unemployment (% of total labor force)
'SL.TLF.CACT.ZS'           // Labor force participation (%)
```

### Country Codes

```typescript
'USA'     // United States
'CHN'     // China
'JPN'     // Japan
'DEU'     // Germany
'GBR'     // United Kingdom
'FRA'     // France
'IND'     // India
'BRA'     // Brazil
'CAN'     // Canada
'AUS'     // Australia
'WLD'     // World (aggregate)
```

### Example Usage

```typescript
// US GDP
const usGdp = await dataProviderRegistry.fetch({
  type: 'worldbank',
  id: 'us-gdp',
  name: 'US GDP',
  indicatorCode: 'NY.GDP.MKTP.CD',
  countryCode: 'USA',
  dateRange: {
    start: 2000,
    end: 2023
  }
});

// Global population
const worldPop = await dataProviderRegistry.fetch({
  type: 'worldbank',
  id: 'world-population',
  name: 'World Population',
  indicatorCode: 'SP.POP.TOTL',
  countryCode: 'WLD'
});

// China debt/GDP
const chinaDebt = await dataProviderRegistry.fetch({
  type: 'worldbank',
  id: 'china-debt',
  name: 'China Debt/GDP',
  indicatorCode: 'GC.DOD.TOTL.GD.ZS',
  countryCode: 'CHN'
});
```

### Best Practices

- Cache TTL: 7 days (annual/quarterly data updates slowly)
- Data frequency: Mostly annual, some quarterly
- **Response format:** Reversed (newest first) - provider handles reversal
- Use `countryCode: 'WLD'` for global aggregates

---

## BLS - Bureau of Labor Statistics

**Icon:** 👷 | **Type:** `'bls'` | **API Key:** Optional | **Rate Limit:** 25/day (500/day with key)

### Overview

BLS provides US labor market data including unemployment, employment, wages, and price indices (CPI, PPI).

### Configuration

```typescript
interface BLSDataSourceConfig {
  type: 'bls';
  id: string;
  name: string;
  seriesId: string; // BLS series ID (e.g., 'LNS14000000')

  // Optional parameters
  dateRange?: {
    startYear?: number;
    endYear?: number;
  };
  calculations?: boolean; // Include percent changes

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Common Series

```typescript
// Unemployment
'LNS14000000'     // Unemployment Rate
'LNS13000000'     // Employment Level
'LNS12300000'     // Employment-Population Ratio

// Labor Force
'LNS11300000'     // Labor Force Participation Rate
'LNS11000000'     // Civilian Labor Force Level

// Employment
'CES0000000001'   // Nonfarm Payrolls
'CES0500000001'   // Total Private Employment
'CES9000000001'   // Government Employment

// Prices
'CUUR0000SA0'     // CPI All Items (Urban)
'CUUR0000SA0L1E'  // CPI All Items Less Food & Energy
'WPUFD4'          // PPI Final Demand
'WPUFD49104'      // PPI Final Demand Services

// Wages
'CES0500000003'   // Average Hourly Earnings (Private)
'CES0500000011'   // Average Weekly Hours (Private)
```

### Period Codes

BLS data includes period codes that the provider automatically converts:

```typescript
'M01' - 'M12'     // Monthly (January - December)
'Q01' - 'Q04'     // Quarterly (Q1 - Q4)
'A01'             // Annual
```

### Example Usage

```typescript
// Unemployment rate
const unemployment = await dataProviderRegistry.fetch({
  type: 'bls',
  id: 'unemployment',
  name: 'Unemployment Rate',
  seriesId: 'LNS14000000',
  dateRange: {
    startYear: 2010,
    endYear: 2024
  }
});

// CPI with percent changes
const cpi = await dataProviderRegistry.fetch({
  type: 'bls',
  id: 'cpi-calculations',
  name: 'CPI All Items',
  seriesId: 'CUUR0000SA0',
  calculations: true, // Include MoM, YoY percent changes
  dateRange: {
    startYear: 2020,
    endYear: 2024
  }
});
```

### Best Practices

- Cache TTL: 24 hours
- **Rate limit:** 25 requests/day without API key, 500/day with key
- Set both `startYear` and `endYear` for dateRange (required together)
- Use `calculations: true` for server-side percent changes
- **Register for API key** at https://www.bls.gov/developers/

---

## Treasury - US Fiscal Data

**Icon:** 💰 | **Type:** `'treasury'` | **API Key:** Not needed | **Rate Limit:** None official

### Overview

US Treasury Fiscal Data API provides access to federal debt, interest rates, and fiscal statistics.

### Configuration

```typescript
interface TreasuryDataSourceConfig {
  type: 'treasury';
  id: string;
  name: string;
  dataset: 'debt_to_penny' | 'historical_debt' | 'avg_interest_rates' | 'interest_expense';

  // Optional parameters
  dateRange?: {
    start?: string; // YYYY-MM-DD
    end?: string;
  };
  fields?: string[]; // Specific fields to fetch

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Datasets

#### `debt_to_penny`
**Daily debt to the penny**

Fields:
- `record_date` → date
- `tot_pub_debt_out_amt` → Total Public Debt Outstanding

URL: `/v2/accounting/od/debt_to_penny`

#### `historical_debt`
**Historical debt outstanding (annual)**

Fields:
- `record_fiscal_year` → Year
- `debt_outstanding_amt` → Debt Outstanding

URL: `/v1/accounting/od/historical_debt_outstanding`

#### `avg_interest_rates`
**Average interest rates on debt**

Fields:
- `record_date` → date
- `avg_interest_rate_amt` → Average Interest Rate

URL: `/v2/accounting/od/avg_interest_rates`

#### `interest_expense`
**Interest expense on the debt**

Fields:
- `record_fiscal_year` → Year
- `record_fiscal_month` → Month
- `interest_expense_amt` → Interest Expense

URL: `/v1/accounting/od/interest_expense`

### Example Usage

```typescript
// Daily debt to the penny
const debt = await dataProviderRegistry.fetch({
  type: 'treasury',
  id: 'debt-daily',
  name: 'Debt to the Penny',
  dataset: 'debt_to_penny',
  dateRange: {
    start: '2020-01-01',
    end: '2024-12-31'
  }
});

// Average interest rates
const rates = await dataProviderRegistry.fetch({
  type: 'treasury',
  id: 'avg-rates',
  name: 'Average Interest Rates',
  dataset: 'avg_interest_rates',
  dateRange: {
    start: '2010-01-01'
  }
});

// Historical debt (annual)
const historicalDebt = await dataProviderRegistry.fetch({
  type: 'treasury',
  id: 'historical-debt',
  name: 'Historical Debt Outstanding',
  dataset: 'historical_debt'
});
```

### Best Practices

- Cache TTL: 24 hours
- **Pagination limit:** 1000 records per request (automatic pagination)
- Large datasets may take 1-2 seconds
- Date filtering recommended for `debt_to_penny` (daily data)

---

## Hyperliquid - Crypto Derivatives

**Icon:** ⚡ | **Type:** `'hyperliquid'` | **API Key:** Not needed | **Rate Limit:** None official

### Overview

Hyperliquid DEX provides perpetual futures data for cryptocurrencies including candles, funding rates, and open interest.

### Configuration

```typescript
interface HyperliquidDataSourceConfig {
  type: 'hyperliquid';
  id: string;
  name: string;
  coin: string; // Symbol (e.g., 'BTC', 'ETH', 'SOL')
  dataType: 'candles' | 'fundingHistory' | 'openInterest';

  // Optional parameters
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '12h' | '1d' | '1w';
  dateRange?: {
    startTime?: number; // Unix timestamp (ms)
    endTime?: number;
  };

  cache?: CacheStrategy;
  display?: DisplayConfig;
}
```

### Supported Coins

```typescript
'BTC'      // Bitcoin perpetual
'ETH'      // Ethereum perpetual
'SOL'      // Solana perpetual
'ARB'      // Arbitrum perpetual
'AVAX'     // Avalanche perpetual
'HYPE'     // Hyperliquid token
// ... and many more
```

### Data Types

#### `candles`
**OHLCV candlestick data**

Returns: `{ t: timestamp, o: open, h: high, l: low, c: close, v: volume }`

Transform: Uses close price (`c`)

#### `fundingHistory`
**Funding rate history**

Returns: `{ time: timestamp, fundingRate: rate }`

Transform: Converts to percentage (* 100)

#### `openInterest`
**Current open interest**

Returns: `{ openInterest: value }`

Transform: Single current value

### Example Usage

```typescript
// Bitcoin daily candles
const btcCandles = await dataProviderRegistry.fetch({
  type: 'hyperliquid',
  id: 'btc-candles',
  name: 'Bitcoin Perpetual',
  coin: 'BTC',
  dataType: 'candles',
  interval: '1d',
  dateRange: {
    startTime: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
    endTime: Date.now()
  }
});

// Ethereum funding rates
const ethFunding = await dataProviderRegistry.fetch({
  type: 'hyperliquid',
  id: 'eth-funding',
  name: 'ETH Funding Rate',
  coin: 'ETH',
  dataType: 'fundingHistory',
  dateRange: {
    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
  }
});

// Bitcoin open interest (current)
const btcOI = await dataProviderRegistry.fetch({
  type: 'hyperliquid',
  id: 'btc-oi',
  name: 'Bitcoin Open Interest',
  coin: 'BTC',
  dataType: 'openInterest'
});
```

### Best Practices

- Cache TTL: 5 minutes (real-time derivatives data)
- **Use POST requests** (handled by proxy)
- `openInterest` returns single current value
- Funding rates updated every 8 hours
- Use `1d` or `4h` intervals for analysis

---

## SDMX Providers (Future Integration)

**SDMX:** Statistical Data and Metadata eXchange (ISO 17369) | **Status:** Research Complete, Implementation Planned

### Overview

SDMX is an international standard for exchanging statistical data. 24+ organizations worldwide provide SDMX APIs for economic, financial, labor, and social statistics. We've identified 5 priority providers that fill critical gaps in our current data coverage.

### Why SDMX?

Current providers (FRED, World Bank, etc.) have limitations:
- **Frequency gaps:** World Bank only provides annual inflation data; Eurostat provides monthly HICP (12x improvement)
- **Coverage gaps:** No international labor statistics; ILO SDMX provides quarterly/monthly data for 190+ countries
- **Regional gaps:** Limited European financial data; ECB provides daily Euro area exchange rates and monetary statistics
- **Sector gaps:** No banking statistics; BIS provides consolidated banking stats and credit aggregates

### Priority Providers (P0 - Critical Gaps)

#### 1. ECB - European Central Bank
**Base URL:** `https://data-api.ecb.europa.eu/service/data/`
**Icon:** 🏦 | **Auth:** None | **Rate Limit:** None

**Best For:**
- Daily Euro area exchange rates (16:00 CET updates)
- ECB policy rates and monetary statistics
- Euro area financial indicators

**Example Series:**
- `EXR/D.USD.EUR.SP00.A` - EUR/USD daily exchange rate
- `FM/M.U2.EUR.4F.KR.MFI_BOOK.TOTL` - M3 money supply
- `IRS/M.AT.L.L40.CI.0000.EUR.N` - Interest rate statistics

**Fills Gap:** European exchange rates, ECB monetary policy data

#### 2. Eurostat - European Commission
**Base URL:** `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/`
**Icon:** 🇪🇺 | **Auth:** None | **Rate Limit:** None

**Best For:**
- Monthly EU inflation (HICP) - twice-daily updates
- Quarterly EU GDP and regional breakdowns
- Labor market statistics
- Population and demographics

**Example Series:**
- `prc_hicp_midx` - Monthly HICP (Harmonized Index of Consumer Prices)
- `nama_10_gdp` - Quarterly GDP by expenditure approach
- `lfsq_urgan` - Quarterly unemployment by age and gender
- `demo_pjan` - Annual population data

**Fills Gap:** EU monthly inflation (vs World Bank annual), regional EU statistics

#### 3. BIS - Bank for International Settlements
**Base URL:** `https://stats.bis.org/api/v1/data/`
**Icon:** 🏛️ | **Auth:** None | **Rate Limit:** Monitor usage

**Best For:**
- Consolidated banking statistics
- International credit aggregates
- Property price indices
- Debt securities statistics

**Example Series:**
- `WS_CBS_PUB` - Consolidated banking statistics
- `WS_LONG_CPI` - Long consumer price series
- `WS_XRU` - Exchange rates and USD indices
- `WS_CREDIT_GAP` - Credit-to-GDP gaps

**Fills Gap:** Banking statistics, international credit data

#### 4. ILO - International Labour Organization
**Base URL:** `https://www.ilo.org/sdmx/rest/data/`
**Icon:** 👷 | **Auth:** None | **Rate Limit:** None

**Best For:**
- International labor statistics (190+ countries)
- Quarterly/monthly employment data
- Informal employment
- Labor force participation

**Example Series:**
- `DF_EMP_TEMP_SEX_AGE_NB` - Employment by sex and age
- `DF_UNE_TUNE_SEX_AGE_NB` - Unemployment rates
- `DF_EAP_TEAP_SEX_AGE_NB` - Labor force participation
- `DF_EES_TEES_SEX_ECO_NB` - Employment by economic activity

**Fills Gap:** International labor data (vs World Bank annual only)

#### 5. UNSD - United Nations Statistics Division
**Base URL:** `https://data.un.org/ws/rest/data/`
**Icon:** 🌍 | **Auth:** None | **Rate Limit:** None

**Best For:**
- Sustainable Development Goal (SDG) indicators
- International trade statistics
- Demographics and population
- Environmental indicators

**Example Series:**
- `DF_SDG_GLH` - Global SDG indicators
- `DF_UNDATA_TRADE` - International trade
- `DF_UNDATA_WPP` - World population prospects
- `DF_UNDATA_ENERGY` - Energy statistics

**Fills Gap:** SDG indicators, granular UN data

### Implementation Status

**Research:** ✅ Complete
- [SDMX Ecosystem Research](./research/SDMX_ECOSYSTEM.md) - 87 pages covering 24+ providers, technical specs, client libraries
- [Data Sources Comparison](./DATA_SOURCES_COMPARISON.md) - 45+ pages of series-level overlap analysis

**Testing:** ✅ Complete
- Comprehensive test suite with quality checks
- CLI tool for testing individual providers
- See [TESTING.md](./TESTING.md) for details

**Storage:** ✅ Complete
- Dual storage layer (IndexedDB + SQLite)
- Bidirectional sync with conflict resolution
- See [STORAGE.md](./STORAGE.md) for details

**Implementation:** 🔄 Planned
- TypeScript providers using sdmx1 library
- BaseProvider pattern integration
- Mock mode support
- Caching and rate limiting

### SDMX Technical Details

**Data Formats Supported:**
- SDMX-JSON (preferred)
- SDMX-ML (XML)
- SDMX-CSV

**RESTful API Version:** 2.2.2 (August 2025 spec)

**Client Libraries:**
- `sdmx1` (Python) - Recommended for testing
- `rsdmx` (R) - R integration
- Custom TypeScript implementation (planned)

**Authentication:** Top 5 providers require no authentication

**Rate Limits:** Generally none or generous (varies by provider)

### Related Documentation

- **[SDMX Ecosystem](./research/SDMX_ECOSYSTEM.md)** - Complete research on SDMX standard and providers
- **[Data Sources Comparison](./DATA_SOURCES_COMPARISON.md)** - Series-level overlap analysis across all 16 providers
- **[Testing Guide](./TESTING.md)** - How to test providers and validate data quality
- **[Storage Documentation](./STORAGE.md)** - Dual storage architecture with sync

---

## Provider Comparison Matrix

| Feature | FRED | CoinGecko | Yahoo | WorldBank | BLS | Treasury | Hyperliquid |
|---------|------|-----------|-------|-----------|-----|----------|-------------|
| **Server-side YoY** | ✅ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ |
| **Frequency Options** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Date Range** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **API Key Required** | ✅ | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| **Rate Limits** | 120/min | 10-50/min | Proxy | None | 25/day | None | None |
| **Data Frequency** | Variable | Daily | Daily | Annual | Monthly | Daily/Annual | Real-time |
| **Cache TTL (default)** | 24h | 5m | 24h | 7d | 24h | 24h | 5m |

*BLS `calculations` parameter provides percent changes

---

## Alpha Vantage - Stock Market & Economic Indicators

**Icon:** 📈 | **Type:** `'alphavantage'` | **API Key:** Required | **Rate Limit:** 25 requests/day (free tier)

### Overview

Alpha Vantage provides stock market data, forex, cryptocurrency, and economic indicators. Ideal for fundamental analysis and economic data not available in FRED.

### Configuration

```typescript
interface AlphaVantageDataSourceConfig {
  type: 'alphavantage';
  id: string;
  name: string;
  function: AlphaVantageFunction;  // API function type
  symbol: string;                   // Stock ticker, forex pair, or crypto

  // Optional parameters
  interval?: '1min' | '5min' | '15min' | '30min' | '60min';
  outputsize?: 'compact' | 'full';  // 100 vs 20+ years
  datatype?: 'json' | 'csv';

  // Forex parameters
  fromCurrency?: string;
  toCurrency?: string;
}
```

### Functions

**Time Series (Stocks):**
- `TIME_SERIES_DAILY` - Daily stock prices
- `TIME_SERIES_DAILY_ADJUSTED` - With dividends/splits
- `TIME_SERIES_WEEKLY`, `TIME_SERIES_MONTHLY`

**Forex:**
- `FX_DAILY`, `FX_WEEKLY`, `FX_MONTHLY`

**Crypto:**
- `DIGITAL_CURRENCY_DAILY` - Crypto prices in USD

**Economic Indicators:**
- `REAL_GDP`, `TREASURY_YIELD`, `FEDERAL_FUNDS_RATE`
- `CPI`, `INFLATION`, `UNEMPLOYMENT`

### Example Usage

```typescript
// Stock data with adjusted close
const aapl = await dataProviderRegistry.fetch({
  type: 'alphavantage',
  id: 'aapl',
  name: 'Apple Stock',
  function: 'TIME_SERIES_DAILY_ADJUSTED',
  symbol: 'AAPL',
  outputsize: 'compact',
  display: { color: '#a3a3a3', label: 'AAPL' }
});

// Economic indicator
const gdp = await dataProviderRegistry.fetch({
  type: 'alphavantage',
  id: 'real-gdp',
  name: 'Real GDP',
  function: 'REAL_GDP',
  symbol: 'annual',
  display: { color: '#3b82f6', label: 'Real GDP' }
});
```

### API Key Setup

1. Visit https://www.alphavantage.co/support/#api-key
2. Get free API key (25 requests/day)
3. Add to `.env`: `ALPHAVANTAGE_API_KEY=your_key`

---

## Quandl - Alternative Economic Data

**Icon:** 📊 | **Type:** `'quandl'` | **API Key:** Optional | **Rate Limit:** 50/day (anonymous), 500/day (with key)

### Overview

Quandl (now Nasdaq Data Link) provides alternative economic time series, commodities data, and financial indicators. Great for cross-validated data sources.

### Configuration

```typescript
interface QuandlDataSourceConfig {
  type: 'quandl';
  id: string;
  name: string;
  databaseCode: string;  // e.g., 'FRED', 'LBMA', 'CHRIS'
  datasetCode: string;   // e.g., 'GDP', 'GOLD'

  // Optional parameters
  column?: number;       // Which column to extract
  startDate?: string;    // YYYY-MM-DD
  endDate?: string;
  collapse?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  transform?: 'diff' | 'rdiff' | 'cumul' | 'normalize';
  rows?: number;         // Limit number of rows
}
```

### Common Datasets

```typescript
// Precious metals (LBMA)
{ database: 'LBMA', dataset: 'GOLD' }   // London gold prices
{ database: 'LBMA', dataset: 'SILVER' }  // London silver prices

// Commodities (CHRIS/CME)
{ database: 'CHRIS', dataset: 'CME_CL1' }  // Crude oil futures
{ database: 'CHRIS', dataset: 'CME_GC1' }  // Gold futures

// OPEC
{ database: 'OPEC', dataset: 'ORB' }  // OPEC basket price
```

### Example Usage

```typescript
// Gold prices with monthly aggregation
const gold = await dataProviderRegistry.fetch({
  type: 'quandl',
  id: 'gold',
  name: 'Gold Prices',
  databaseCode: 'LBMA',
  datasetCode: 'GOLD',
  collapse: 'monthly',
  startDate: '2020-01-01',
  display: { color: '#f59e0b', label: 'Gold' }
});
```

### API Key Setup (Optional)

1. Visit https://data.nasdaq.com/sign-up
2. Get free API key
3. Add to `.env`: `QUANDL_API_KEY=your_key`
4. Increases limit: 50/day → 500/day

---

## IMF - International Monetary Fund

**Icon:** 🌍 | **Type:** `'imf'` | **API Key:** Not Required | **Rate Limit:** None

### Overview

IMF provides international monetary data and global economic statistics. Essential for cross-country comparisons and global economic analysis.

### Configuration

```typescript
interface IMFDataSourceConfig {
  type: 'imf';
  id: string;
  name: string;
  databaseId: string;    // e.g., 'IFS' (International Financial Statistics)
  indicator: string;     // e.g., 'NGDP_R_SA_XDC' (Real GDP)
  frequency: 'A' | 'Q' | 'M';  // Annual, Quarterly, Monthly
  countryCode: string;   // ISO 3-letter code (e.g., 'USA', 'CHN')

  // Optional parameters
  startPeriod?: string;  // e.g., '2010'
  endPeriod?: string;
}
```

### Common Indicators (IFS Database)

```typescript
// GDP
'NGDP_R_SA_XDC'  // Real GDP, Seasonally Adjusted
'NGDP_XDC'       // Nominal GDP

// Prices
'PCPI_IX'        // Consumer Price Index
'PCPI_PC_CP_A_PT' // CPI, Year-over-year

// Employment
'LUR_PT'         // Unemployment Rate

// Money & Banking
'FM_XDC'         // M2 Money Supply
'FILR_PA'        // Lending Interest Rate

// Balance of Payments
'BCA_BP6_USD'    // Current Account Balance

// Reserves
'RAFA_USD'       // Total Reserves
```

### Country Codes

```typescript
// Major economies
'USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'ITA', 'CAN'

// BRICS
'CHN', 'IND', 'BRA', 'RUS', 'ZAF'

// Aggregates
'W00'  // World
'U2'   // Euro Area
```

### Example Usage

```typescript
// USA vs China Real GDP comparison
const usaGdp = await dataProviderRegistry.fetch({
  type: 'imf',
  id: 'usa-gdp',
  name: 'USA Real GDP',
  databaseId: 'IFS',
  indicator: 'NGDP_R_SA_XDC',
  frequency: 'Q',
  countryCode: 'USA',
  display: { color: '#3b82f6', label: 'USA' }
});

const chnGdp = await dataProviderRegistry.fetch({
  type: 'imf',
  id: 'chn-gdp',
  name: 'China Real GDP',
  databaseId: 'IFS',
  indicator: 'NGDP_R_SA_XDC',
  frequency: 'Q',
  countryCode: 'CHN',
  display: { color: '#ef4444', label: 'China' }
});
```

---

## OECD - Development Statistics

**Icon:** 📊 | **Type:** `'oecd'` | **API Key:** Not Required | **Rate Limit:** None

### Overview

OECD provides development statistics and economic indicators for developed nations. Comprehensive labor market, trade, and social indicators.

### Configuration

```typescript
interface OECDDataSourceConfig {
  type: 'oecd';
  id: string;
  name: string;
  dataset: string;       // e.g., 'QNA', 'MEI'
  indicator: string;     // e.g., 'GDP', 'CPALTT01'
  location: string;      // e.g., 'USA', 'OECD'

  // Optional parameters
  frequency?: 'A' | 'Q' | 'M';
  startTime?: string;
  endTime?: string;
}
```

### Common Datasets

**QNA** - Quarterly National Accounts
- `GDP` - Gross Domestic Product
- `B1_GE` - GDP expenditure approach
- `P3` - Government consumption
- `P31S14_S15` - Household consumption

**MEI** - Main Economic Indicators
- `CPALTT01` - Consumer Price Index
- `PPPGTT01` - Producer Price Index
- `LRHUTTTT` - Harmonized Unemployment Rate
- `PRMNTO01` - Industrial production

### Locations

```typescript
// G7
'USA', 'JPN', 'DEU', 'GBR', 'FRA', 'ITA', 'CAN'

// Other major
'CHN', 'IND', 'KOR', 'AUS', 'MEX', 'ESP'

// Aggregates
'OECD'       // OECD total
'EU27_2020'  // European Union
'EA19'       // Euro area
'G7', 'G20'  // G7/G20 countries
```

### Example Usage

```typescript
// OECD GDP comparison
const oecdGdp = await dataProviderRegistry.fetch({
  type: 'oecd',
  id: 'oecd-gdp',
  name: 'OECD GDP',
  dataset: 'QNA',
  indicator: 'GDP',
  location: 'OECD',
  frequency: 'Q',
  display: { color: '#3b82f6', label: 'OECD' }
});
```

---

## Provider Comparison (Updated)

| Provider | Auth | Rate Limit | Coverage | Best For |
|----------|------|------------|----------|----------|
| **FRED** | Required | 120/min | US + International | US economic data |
| **CoinGecko** | Optional | 30/min | 13,000+ coins | Crypto prices |
| **Yahoo** | None | Generous | Global stocks | Stock prices |
| **World Bank** | None | Generous | 190+ countries | International development |
| **BLS** | Optional | 25-500/day | US only | US labor data |
| **Treasury** | None | Generous | US only | US federal debt |
| **Hyperliquid** | None | Generous | Crypto | Crypto derivatives |
| **Alpha Vantage** | Required | 25/day | Global | Stock fundamentals |
| **Quandl** | Optional | 50-500/day | Various | Alternative data |
| **IMF** | None | None | 190+ countries | International monetary |
| **OECD** | None | None | OECD members | Development stats |

### Updated Quick Reference

| Metric | FRED | CoinGecko | Yahoo | WB | BLS | Treasury | Hyperliquid | Alpha V | Quandl | IMF | OECD |
|--------|------|-----------|-------|----|----|----------|-------------|---------|---------|-----|------|
| **Auth Required** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Free Tier** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rate Limit** | 120/m | 30/m | High | High | 25/d | High | High | 25/d | 50/d | None | None |
| **Data Frequency** | Various | 5m | Daily | Annual | Monthly | Daily | 1m | Daily | Various | Various | Various |
| **Cache TTL (default)** | 24h | 5m | 24h | 7d | 24h | 24h | 5m | 24h | 24h | 7d | 7d |

*BLS `calculations` parameter provides percent changes

---

## Getting API Keys (Updated)

### FRED (Required)
1. Visit https://fred.stlouisfed.org/
2. Create free account
3. Go to "My Account" → "API Keys"
4. Generate API key
5. Add to `.env`: `FRED_API_KEY=your_key`

### BLS (Optional, Recommended)
1. Visit https://www.bls.gov/developers/
2. Register for account
3. Request API key
4. Add to `.env`: `BLS_API_KEY=your_key`
5. Increases rate limit from 25/day to 500/day

### CoinGecko (Optional)
1. Visit https://www.coingecko.com/en/api
2. Sign up for Pro API (paid)
3. Add to `.env`: `COINGECKO_API_KEY=your_key`
4. Increases rate limits and adds features

### Alpha Vantage (Required for Alpha Vantage provider)
1. Visit https://www.alphavantage.co/support/#api-key
2. Get free API key (instant)
3. Add to `.env`: `ALPHAVANTAGE_API_KEY=your_key`
4. Free tier: 25 requests/day

### Quandl (Optional for Quandl provider)
1. Visit https://data.nasdaq.com/sign-up
2. Sign up for free account
3. Get API key from account settings
4. Add to `.env`: `QUANDL_API_KEY=your_key`
5. Free tier: 50/day anonymous, 500/day with key

---

## Next Steps

- **[Transform Engine](./TRANSFORMS.md)** - Apply client-side transforms
- **[Graph System](./GRAPHS.md)** - Build enhanced graphs
- **[API Tester](./API_TESTER.md)** - Test providers visually
- **[Usage Examples](./EXAMPLES.md)** - Common patterns

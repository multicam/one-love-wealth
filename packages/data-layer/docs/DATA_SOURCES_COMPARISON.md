# Data Sources Comparison & Overlap Analysis

**Last Updated:** December 31, 2025
**Purpose:** Series-level comparison of overlapping economic data across all providers

---

## Table of Contents

1. [Overview](#overview)
2. [Comparison by Category](#comparison-by-category)
   - [GDP & Economic Output](#gdp--economic-output)
   - [Inflation & Prices](#inflation--prices)
   - [Labor Market](#labor-market)
   - [Interest Rates](#interest-rates)
   - [Exchange Rates](#exchange-rates)
   - [Money Supply](#money-supply)
   - [Government Debt](#government-debt)
   - [Stock Market Indices](#stock-market-indices)
   - [Trade & Balance of Payments](#trade--balance-of-payments)
   - [Banking & Financial Systems](#banking--financial-systems)
   - [Cryptocurrency](#cryptocurrency)
   - [Commodities](#commodities)
3. [Provider Capability Matrix](#provider-capability-matrix)
4. [Coverage Gaps Filled by SDMX](#coverage-gaps-filled-by-sdmx)
5. [Best Source Recommendations](#best-source-recommendations)
6. [Data Quality Considerations](#data-quality-considerations)

---

## Overview

The data layer integrates **11 existing providers** and can be enhanced with **5+ SDMX providers** to fill critical gaps in coverage, frequency, and geographic scope.

### Existing Providers (11)
1. **FRED** - Federal Reserve Economic Data (US + International)
2. **CoinGecko** - Cryptocurrency prices
3. **Yahoo Finance** - Stock market data
4. **World Bank** - Global development indicators
5. **BLS** - US Bureau of Labor Statistics
6. **Treasury** - US fiscal data
7. **Hyperliquid** - Crypto derivatives
8. **Alpha Vantage** - Stock & economic data
9. **Quandl** - Alternative economic data
10. **IMF** - International Monetary Fund
11. **OECD** - Development statistics

### Priority SDMX Providers (5)
1. **ECB** - European Central Bank
2. **Eurostat** - EU statistical office
3. **BIS** - Bank for International Settlements
4. **ILO** - International Labour Organization
5. **UNSD** - UN Statistics Division

---

## Comparison by Category

### GDP & Economic Output

#### Series Availability Comparison

| Metric | FRED | World Bank | IMF | OECD | Alpha Vantage | Eurostat |
|--------|------|------------|-----|------|---------------|----------|
| **US Real GDP** | ✅ GDPC1 | ✅ NY.GDP.MKTP.KD.ZG | ✅ NGDP_R_SA_XDC | ✅ QNA/GDP | ✅ REAL_GDP | ❌ |
| **Nominal GDP** | ✅ GDP | ✅ NY.GDP.MKTP.CD | ✅ NGDP_XDC | ✅ QNA/B1_GE | ✅ REAL_GDP | ✅ nama_10_gdp |
| **GDP per Capita** | ❌ | ✅ NY.GDP.PCAP.CD | ✅ | ✅ | ❌ | ✅ |
| **GDP Growth %** | ✅ | ✅ NY.GDP.MKTP.KD.ZG | ✅ | ✅ | ✅ | ✅ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **FRED** | Quarterly | 1947-present (77 years) | US + major economies |
| **World Bank** | Annual | 1960-2024 (64 years) | 190+ countries |
| **IMF** | Quarterly, Annual | 1950s-present (~70 years) | 190+ countries |
| **OECD** | Quarterly | 1960-present (64 years) | OECD members (~38 countries) |
| **Alpha Vantage** | Quarterly | 1999-present (~25 years) | US |
| **Eurostat** | Quarterly | 1995-present (~30 years) | EU-27 + EFTA |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **US GDP (Quarterly, Long History):** FRED `GDPC1` ⭐ (1947-present, quarterly)
- **International GDP Comparison (Annual):** World Bank `NY.GDP.MKTP.CD` ⭐ (190+ countries)
- **International GDP (Quarterly):** IMF `NGDP_R_SA_XDC` or OECD `QNA/GDP` ⭐
- **EU GDP (Quarterly, Granular):** Eurostat `nama_10_gdp` ⭐ (regional breakdowns)

**Gap Filled by SDMX:** Eurostat provides **quarterly** EU GDP with **regional (NUTS) breakdowns** not available elsewhere.

---

### Inflation & Prices

#### Series Availability Comparison

| Metric | FRED | BLS | World Bank | IMF | OECD | Alpha V | Eurostat | ECB |
|--------|------|-----|------------|-----|------|---------|----------|-----|
| **US CPI** | ✅ CPIAUCSL | ✅ CUUR0000SA0 | ❌ | ✅ PCPI_IX | ✅ CPALTT01 | ✅ CPI | ❌ | ❌ |
| **US Core CPI** | ✅ | ✅ CUUR0000SA0L1E | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Global CPI** | ❌ | ❌ | ✅ FP.CPI.TOTL.ZG | ✅ PCPI_PC_CP_A_PT | ✅ | ❌ | ❌ | ❌ |
| **EU HICP** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ prc_hicp_* | ✅ ICP |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage | Update Schedule |
|----------|-----------|------------------|----------|-----------------|
| **FRED** | Monthly | 1947-present | US + select international | Daily at 7:30 AM ET |
| **BLS** | Monthly | 1913-present (111 years) | US only | Monthly release |
| **World Bank** | Annual | 1960-2024 | 190+ countries | Annual |
| **IMF** | Monthly, Annual | 1950s-present | 190+ countries | Varies |
| **OECD** | Monthly | 1955-present (~70 years) | OECD members | Monthly |
| **Alpha Vantage** | Monthly | 1999-present | US | Monthly |
| **Eurostat** | **Monthly** | 1996-present | EU-27 + EFTA | **Twice daily (11:00, 23:00 CET)** ⭐ |
| **ECB** | Monthly, Quarterly | 1997-present | Euro area | Daily updates |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **US CPI (Monthly, Long History):** BLS `CUUR0000SA0` ⭐ (1913-present, authoritative source)
- **US CPI (With server-side YoY):** FRED `CPIAUCSL` with `units=pc1` ⭐
- **International CPI (Annual):** World Bank `FP.CPI.TOTL.ZG` or IMF `PCPI_PC_CP_A_PT`
- **EU HICP (Monthly, High Frequency):** Eurostat `prc_hicp_midx` ⭐⭐ **NEW** (twice-daily updates)

**Gap Filled by SDMX:**
- **Eurostat HICP:** Monthly EU inflation with **twice-daily updates** vs World Bank's **annual** data
- **ECB ICP:** Euro area inflation with detailed breakdowns

**Critical Finding:** For EU inflation analysis, Eurostat is **dramatically superior** to World Bank (monthly vs annual, twice-daily updates vs annual updates).

---

### Labor Market

#### Series Availability Comparison

| Metric | FRED | BLS | World Bank | IMF | OECD | ILO |
|--------|------|-----|------------|-----|------|-----|
| **US Unemployment Rate** | ✅ UNRATE | ✅ LNS14000000 | ✅ | ✅ LUR_PT | ✅ LRHUTTTT | ✅ |
| **US Nonfarm Payrolls** | ✅ PAYEMS | ✅ CES0000000001 | ❌ | ❌ | ❌ | ❌ |
| **US Labor Force Participation** | ✅ CIVPART | ✅ LNS11300000 | ✅ SL.TLF.CACT.ZS | ❌ | ✅ | ✅ |
| **Global Unemployment** | ❌ | ❌ | ✅ SL.UEM.TOTL.ZS | ✅ LUR_PT | ✅ | ✅ 190+ countries ⭐ |
| **Employment by Age/Sex** | ❌ | ✅ (limited) | ❌ | ❌ | ✅ | ✅ DF_EMP_TEMP_SEX_AGE_NB ⭐ |
| **Youth Unemployment** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ DF_YI_* ⭐ |
| **Informal Employment** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ ⭐⭐ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage | Update Schedule |
|----------|-----------|------------------|----------|-----------------|
| **FRED** | Monthly | 1948-present | US + select international | Daily |
| **BLS** | Monthly | 1948-present | US only | Monthly (first Friday) |
| **World Bank** | Annual | 1991-2024 | 190+ countries | Annual |
| **IMF** | Quarterly, Annual | 1980s-present | 190+ countries | Varies |
| **OECD** | Monthly, Quarterly | 1960-present | OECD members | Monthly |
| **ILO** | Annual, Quarterly, Monthly | 1990s-present | **190+ countries** | **Weekly (Sundays 10 PM Paris)** ⭐ |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **US Unemployment (Monthly):** BLS `LNS14000000` or FRED `UNRATE` ⭐ (authoritative, 1948-present)
- **US Employment (Monthly):** BLS `CES0000000001` or FRED `PAYEMS` ⭐ (nonfarm payrolls)
- **International Unemployment (Annual):** World Bank `SL.UEM.TOTL.ZS` (190+ countries)
- **International Unemployment (Quarterly/Monthly):** ILO SDMX ⭐⭐ **NEW** (190+ countries, weekly updates)
- **Demographic Breakdowns (Age/Sex):** ILO `DF_EMP_TEMP_SEX_AGE_NB` ⭐⭐ **UNIQUE**
- **Informal Economy Data:** ILO only ⭐⭐ **UNIQUE**

**Gap Filled by SDMX:**
- **ILO:** Only source for international labor data with **higher than annual frequency**
- **ILO:** Only source for **demographic breakdowns** (age, sex, informal employment) globally
- **BLS is US-only** - ILO fills the international gap

**Critical Finding:** ILO SDMX is the **only source** for quarterly/monthly international labor data and the **only source** for informal economy statistics globally.

---

### Interest Rates

#### Series Availability Comparison

| Metric | FRED | Yahoo | Treasury | Alpha V | IMF |
|--------|------|-------|----------|---------|-----|
| **10-Year Treasury Yield** | ✅ GS10 | ✅ ^TNX | ❌ | ✅ TREASURY_YIELD | ❌ |
| **Federal Funds Rate** | ✅ FEDFUNDS | ❌ | ❌ | ✅ FEDERAL_FUNDS_RATE | ❌ |
| **Average Debt Interest Rate** | ❌ | ❌ | ✅ avg_interest_rates | ❌ | ❌ |
| **Lending Interest Rate (Global)** | ❌ | ❌ | ❌ | ❌ | ✅ FILR_PA |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **FRED** | Daily, Weekly | 1962-present (GS10) | US rates |
| **Yahoo Finance** | Daily | 1990s-present | US Treasury yields |
| **Treasury** | Monthly | 2001-present | US debt rates |
| **Alpha Vantage** | Daily | 1999-present | US rates |
| **IMF** | Monthly, Annual | 1980s-present | 190+ countries |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **10-Year Treasury (Daily):** FRED `GS10` ⭐ (1962-present, authoritative)
- **Federal Funds Rate (Daily):** FRED `FEDFUNDS` ⭐ (1954-present)
- **Average Interest on Debt:** Treasury `avg_interest_rates` ⭐ (only source)
- **International Lending Rates:** IMF `FILR_PA` ⭐ (190+ countries)

---

### Exchange Rates

#### Series Availability Comparison

| Metric | Yahoo | World Bank | ECB | BIS |
|--------|-------|------------|-----|-----|
| **USD/EUR** | ✅ EURUSD=X | ✅ PA.NUS.FCRF (for each country) | ✅ EXR (EUR/USD) ⭐ | ✅ |
| **EUR/30 Currencies** | ⚠️ Partial | ❌ | ✅ EXR ⭐⭐ **NEW** | ✅ |
| **Effective Exchange Rates** | ❌ | ❌ | ❌ | ✅ WS_EER ⭐⭐ **UNIQUE** |
| **Bilateral Exchange Rates** | ✅ Various | ✅ PA.NUS.FCRF | ✅ | ✅ WS_XRU |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage | Update Time |
|----------|-----------|------------------|----------|-------------|
| **Yahoo Finance** | Daily | 2000-present | Major pairs | Real-time |
| **World Bank** | Annual | 1960-2024 | 190+ countries (LCU per USD) | Annual |
| **ECB** | **Daily** | 1999-present | **30 currencies vs EUR** | **Daily at 16:00 CET** ⭐ |
| **BIS** | Daily, Monthly | 1994-present | 60+ currencies | Daily/Monthly |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **USD/Major Currency (Real-time):** Yahoo Finance `{PAIR}=X` ⭐
- **EUR/30 Currencies (Daily, Official):** ECB `EXR` ⭐⭐ **NEW** (authoritative European rates)
- **Effective Exchange Rates:** BIS `WS_EER` ⭐⭐ **UNIQUE** (trade-weighted indices)
- **Historical Annual (All Countries):** World Bank `PA.NUS.FCRF`

**Gap Filled by SDMX:**
- **ECB EXR:** Daily EUR/30 currency pairs from **official source** (superior to Yahoo for European analysis)
- **BIS WS_EER:** Only source for **effective exchange rate indices** (trade-weighted)

**Critical Finding:** For European exchange rate analysis, ECB is the **authoritative source** with daily official rates at 16:00 CET. BIS is the **only source** for effective exchange rates.

---

### Money Supply

#### Series Availability Comparison

| Metric | FRED | IMF |
|--------|------|-----|
| **US M2** | ✅ M2SL | ✅ FM_XDC |
| **US M1** | ✅ M1SL | ✅ |
| **Fed Balance Sheet** | ✅ WALCL | ❌ |
| **International M2** | ⚠️ Limited | ✅ FM_XDC (190+ countries) ⭐ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **FRED** | Weekly, Monthly | 1959-present (M2) | US + limited international |
| **IMF** | Monthly | 1960s-present | 190+ countries |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **US M2 (Weekly):** FRED `M2SL` ⭐ (1959-present, most granular)
- **US M1 (Weekly):** FRED `M1SL` ⭐
- **Fed Balance Sheet:** FRED `WALCL` ⭐ (only source)
- **International M2:** IMF `FM_XDC` ⭐ (190+ countries)

---

### Government Debt

#### Series Availability Comparison

| Metric | FRED | Treasury | World Bank | IMF |
|--------|------|----------|------------|-----|
| **US Debt (Daily)** | ❌ | ✅ debt_to_penny ⭐⭐ | ❌ | ❌ |
| **US Debt (Historical)** | ✅ GFDEBTN | ✅ historical_debt | ❌ | ❌ |
| **US Debt/GDP** | ✅ GFDEGDQ188S | ❌ | ❌ | ❌ |
| **Global Debt/GDP** | ❌ | ❌ | ✅ GC.DOD.TOTL.GD.ZS | ✅ |
| **Interest Expense** | ❌ | ✅ interest_expense ⭐⭐ | ❌ | ❌ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **FRED** | Quarterly | 1966-present (Debt/GDP) | US |
| **Treasury** | **Daily**, Annual | 1993-present (daily) | US |
| **World Bank** | Annual | 1960-2024 | 190+ countries |
| **IMF** | Annual | 1980s-present | 190+ countries |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **US Debt (Daily):** Treasury `debt_to_penny` ⭐⭐ **UNIQUE** (only daily source)
- **US Debt/GDP (Quarterly):** FRED `GFDEGDQ188S` ⭐
- **US Interest Expense:** Treasury `interest_expense` ⭐⭐ **UNIQUE**
- **International Debt/GDP (Annual):** World Bank `GC.DOD.TOTL.GD.ZS` ⭐

---

### Stock Market Indices

#### Series Availability Comparison

| Metric | FRED | Yahoo | Alpha V |
|--------|------|-------|---------|
| **S&P 500** | ✅ SP500 | ✅ ^GSPC | ✅ TIME_SERIES_DAILY |
| **NASDAQ 100** | ❌ | ✅ ^NDX | ✅ |
| **Dow Jones** | ❌ | ✅ ^DJI | ✅ |
| **VIX** | ✅ VIXCLS | ✅ ^VIX | ❌ |
| **International Indices** | ⚠️ Limited | ✅ ^FTSE, ^N225, etc. | ✅ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **FRED** | Daily | 1990-present (SP500) | US indices |
| **Yahoo Finance** | Daily | 1980s-present (varies) | Global indices |
| **Alpha Vantage** | Daily, Intraday | 1999-present | Global indices |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **S&P 500 (Long History):** Yahoo `^GSPC` ⭐ (1927-present)
- **S&P 500 (Official):** FRED `SP500` or Yahoo `^GSPC`
- **VIX (Volatility):** FRED `VIXCLS` or Yahoo `^VIX` ⭐
- **International Indices:** Yahoo Finance ⭐ (comprehensive global coverage)

---

### Trade & Balance of Payments

#### Series Availability Comparison

| Metric | World Bank | IMF | UNSD |
|--------|------------|-----|------|
| **Exports (% GDP)** | ✅ NE.EXP.GNFS.ZS | ✅ | ✅ |
| **Imports (% GDP)** | ✅ NE.IMP.GNFS.ZS | ✅ | ✅ |
| **Current Account Balance** | ✅ | ✅ BCA_BP6_USD | ✅ |
| **International Merchandise Trade** | ⚠️ Limited | ⚠️ Limited | ✅ IMTS ⭐⭐ **DETAILED** |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **World Bank** | Annual | 1960-2024 | 190+ countries |
| **IMF** | Quarterly, Annual | 1980s-present | 190+ countries |
| **UNSD** | Monthly, Quarterly, Annual | 1990s-present | 193 UN member states |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **Trade (Annual, % GDP):** World Bank `NE.EXP.GNFS.ZS`, `NE.IMP.GNFS.ZS` ⭐
- **Current Account (Quarterly):** IMF `BCA_BP6_USD` ⭐
- **International Merchandise Trade (Detailed):** UNSD IMTS ⭐⭐ **NEW** (most detailed commodity-level data)

**Gap Filled by SDMX:** UNSD IMTS provides **commodity-level** international trade data not available at this granularity elsewhere.

---

### Banking & Financial Systems

#### Series Availability Comparison

| Metric | BIS | ECB |
|--------|-----|-----|
| **Locational Banking Statistics** | ✅ WS_LBS ⭐⭐ **UNIQUE** | ❌ |
| **Consolidated Banking Statistics** | ✅ WS_CBS ⭐⭐ **UNIQUE** | ❌ |
| **Credit-to-GDP Gaps** | ✅ WS_LONG_CRE ⭐⭐ **UNIQUE** | ❌ |
| **Debt Service Ratios** | ✅ WS_LONG_CRE ⭐⭐ **UNIQUE** | ❌ |
| **MFI Balance Sheets** | ❌ | ✅ BSI ⭐⭐ **UNIQUE** |
| **Property Prices (Cross-country)** | ✅ WS_SPP ⭐⭐ **UNIQUE** | ❌ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **BIS** | Daily, Monthly, Quarterly | 1964-present (varies by dataset) | 44+ reporting countries |
| **ECB** | Monthly, Quarterly | 1997-present | Euro area |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **International Banking Activity:** BIS `WS_LBS` ⭐⭐ **UNIQUE**
- **Banking Consolidation:** BIS `WS_CBS` ⭐⭐ **UNIQUE**
- **Credit Gaps & Systemic Risk:** BIS `WS_LONG_CRE` ⭐⭐ **UNIQUE**
- **Cross-Country Property Prices:** BIS `WS_SPP` ⭐⭐ **UNIQUE**
- **Euro Area Banking:** ECB `BSI` ⭐⭐ **UNIQUE**

**Gap Filled by SDMX:** BIS and ECB provide **entirely unique** banking and financial system data not available from any other provider.

**Critical Finding:** BIS SDMX is the **only source** for consolidated international banking statistics and cross-country property price comparisons.

---

### Cryptocurrency

#### Series Availability Comparison

| Metric | CoinGecko | Hyperliquid | Alpha V |
|--------|-----------|-------------|---------|
| **Spot Prices** | ✅ 10,000+ coins ⭐⭐ | ❌ | ✅ DIGITAL_CURRENCY_DAILY |
| **Historical Charts** | ✅ Max history | ❌ | ✅ Limited |
| **Perpetual Futures** | ❌ | ✅ candles ⭐⭐ | ❌ |
| **Funding Rates** | ❌ | ✅ fundingHistory ⭐⭐ **UNIQUE** | ❌ |
| **Open Interest** | ❌ | ✅ openInterest ⭐⭐ **UNIQUE** | ❌ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **CoinGecko** | 5-minute to daily | 2013-present (varies by coin) | 10,000+ coins |
| **Hyperliquid** | 1-minute to weekly | 2023-present | 50+ perpetuals |
| **Alpha Vantage** | Daily | 2018-present | Major coins |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **Spot Prices (Max Coverage):** CoinGecko ⭐⭐ (10,000+ coins)
- **Spot Prices (Major Coins):** CoinGecko or Alpha Vantage
- **Perpetual Futures (Derivatives):** Hyperliquid `candles` ⭐⭐
- **Funding Rates:** Hyperliquid `fundingHistory` ⭐⭐ **UNIQUE**
- **Open Interest:** Hyperliquid `openInterest` ⭐⭐ **UNIQUE**

**No SDMX Gap:** Cryptocurrency is well-covered by existing providers.

---

### Commodities

#### Series Availability Comparison

| Metric | Quandl | FRED | CoinGecko |
|--------|--------|------|-----------|
| **Gold (Spot)** | ✅ LBMA/GOLD | ✅ GOLDPMGBD228NLBM | ✅ XAU |
| **Silver (Spot)** | ✅ LBMA/SILVER | ✅ | ✅ XAG |
| **Crude Oil Futures** | ✅ CHRIS/CME_CL1 | ✅ DCOILWTICO | ❌ |
| **Gold Futures** | ✅ CHRIS/CME_GC1 | ❌ | ❌ |
| **OPEC Basket** | ✅ OPEC/ORB | ❌ | ❌ |

#### Frequency Comparison

| Provider | Frequency | Historical Depth | Coverage |
|----------|-----------|------------------|----------|
| **Quandl** | Daily | 1968-present (gold), varies | Commodities, metals, energy |
| **FRED** | Daily | 1986-present (oil), varies | Select commodities |
| **CoinGecko** | Real-time | 2013-present | Gold/Silver (crypto-denominated) |

#### Best Source Recommendation

**Use Case → Recommended Provider:**
- **Gold (Daily, Long History):** Quandl `LBMA/GOLD` ⭐ (1968-present)
- **Crude Oil (Daily):** FRED `DCOILWTICO` or Quandl `CHRIS/CME_CL1` ⭐
- **Commodities Futures:** Quandl `CHRIS/*` ⭐ (comprehensive futures data)
- **Gold vs BTC:** CoinGecko (Bitcoin priced in XAU) ⭐

**No SDMX Gap:** Commodities are well-covered by existing providers.

---

## Provider Capability Matrix

### Summary Table: What Each Provider Does Best

| Provider | Best For | Unique Capabilities | Update Frequency | Auth Required |
|----------|----------|---------------------|------------------|---------------|
| **FRED** | US economic data | Server-side YoY transforms | Daily | ✅ |
| **BLS** | US labor data (authoritative) | CPI/Employment (official US source) | Monthly | ⚠️ Recommended |
| **Treasury** | US fiscal data | Daily debt, interest expense | Daily | ❌ |
| **World Bank** | International annual data | 190+ countries, long history | Annual | ❌ |
| **IMF** | International quarterly/monthly | Standardized international indicators | Varies | ❌ |
| **OECD** | Developed nations | OECD member detailed stats | Monthly/Quarterly | ❌ |
| **Yahoo** | Stock market data | Global indices/stocks | Daily | ❌ |
| **CoinGecko** | Crypto spot prices | 10,000+ coins | Real-time | ⚠️ Optional |
| **Hyperliquid** | Crypto derivatives | Funding rates, open interest | Real-time | ❌ |
| **Alpha Vantage** | Stock fundamentals | Economic indicators | Daily | ✅ |
| **Quandl** | Commodities, alternatives | Futures, historical commodities | Daily | ⚠️ Optional |
| **ECB** 🆕 | European exchange rates | EUR/30 currencies daily | Daily 16:00 CET | ❌ |
| **Eurostat** 🆕 | EU statistics | Monthly HICP, twice-daily updates | Twice daily | ❌ |
| **BIS** 🆕 | Banking & financial systems | Consolidated banking, credit gaps | Quarterly | ❌ |
| **ILO** 🆕 | International labor | 190+ countries, demographic breakdowns | Weekly | ❌ |
| **UNSD** 🆕 | SDGs, trade | SDG indicators, commodity-level trade | Varies | ❌ |

---

## Coverage Gaps Filled by SDMX

### Critical Gaps Addressed

| Gap | Existing Coverage | SDMX Solution | Impact |
|-----|-------------------|---------------|--------|
| **European Exchange Rates** | Yahoo (limited) | ECB `EXR` (30 currencies) | Official EUR rates |
| **EU Monthly Inflation** | World Bank (annual only) | Eurostat `prc_hicp_*` (monthly, twice-daily) | 12x frequency improvement |
| **International Labor (Non-US)** | World Bank (annual), OECD (38 countries) | ILO (190+ countries, quarterly/monthly) | Global labor coverage |
| **Banking Statistics** | None | BIS `WS_LBS`, `WS_CBS` | Unique banking data |
| **Credit-to-GDP Gaps** | None | BIS `WS_LONG_CRE` | Systemic risk indicators |
| **Effective Exchange Rates** | None | BIS `WS_EER` | Trade-weighted FX indices |
| **Informal Employment** | None | ILO (only source) | Informal economy data |
| **SDG Indicators** | Partial | UNSD (all 17 SDGs) | Complete SDG coverage |
| **Commodity-Level Trade** | Limited | UNSD IMTS | Detailed trade data |

### Gap Severity Assessment

| Gap | Severity | Current Workaround | SDMX Provider | Priority |
|-----|----------|-------------------|---------------|----------|
| **EU Monthly Inflation** | 🔴 **Critical** | World Bank (annual only) | Eurostat | **P0** |
| **International Labor (Quarterly)** | 🔴 **Critical** | World Bank (annual), OECD (limited) | ILO | **P0** |
| **European Exchange Rates** | 🟡 **High** | Yahoo (unofficial) | ECB | **P1** |
| **Banking Statistics** | 🟡 **High** | None | BIS | **P1** |
| **Effective Exchange Rates** | 🟢 **Medium** | None | BIS | **P2** |
| **SDG Indicators** | 🟢 **Medium** | Piecemeal from multiple sources | UNSD | **P2** |

---

## Best Source Recommendations

### Quick Reference: Best Provider by Use Case

#### US Economic Data
- **GDP (Quarterly):** FRED `GDPC1` ⭐
- **Inflation (Monthly):** BLS `CUUR0000SA0` or FRED `CPIAUCSL` ⭐
- **Unemployment (Monthly):** BLS `LNS14000000` or FRED `UNRATE` ⭐
- **Employment (Monthly):** BLS `CES0000000001` or FRED `PAYEMS` ⭐
- **Federal Funds Rate:** FRED `FEDFUNDS` ⭐
- **10-Year Treasury:** FRED `GS10` ⭐
- **Federal Debt (Daily):** Treasury `debt_to_penny` ⭐⭐
- **M2 Money Supply:** FRED `M2SL` ⭐

#### International Economic Data
- **GDP (Annual):** World Bank `NY.GDP.MKTP.CD` ⭐
- **GDP (Quarterly):** IMF `NGDP_R_SA_XDC` or OECD `QNA/GDP` ⭐
- **Inflation (Annual):** World Bank `FP.CPI.TOTL.ZG` or IMF `PCPI_PC_CP_A_PT` ⭐
- **Unemployment (Annual):** World Bank `SL.UEM.TOTL.ZS` ⭐
- **Debt/GDP (Annual):** World Bank `GC.DOD.TOTL.GD.ZS` ⭐

#### European Data 🆕
- **Exchange Rates (Daily):** ECB `EXR` ⭐⭐ **NEW**
- **Inflation (Monthly):** Eurostat `prc_hicp_midx` ⭐⭐ **NEW**
- **GDP (Quarterly):** Eurostat `nama_10_gdp` ⭐
- **Banking (Monthly):** ECB `BSI` ⭐⭐ **NEW**

#### Labor Market 🆕
- **US Labor (Monthly):** BLS ⭐
- **International Labor (Quarterly/Monthly):** ILO SDMX ⭐⭐ **NEW**
- **Demographic Breakdowns:** ILO `DF_EMP_TEMP_SEX_AGE_NB` ⭐⭐ **UNIQUE**
- **Informal Employment:** ILO ⭐⭐ **UNIQUE**

#### Banking & Financial Systems 🆕
- **Consolidated Banking:** BIS `WS_CBS` ⭐⭐ **UNIQUE**
- **Credit-to-GDP Gaps:** BIS `WS_LONG_CRE` ⭐⭐ **UNIQUE**
- **Property Prices (Cross-country):** BIS `WS_SPP` ⭐⭐ **UNIQUE**
- **Effective Exchange Rates:** BIS `WS_EER` ⭐⭐ **UNIQUE**

#### Stock Market
- **US Indices:** Yahoo Finance (^GSPC, ^DJI, ^NDX) ⭐
- **International Indices:** Yahoo Finance ⭐
- **VIX (Volatility):** FRED `VIXCLS` or Yahoo `^VIX` ⭐

#### Cryptocurrency
- **Spot Prices (Max Coverage):** CoinGecko ⭐⭐
- **Perpetual Futures:** Hyperliquid `candles` ⭐⭐
- **Funding Rates:** Hyperliquid `fundingHistory` ⭐⭐ **UNIQUE**

#### Commodities
- **Gold (Long History):** Quandl `LBMA/GOLD` ⭐
- **Crude Oil:** FRED `DCOILWTICO` or Quandl ⭐
- **Commodities Futures:** Quandl `CHRIS/*` ⭐

---

## Data Quality Considerations

### Frequency vs Timeliness Trade-offs

| Scenario | Provider Choice | Reason |
|----------|----------------|--------|
| **US CPI (Official)** | BLS > FRED > Alpha Vantage | BLS is authoritative source |
| **US CPI (With YoY transform)** | FRED (with `units=pc1`) | Server-side calculation |
| **EU Inflation (Timeliness)** | Eurostat ⭐⭐ | Twice-daily updates vs annual (World Bank) |
| **International GDP (Annual)** | World Bank > IMF | 190+ countries, consistent methodology |
| **International GDP (Quarterly)** | IMF or OECD | Higher frequency |
| **Exchange Rates (EUR-based)** | ECB ⭐⭐ > Yahoo | Official source vs market data |
| **Labor (International)** | ILO ⭐⭐ > World Bank | Quarterly/Monthly vs Annual |

### Authoritative Sources

**Always prefer the primary source when available:**

| Data Type | Authoritative Source | Secondary Options |
|-----------|---------------------|-------------------|
| **US Labor Statistics** | BLS | FRED (aggregates BLS) |
| **US Federal Debt** | Treasury | FRED (aggregates Treasury) |
| **Euro Area Monetary** | ECB | - |
| **EU Statistics** | Eurostat | OECD (for EU members) |
| **International Labor** | ILO | World Bank, OECD |
| **Banking Statistics** | BIS | - |

### Geographic Coverage Decision Tree

```
Need US data?
├─ Yes → FRED, BLS, Treasury (comprehensive, high frequency)
└─ No → Need developed nations?
    ├─ Yes → Need EU specific?
    │   ├─ Yes → Eurostat, ECB ⭐⭐ (monthly/daily updates)
    │   └─ No → OECD (38 OECD countries)
    └─ No → Need global (190+ countries)?
        ├─ Annual → World Bank (best coverage)
        └─ Quarterly/Monthly → IMF, ILO ⭐⭐ (higher frequency)
```

### Frequency Decision Tree

```
Need daily data?
├─ Yes → Asset prices?
│   ├─ Stocks → Yahoo Finance
│   ├─ Crypto → CoinGecko, Hyperliquid
│   ├─ FX → ECB (EUR pairs), Yahoo (others)
│   ├─ Commodities → Quandl, FRED
│   └─ US Debt → Treasury ⭐⭐ (only daily source)
└─ No → Need monthly?
    ├─ US → BLS (labor), FRED (most indicators)
    ├─ EU → Eurostat ⭐⭐ (inflation, GDP)
    └─ Global → IMF, ILO ⭐⭐
```

---

## Summary: Integration Priority

### Phase 1: Critical Gaps (P0)
1. **Eurostat** - EU monthly inflation (twice-daily updates)
2. **ILO** - International labor data (quarterly/monthly, 190+ countries)

**Impact:** Fills the most severe gaps in current coverage (EU inflation frequency, international labor data).

### Phase 2: High-Value Additions (P1)
3. **ECB** - European exchange rates (daily official rates)
4. **BIS** - Banking statistics (unique consolidated data)

**Impact:** Adds authoritative European FX data and unique banking/financial system indicators.

### Phase 3: Comprehensive Coverage (P2)
5. **UNSD** - SDG indicators, detailed trade data

**Impact:** Completes SDG coverage and adds commodity-level trade detail.

---

## Implementation Approach

### Option 1: Individual Providers (Recommended)
Create separate provider classes for each SDMX source:

```typescript
packages/data-layer/src/providers/
  ecb.ts          // ECBProvider extends BaseProvider
  eurostat.ts     // EurostatProvider extends BaseProvider
  bis.ts          // BISProvider extends BaseProvider
  ilo.ts          // ILOProvider extends BaseProvider
  unsd.ts         // UNSDProvider extends BaseProvider
```

**Pros:**
- Clear separation of concerns
- Provider-specific configuration
- Easier to maintain individual APIs
- Follows existing pattern

**Cons:**
- More files to manage
- Some code duplication (SDMX parsing)

### Option 2: Unified SDMX Provider
Create single `SDMXProvider` handling all SDMX sources:

```typescript
packages/data-layer/src/providers/
  sdmx.ts         // SDMXProvider with provider selection
```

**Pros:**
- Single SDMX parsing implementation
- Less code duplication
- Centralized SDMX logic

**Cons:**
- More complex configuration
- Less clear separation
- Harder to customize per-provider

### Recommendation: Option 1 (Individual Providers)

Individual providers offer better:
- **Maintainability:** Each provider can evolve independently
- **Clarity:** Clear which provider does what
- **Flexibility:** Custom transformations per provider
- **Type Safety:** Specific configs per provider

Shared SDMX parsing logic can be extracted to:
```typescript
packages/data-layer/src/providers/sdmx/
  parser.ts       // Shared SDMX-JSON/CSV/ML parsers
  client.ts       // Shared HTTP client with SDMX-specific error handling
  types.ts        // Shared SDMX type definitions
```

---

**Last Updated:** December 31, 2025
**Next Review:** After Phase 1 implementation (Eurostat + ILO)

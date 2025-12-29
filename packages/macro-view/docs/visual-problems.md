## Graphs with Visual Problems - Analysis & Fixes

**Last Updated**: 2025-12-22

### Legend
- ✅ FIXED - Issue resolved
- ⚠️ PARTIAL - Partially fixed, some data limitations remain
- ❌ NOT FIXABLE - Requires additional data providers or paid APIs
- 🔧 NEEDS WORK - Can be fixed with more effort

---

### FIXED ISSUES ✅

**2. Digital Assets Performance** - ✅ FIXED
- Was: S&P scattered, Gold missing (using PPIACO proxy)
- Fix: Changed to Yahoo Finance (^GSPC for S&P, GLD for Gold)

**32. NASDAQ vs Bitcoin** - ✅ FIXED
- Was: NASDAQ data scattered (FRED NASDAQ100)
- Fix: Changed to Yahoo Finance (^NDX)

**33. Crypto Market Cap Context** - ✅ FIXED
- Was: Missing gold and m2
- Fix: Changed Gold to Yahoo GLD ETF

**38. NASDAQ vs Liquidity Index** - ✅ FIXED
- Was: NASDAQ data scattered
- Fix: Changed to Yahoo Finance (^NDX)

**39. Global M2 vs NASDAQ** - ✅ FIXED
- Was: NASDAQ scattered
- Fix: Changed to Yahoo Finance (^NDX)

**41. Bitcoin vs Gold** - ✅ FIXED
- Was: Gold data missing, wrong color
- Fix: Changed to Yahoo GLD ETF, color changed to orange (#f97316)

**43. NASDAQ Total Return vs Bitcoin** - ✅ FIXED
- Was: NASDAQ data scattered
- Fix: Changed to Yahoo Finance (^NDX)

---

### PARTIAL FIXES ⚠️ (Data Frequency Mismatch)

**ISM-related graphs (1, 3, 4, 8, 11, 12, 15, 26, 29, 34)** - ⚠️ PARTIAL
- Issue: Using IPMAN (Industrial Production) as ISM PMI proxy
- IPMAN is monthly data, works but not actual ISM PMI
- Real ISM PMI requires ISM subscription ($$$)

**M2/Liquidity graphs (14, 16, 17, 18, 19, 27, 37)** - ⚠️ PARTIAL
- Issue: M2SL is monthly data, appears sparse on daily charts
- This is expected behavior - M2 is released monthly by Fed
- Consider: Use weekly interpolation or accept monthly granularity

**10. Fed Net Liquidity vs Debt** - ⚠️ PARTIAL
- Debt data (GFDEGDQ188S) is quarterly
- M2 is monthly - frequency mismatch causes sparse appearance

**23. Labor Force vs Debt** - ⚠️ PARTIAL
- Both CIVPART and GFDEGDQ188S are available
- Quarterly vs monthly frequency mismatch

**25. Labor Force vs Birth Rate** - ⚠️ PARTIAL
- SPDYNCBRTINUSA is annual data
- Very sparse on chart - expected for annual series

**45. GDP Growth Components** - ⚠️ PARTIAL
- GDPC1, OPHNFB, GFDEGDQ188S all available
- Quarterly data appears sparse

---

### NOT FIXABLE ❌ (Requires Additional Providers/APIs)

**49. Tech Giants vs Bitcoin** - ❌ NOT FIXABLE (current config)
- Need to add individual stock symbols (AAPL, MSFT, GOOGL, etc.)
- Can fix by adding Yahoo Finance sources

**51. Global Government Debt (% of GDP)** - ❌ NOT FIXABLE
- Missing: China, Japan, Eurozone debt data
- Requires: World Bank or IMF provider integration

**54. US Debt Growth vs 10Y Yields** - ❌ NOT FIXABLE (current config)
- Need GFDEBTN (total debt) - available in FRED
- Can fix by updating data source

**56. BTC Perpetual Funding Rate vs Price** - ⚠️ PARTIAL
- Hyperliquid funding data is limited history
- Funding rate naturally jittery (8-hour updates)

**66. Global Inflation Comparison (5 Major Economies)** - ❌ NOT FIXABLE
- Requires: IMF or World Bank provider for international CPI

**70. Emerging Markets GDP Growth (BRICS)** - ❌ NOT FIXABLE
- Requires: World Bank provider integration

**75. Housing Affordability Crisis** - ❌ NOT FIXABLE
- Requires: Case-Shiller index, mortgage rates, income data
- Some available via FRED (CSUSHPISA, MORTGAGE30US)

**76. Complete Inflation Picture** - ❌ NOT FIXABLE
- Missing: CPE, import prices, PPI breakdown
- Some available via FRED (PCEPI, IR, PPIACO)

**77. Credit Conditions Dashboard** - ❌ NOT FIXABLE
- Missing: Credit spreads, bank credit
- Some available via FRED (BAMLH0A0HYM2, TOTLL)

**78. Global Trade Flow Indicators** - ❌ NOT FIXABLE
- Missing: Trade balance, export/import prices
- Some available via FRED (BOPGSTB, IQ, IR)

**79. Crypto vs Macro Conditions** - ⚠️ PARTIAL
- Non-crypto data available via FRED
- Need to verify data source mappings

**80. Labor Market Deep Dive** - ❌ NOT FIXABLE (current config)
- Missing: Wages (FRED: CES0500000003), productivity (OPHNFB available)
- Can fix by updating data sources

---

### Technical Notes

**Root Causes Identified:**
1. **Data frequency mismatch** - Monthly/quarterly FRED data vs daily crypto data
2. **Proxy data** - Using approximations (IPMAN for ISM, PPIACO for Gold)
3. **Missing providers** - World Bank, IMF, OECD not integrated in GraphRow
4. **Yahoo Finance fixed** - Now properly instantiated and working

**Fixes Applied (2025-12-22):**
1. Added `yahoo` type to GraphDefinition interface
2. Added YahooClient to api-clients.ts
3. Updated GraphRow.svelte to support Yahoo provider
4. Changed Gold from PPIACO to GLD (Yahoo)
5. Changed NASDAQ from NASDAQ100 (FRED) to ^NDX (Yahoo)
6. Changed S&P 500 from SP500 (FRED) to ^GSPC (Yahoo)
7. Changed Gold color to orange (#f97316) globally

# SDMX Ecosystem Research

**Research Date:** December 31, 2025
**Purpose:** Comprehensive analysis of SDMX data sources for integration into the one-love-wealth data layer

---

## Executive Summary

SDMX (Statistical Data and Metadata eXchange) is an ISO 17369 international standard for describing and exchanging statistical data and metadata. The standard is governed by 8 major international organizations and currently at version 3.1 (May 2025). This research identifies opportunities to enhance the data layer's completeness by integrating SDMX data sources that fill gaps in current coverage, particularly for European and international statistics.

**Key Findings:**
- **24+ Major SDMX Data Providers** identified with REST APIs
- **5 Priority Sources**: ECB (exchange rates), Eurostat (EU statistics), BIS (banking), ILO (labor), UNSD (SDG indicators)
- **No Authentication Required** for most major providers (ECB, Eurostat, BIS, ILO, UNSD, OECD, IMF, UNICEF)
- **3 Data Formats Supported**: SDMX-JSON, SDMX-ML (XML), SDMX-CSV
- **4 Client Libraries Available**: sdmx-rest (JS), @sis-cc/dotstatsuite-sdmxjs (JS), sdmx1 (Python), pandaSDMX (Python)

---

## SDMX Standard Overview

### What is SDMX?

SDMX (Statistical Data and Metadata eXchange) is an ISO 17369:2013 international standard designed to:
- Describe statistical data and metadata
- Normalize data exchange between statistical organizations
- Enhance efficient sharing of statistical information worldwide

**Governing Organizations (8 Sponsors):**
1. Bank for International Settlements (BIS)
2. European Central Bank (ECB)
3. Eurostat (Statistical Office of the European Union)
4. International Labour Organization (ILO)
5. International Monetary Fund (IMF)
6. Organisation for Economic Co-operation and Development (OECD)
7. United Nations Statistical Division (UNSD)
8. World Bank

### Version History

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| 1.0 | 2004 | Initial standard |
| 2.0 | 2005 | Approved as ISO/TS 17369:2005 |
| 2.1 | 2011 | Stable long-term standard |
| 3.0 | September 2021 | Microdata, geospatial support |
| 3.1 | May 2025 | Enhanced hierarchical structures |

### Data Formats

#### SDMX-JSON
- **Purpose**: Lightweight JSON format for web dissemination
- **Current Version**: 2.1.0 (May 2025)
- **Best For**: Browser-based visualizations, modern web apps
- **Spec**: [https://json.sdmx.org](https://json.sdmx.org)
- **Repository**: [github.com/sdmx-twg/sdmx-json](https://github.com/sdmx-twg/sdmx-json)

#### SDMX-ML (XML)
- **Purpose**: Full-featured XML format for structures, data, and metadata
- **Best For**: Enterprise systems, complete metadata exchange
- **Repository**: [github.com/sdmx-twg/sdmx-ml](https://github.com/sdmx-twg/sdmx-ml)

#### SDMX-CSV
- **Purpose**: CSV format for data exchange (not structural metadata)
- **Based on**: RFC 4180 standard
- **Best For**: Spreadsheet applications, simple data consumption
- **Repository**: [github.com/sdmx-twg/sdmx-csv](https://github.com/sdmx-twg/sdmx-csv)

### REST API Specification

- **Official Spec**: [github.com/sdmx-twg/sdmx-rest](https://github.com/sdmx-twg/sdmx-rest)
- **Current Version**: v2.2.2 (August 2025)
- **Format**: OpenAPI YAML definition (normative)
- **Capabilities**: Data retrieval, structural metadata, time-based filtering

**Standard Query Pattern:**
```
{base_url}/data/{dataflow}/{key}?startPeriod={start}&endPeriod={end}&format={format}
```

### Core Concepts

#### Data Structure Definition (DSD)
Template describing dataset dimensionality:
- **Dimensions**: Minimal set of concepts uniquely identifying a series (e.g., Time Period, Geographic Area, Indicator)
- **Attributes**: Extra information about measured variables (e.g., Unit Multiplier, Observation Status)
- **Primary Measure**: Main statistical value being measured

#### Dataflows
Reference a specific DSD to describe how a dataset is structured, indicate update frequency and maintenance agency.

#### Codelists
Finite value sets for coded concepts ensuring consistency (e.g., country codes, currencies).

#### Concept Schemes
Organization of statistical concepts used in DSDs with definitions and names.

---

## Major SDMX Data Providers

### Priority Tier 1: Essential European & International Statistics

#### 1. European Central Bank (ECB)

**API Endpoints:**
- Base URL (Current): `https://data-api.ecb.europa.eu/`
- Legacy (Redirects until Oct 1, 2025): `https://sdw-wsrest.ecb.europa.eu/`

**Authentication:** None required (open API)
**Rate Limits:** No documented limits
**Update Frequency:** Daily (exchange rates at 16:00 CET), Monthly/Quarterly (other datasets)

**Available Dataflows (~97):**
- **EXR** - Exchange Rates (30 currencies, daily updates)
- **BSI** - Balance Sheet Items (MFI aggregated/consolidated balance sheets)
- **MIR** - MFI Interest Rate Statistics
- **ICP** - Indices of Consumer Prices
- **PSS** - Payments and Settlement Systems Statistics
- **SEC** - Securities Issues Statistics
- **BOP** - Balance of Payments
- **RTD** - Real Time Database (200+ macroeconomic variables)

**Data Coverage:**
- Euro area monetary policy
- Exchange rates (30 currencies vs EUR)
- Banking statistics
- Payment systems
- Financial markets data

**Integration Priority:** **HIGH** - Fills gap for European exchange rates and monetary statistics

**Example Query:**
```
# Daily USD/EUR exchange rate (JSON format)
https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?startPeriod=2025-01-01&format=jsondata
```

**Documentation:**
- [API Overview](https://data.ecb.europa.eu/help/api/overview)
- [SDMX Tutorial](https://www.ecb.europa.eu/stats/ecb_statistics/sdmx/html/tutorial.en.html)

---

#### 2. Eurostat

**API Endpoints:**
- Base URL: `https://ec.europa.eu/eurostat/api/dissemination/sdmx/`
- SDMX 2.1: `https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/`
- SDMX 3.0: `https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/`

**Authentication:** None required
**Rate Limits:** No documented limits (responsible use requested)
**Update Frequency:** Twice daily (11:00 and 23:00 CET)

**Available Datasets:**
- **HICP (Inflation)**:
  - `prc_hicp_aind` - Annual data (average index and rate of change)
  - `prc_hicp_midx` - Monthly data (index)
  - `prc_hicp_manr` - Monthly data (annual rate of change)
- **GDP (National Accounts)**:
  - `nama_10_gdp` - GDP and main components
  - `nama_nace10_c` - National Accounts by 10 branches
- **Employment**: Labour Force Survey datasets
- **Trade**: Various trade indicators

**Data Coverage:**
- 37 European countries (27 EU + 10 EFTA/candidates)
- 450,000+ time series
- 300,000+ monthly/quarterly series
- Regional breakdowns (NUTS 1, 2, 3)

**Integration Priority:** **HIGH** - Superior to World Bank for European data (higher frequency, regional granularity)

**Example Query:**
```
# Monthly HICP for EU countries (CSV format)
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/prc_hicp_midx/M.CP00.EU27_2020?startPeriod=2023-01&format=CSV
```

**Documentation:**
- [API Getting Started](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)
- [Swagger UI](https://ec.europa.eu/eurostat/api/dissemination/swagger-ui)

---

#### 3. Bank for International Settlements (BIS)

**API Endpoints:**
- API v1: `https://stats.bis.org/api/v1/`
- API v2: `https://stats.bis.org/api/v2/`

**Authentication:** None required
**Rate Limits:** None documented (BIS reserves right to monitor and limit)
**Update Frequency:** Daily, Monthly, Quarterly, Annual (varies by dataset)

**Available Dataflows:**
- **WS_LBS** - Locational Banking Statistics
- **WS_CBS** - Consolidated Banking Statistics
- **WS_LONG_CRE** - Long Credit Statistics (credit-to-GDP gaps, debt service ratios)
- **WS_EER** - Effective Exchange Rates (Monthly/Daily)
- **WS_XRU** - Bilateral Exchange Rates
- **WS_OTC_DER** - OTC Derivatives Statistics
- **WS_SPP** - Selected Residential Property Prices
- **WS_CBTA** - Central Bank Total Assets

**Data Coverage:**
- International banking activity
- Credit to non-financial sector
- Debt securities statistics
- Global liquidity indicators
- Property prices (cross-country comparable)

**Integration Priority:** **HIGH** - Unique banking/financial data not available elsewhere

**Example Query:**
```
# Effective exchange rates for Switzerland
https://stats.bis.org/api/v1/data/WS_EER_M/M.N.B.CH/all?startPeriod=2020&endPeriod=2025&detail=full
```

**Documentation:**
- [Main Data Portal](https://data.bis.org)
- [API Documentation](https://stats.bis.org/api-doc/v2/)
- [Technical Standards](https://www.bis.org/statistics/sdmx_techspec.htm)

---

#### 4. International Labour Organization (ILO)

**API Endpoints:**
- Production: `https://www.ilo.org/sdmx/rest`
- Alternative: `https://sdmx.ilo.org/rest`
- Test: `https://www.ilo.org/sdmx-test/rest`

**Authentication:** None required
**Rate Limits:** No documented limits
**Update Frequency:** Weekly (Sundays at 10:00 PM Europe/Paris)

**Available Dataflows (Examples):**
- `DF_EMP_TEMP_SEX_AGE_NB` - Employment by Sex and Age
- `DF_UNE_*` - Unemployment indicators
- `DF_YI_*` - Youth indicators

**Topic Areas:**
- Employment and unemployment rates
- Labour force participation
- Working conditions
- Wages and earnings
- Work-related injuries
- Child labour statistics
- Informal economy data
- Decent work indicators

**Data Coverage:**
- 190+ countries
- Annual, quarterly, monthly frequencies

**Integration Priority:** **HIGH** - Fills gap for international labor statistics (BLS only covers US)

**Example Query:**
```
# Employment data (specify dataflow and key)
https://www.ilo.org/sdmx/rest/data/ILO,DF_EMP_TEMP_SEX_AGE_NB/{key}?format=jsondata
```

**Documentation:**
- [ILOSTAT SDMX User Guide](https://www.ilo.org/resource/other/ilostat-sdmx-user-guide)
- [SDMX Tools](https://ilostat.ilo.org/resources/sdmx-tools/)

---

#### 5. United Nations Statistics Division (UNSD)

**API Endpoints:**
- SDMX API: `http://data.un.org/ws/`
- SDMX REST: `http://data.un.org/ws/rest/`

**Authentication:** None required
**Rate Limits:** No documented limits
**Update Frequency:** Varies by dataset

**Available Data:**
- **SDG Global Database**: Dataflow `DF_SDG_GLH` (All 17 SDG indicators)
- **International Merchandise Trade Statistics (IMTS)**
- **Demographic Data**: Population, vital statistics
- **Energy Statistics**
- **UN Comtrade**: Trade data

**Data Coverage:**
- All 193 UN member states
- 17 SDGs with 169 targets and 232 indicators

**Integration Priority:** **MEDIUM** - Comprehensive but overlap with other sources

**Example Query:**
```
# SDG indicators
http://data.un.org/ws/rest/data/DF_SDG_GLH/{key}?format=sdmx-json
```

**Documentation:**
- [UNSD SDMX Methodology](https://unstats.un.org/unsd/methodology/sdmx/)
- [API Catalogue](https://unstats.un.org/unsd/api/)
- [SDMX SDG API Manual (PDF)](https://unstats.un.org/sdgs/files/SDMX_SDG_API_MANUAL.pdf)

---

### Priority Tier 2: Additional International Organizations

#### 6. Organisation for Economic Co-operation and Development (OECD)

**API Endpoint:** `https://sdmx.oecd.org/public/rest/`
**Authentication:** None required
**Rate Limits:** Responsible use requested
**Data:** Economic indicators, PISA education data, health, environment, development assistance

---

#### 7. International Monetary Fund (IMF)

**Platform:** SDMX Central
**Authentication:** Varies by dataset
**Rate Limits:** Introduced for stability
**Data:** Balance of Payments, Government Finance Statistics, International Financial Statistics, Direction of Trade

---

#### 8. UNICEF

**API Endpoint:** `https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/`
**Authentication:** None required
**Rate Limits:** Not specified
**Data:** Child mortality, nutrition, education, child protection, climate risk for children

---

#### 9. Food and Agriculture Organization (FAO)

**API Endpoint:** `http://data.fao.org/sdmx/`
**Authentication:** None required
**Data:** Agricultural production, food security, land use, livestock, fisheries, forestry, nutrition

---

#### 10. UNESCO Institute for Statistics (UIS)

**API Endpoint:** `https://api.uis.unesco.org/sdmx`
**Authentication:** **Required** (API key via subscription)
**Rate Limits:** 100,000 records per request
**Data:** 4,000+ education, science, culture, and communication indicators

---

### Priority Tier 3: Regional Development Banks

#### 11. Asian Development Bank (ADB)

**API Endpoint:** `https://kidb.adb.org/api`
**Authentication:** None required
**Data:** Macroeconomic indicators, social indicators, infrastructure, financial sector data for Asia-Pacific

---

#### 12. African Development Bank (AfDB)

**Platform:** Open Data Platform 2.0 (SDMX-native)
**Endpoints:** `https://dataportal.opendataforafrica.org/`
**Authentication:** None required
**Data:** African development indicators (1960-2024), agriculture, debt, governance, trade

---

### Priority Tier 4: National Statistical Offices

#### 13. Italian National Institute of Statistics (ISTAT)

**API Endpoint:** `https://esploradati.istat.it/SDMXWS/rest`
**Authentication:** None required
**Rate Limits:** **5 queries per minute per IP**
**Data:** Italian population, labor, prices, national accounts, trade

---

#### 14. Statistics Canada

**Platform:** SDMX REST Web Services
**Authentication:** None required for public data
**Data:** Canadian economic statistics, labor force, demographics, agriculture, energy

---

#### 15. National Institute of Statistics and Geography (INEGI) - Mexico

**API Endpoint:** `http://www.inegi.org.mx/inegi/contenidos/servicios/sdmx/`
**Authentication:** None required
**Data:** Mexican economic indicators, population, demographics, geography

---

#### 16. National Bank of Belgium (NBB)

**API Endpoint:** `https://stat.nbb.be/sdmx-json/`
**Authentication:** **Required** (CLIENT_ID verification)
**Rate Limits:** Not specified
**Data:** Belgian central balance sheet data, banking statistics, financial accounts

---

## Client Libraries and Tools

### JavaScript/TypeScript Libraries

#### 1. sdmx-rest (Recommended for Stable Projects)

**NPM Package:** `sdmx-rest`
**Version:** 2.20.0 (August 2022)
**License:** ISC
**GitHub:** [sosna/sdmx-rest4js](https://github.com/sosna/sdmx-rest4js)

**Features:**
- SDMX 2.1 and 3.0 compliant
- Built-in support for multiple providers (ECB, Eurostat, IMF, etc.)
- Promise-based API
- URL generation for custom execution

**Installation:**
```bash
bun install sdmx-rest
```

**Usage Example:**
```javascript
const sdmxrest = require('sdmx-rest');
const query = { flow: 'EXR', key: 'A.CHF.EUR.SP00.A' };

sdmxrest.request(query, 'ECB')
  .then(data => console.log(data))
  .catch(error => console.log("error: " + error));
```

**Documentation:** [sosna.github.io/sdmx-rest4js](https://sosna.github.io/sdmx-rest4js)

---

#### 2. @sis-cc/dotstatsuite-sdmxjs (Recommended for Modern Projects)

**NPM Package:** `@sis-cc/dotstatsuite-sdmxjs`
**Version:** 9.3.0 (July 2025)
**License:** MIT
**GitLab:** [sis-cc/.stat-suite/dotstatsuite-sdmxjs](https://gitlab.com/sis-cc/.stat-suite/dotstatsuite-sdmxjs)

**Features:**
- Collection of SDMX parsers with comprehensive unit tests
- Used in production by .Stat Suite applications
- ESM and CommonJS builds
- Most actively maintained JavaScript SDMX library

**Installation:**
```bash
bun install @sis-cc/dotstatsuite-sdmxjs
```

**Documentation:** [sis-cc.gitlab.io/.stat-suite/dotstatsuite-sdmxjs](https://sis-cc.gitlab.io/.stat-suite/dotstatsuite-sdmxjs/readme.html)

---

### Python Libraries

#### 1. sdmx1 (Recommended for Python)

**PyPI Package:** `sdmx1`
**Version:** 2.22.0 (March 2025)
**License:** Apache 2.0
**GitHub:** [khaeru/sdmx](https://github.com/khaeru/sdmx)

**Features:**
- SDMX 2.1 and 3.0 support
- Python typing and pydantic for strict compliance
- Supports 20+ data providers
- Pandas integration

**Installation:**
```bash
pip install sdmx1
```

**Usage Example:**
```python
import sdmx

ecb = sdmx.Client("ECB")
data_response = ecb.data(
    resource_id='EXR',
    key={'CURRENCY': ['CHF', 'EUR']},
    params={'startPeriod': '2016'}
)
df = sdmx.to_pandas(data_response)
```

**Documentation:** [sdmx1.readthedocs.io](https://sdmx1.readthedocs.io/)

---

#### 2. pandaSDMX

**PyPI Package:** `pandaSDMX`
**Version:** 1.10.0
**License:** Apache 2.0
**GitHub:** [dr-leo/pandaSDMX](https://github.com/dr-leo/pandaSDMX)

**Features:**
- SDMX 2.1 implementation
- Direct pandas integration
- Support for 20+ providers

**Note:** sdmx1 is recommended for new projects due to better type safety and modern architecture.

---

## Integration Recommendations

### For One Love Wealth Data Layer

#### Priority 1: ECB Exchange Rates
**Why:** Fills critical gap for EUR/currency pairs not covered by Yahoo Finance
**Data:** Daily exchange rates for 30 currencies vs EUR
**Update:** Daily at 16:00 CET
**Effort:** Low (no auth, simple API)

**Implementation Approach:**
```typescript
// packages/data-layer/src/providers/ecb.ts
export class ECBProvider extends BaseProvider<ECBConfig> {
  readonly name = 'ECB';
  readonly cachePrefix = 'ECB';

  protected buildRequestConfig(config: ECBConfig): RequestConfig {
    const { currency, startDate, endDate } = config;
    return {
      provider: 'ecb',
      endpoint: `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A`,
      params: {
        startPeriod: startDate,
        endPeriod: endDate,
        format: 'jsondata'
      }
    };
  }

  // Transform SDMX-JSON to DataPoint[]
  protected transformResponse(json: unknown, config: ECBConfig): DataPoint[] {
    // Parse SDMX-JSON structure
    // Return array of { time, value }
  }
}
```

---

#### Priority 2: Eurostat HICP (Inflation)
**Why:** Superior to World Bank for European inflation data (monthly vs annual)
**Data:** Harmonized Index of Consumer Prices for EU countries
**Update:** Twice daily (11:00, 23:00 CET)
**Effort:** Low (no auth, CSV format available)

---

#### Priority 3: BIS Banking Statistics
**Why:** Unique data not available elsewhere
**Data:** Consolidated banking statistics, credit-to-GDP gaps
**Update:** Quarterly
**Effort:** Low (no auth, well-documented API)

---

#### Priority 4: ILO Employment
**Why:** Fills gap for international labor data (BLS only covers US)
**Data:** Employment, unemployment by country, sex, age
**Update:** Weekly
**Effort:** Medium (need to understand dataflow structure)

---

### Unified SDMX Provider Pattern

Instead of creating separate providers for each SDMX source, consider a unified SDMXProvider:

```typescript
export interface SDMXConfig extends ProviderConfig {
  provider: 'ECB' | 'EUROSTAT' | 'BIS' | 'ILO' | 'UNSD';
  dataflow: string;
  key: string;
  startPeriod?: string;
  endPeriod?: string;
  format?: 'jsondata' | 'csvdata' | 'genericdata';
}

export class SDMXProvider extends BaseProvider<SDMXConfig> {
  private endpoints = {
    ECB: 'https://data-api.ecb.europa.eu/service/data',
    EUROSTAT: 'https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data',
    BIS: 'https://stats.bis.org/api/v1/data',
    ILO: 'https://www.ilo.org/sdmx/rest/data',
    UNSD: 'http://data.un.org/ws/rest/data'
  };

  protected buildRequestConfig(config: SDMXConfig): RequestConfig {
    const base = this.endpoints[config.provider];
    return {
      provider: config.provider.toLowerCase(),
      endpoint: `${base}/${config.dataflow}/${config.key}`,
      params: {
        startPeriod: config.startPeriod,
        endPeriod: config.endPeriod,
        format: config.format || 'jsondata'
      }
    };
  }
}
```

---

## Gap Analysis

### Current Data Layer Gaps Filled by SDMX

| Gap | Current Coverage | SDMX Solution | Provider |
|-----|------------------|---------------|----------|
| European exchange rates | Limited (Yahoo) | EUR/30 currencies daily | ECB |
| EU inflation (monthly) | Annual only (World Bank) | Monthly HICP | Eurostat |
| International banking | None | Consolidated banking stats | BIS |
| Global labor (non-US) | None (BLS is US-only) | 190+ countries | ILO |
| SDG indicators | None | All 17 SDGs | UNSD |
| Standardized metadata | Minimal | DSDs, codelists | All SDMX |

---

## Technical Considerations

### Bun Compatibility
- Both `sdmx-rest` and `@sis-cc/dotstatsuite-sdmxjs` should work with Bun
- Use `bun install` instead of npm
- Bun's native `fetch()` can be used directly without client libraries

### Format Selection
**Recommendation:** Use SDMX-JSON for ease of parsing
- Lighter than SDMX-ML (XML)
- Native JavaScript object structure
- Smaller payload size
- Spec: [https://json.sdmx.org](https://json.sdmx.org)

**Alternative:** CSV with labels for maximum simplicity
- Parameter: `?format=csvfilewithlabels`
- Easiest to parse and debug
- Human-readable

### Caching Strategy
- **ECB Exchange Rates**: 24 hours (daily updates)
- **Eurostat HICP**: 12 hours (twice-daily updates)
- **BIS Banking**: 7 days (quarterly updates)
- **ILO Employment**: 7 days (weekly updates)

### Error Handling
- No authentication means no 401/403 errors
- Watch for 429 (rate limiting) though uncommon
- Handle SDMX-specific error codes (e.g., 510 for oversized response)
- Implement retry logic for network issues

---

## Next Steps

1. **Prototype ECB Provider**
   - Implement ECBProvider for exchange rates
   - Test SDMX-JSON parsing
   - Validate data transformation

2. **Validate API Access**
   - Test all priority endpoints from project environment
   - Verify no network restrictions or firewalls

3. **Design Builder API**
   - Create `ecb()` builder following existing patterns
   - Define configuration options

4. **Add to Proxy Layer**
   - Create server-side proxy if needed
   - Handle CORS if accessing from browser

5. **Write Integration Tests**
   - Mock mode for offline testing
   - Live mode for API validation
   - Quality checks for data format

---

## Appendix: Complete Provider Directory

| Provider | Base URL | Auth | Rate Limit | Focus |
|----------|----------|------|------------|-------|
| ECB | data-api.ecb.europa.eu | No | None | Euro area monetary/financial |
| Eurostat | ec.europa.eu/eurostat/api | No | None | EU statistics |
| BIS | stats.bis.org/api/v1 | No | Monitor | Banking, credit, property |
| ILO | www.ilo.org/sdmx/rest | No | None | Labor statistics |
| UNSD | data.un.org/ws/rest | No | None | SDG, demographics, trade |
| OECD | sdmx.oecd.org/public/rest | No | Responsible | Economic/social developed countries |
| IMF | SDMX Central | Varies | Yes | Financial, BoP, GFS |
| UNICEF | sdmx.data.unicef.org | No | None | Child welfare |
| FAO | data.fao.org/sdmx | No | None | Agriculture, food security |
| UNESCO | api.uis.unesco.org/sdmx | **Yes** | 100k/req | Education |
| ADB | kidb.adb.org/api | No | None | Asia-Pacific development |
| AfDB | dataportal.opendataforafrica.org | No | None | African development |
| ISTAT | esploradati.istat.it/SDMXWS/rest | No | 5/min | Italian statistics |
| StatCan | API not clearly documented | No | None | Canadian statistics |
| INEGI | www.inegi.org.mx/.../sdmx | No | None | Mexican statistics |
| NBB | stat.nbb.be/sdmx-json | **Yes** | None | Belgian financial |

---

## References

### Official SDMX Documentation
- [SDMX Official Website](https://sdmx.org/)
- [SDMX Standards](https://sdmx.org/standards-2/)
- [SDMX REST API GitHub](https://github.com/sdmx-twg/sdmx-rest)
- [SDMX Global Registry](https://registry.sdmx.org/)

### Provider Documentation
- [ECB API Overview](https://data.ecb.europa.eu/help/api/overview)
- [Eurostat API Getting Started](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started)
- [BIS API Documentation](https://stats.bis.org/api-doc/v2/)
- [ILO SDMX User Guide](https://www.ilo.org/resource/other/ilostat-sdmx-user-guide)
- [UNSD SDMX Methodology](https://unstats.un.org/unsd/methodology/sdmx/)

### Client Libraries
- [sdmx-rest Documentation](https://sosna.github.io/sdmx-rest4js)
- [sdmx1 Documentation](https://sdmx1.readthedocs.io/)
- [pandaSDMX Documentation](https://pandasdmx.readthedocs.io/)

---

**Research Completed:** December 31, 2025
**Next Review:** Q2 2026 (after initial SDMX provider implementation)

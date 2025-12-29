# API Tester Guide

Visual testing interface for all 7 data providers.

## Access

Navigate to `/api-tester` in the application.

## Interface Layout

```
┌─────────────┬────────────────────┬────────────────┐
│   LEFT      │      MAIN          │     RIGHT      │
│  SIDEBAR    │     RESULTS        │   PARAMETERS   │
│             │                    │                │
│ 1. Provider │  Loading/Results   │  Provider-     │
│ Selection   │  or Cache View     │  Specific      │
│             │                    │  Parameters    │
│ 2. Series   │  - Data Preview    │                │
│ Dropdown    │  - Statistics      │  - FRED: Units │
│             │  - Timing Info     │  - Yahoo: Range│
│ 3. Fetch    │  - Cache Status    │  - WB: Country │
│ Button      │                    │  - BLS: Years  │
│             │                    │  - etc.        │
│ 4. Cache    │                    │                │
│ Tools       │                    │                │
└─────────────┴────────────────────┴────────────────┘
```

## Using the Tester

### 1. Select Provider

Click a provider card (left sidebar):
- 📊 FRED - Economic data
- 🦎 CoinGecko - Crypto prices
- 💹 Yahoo - Stock market
- 🏦 World Bank - Global data
- 👷 BLS - Labor stats
- 💰 Treasury - Fiscal data
- ⚡ Hyperliquid - Crypto derivatives

### 2. Select Series

Choose from provider-specific dropdown.

### 3. Configure Parameters

Right sidebar shows provider-specific options:

**FRED:**
- Units (lin, pc1, log, etc.)
- Frequency (d, w, m, q, a)
- Date range
- Limit

**CoinGecko:**
- Currency (usd, eur, btc, etc.)
- Days (1, 7, 30, 90, 365, max)

**Yahoo:**
- Interval (1d, 1wk, 1mo)
- Date range

**World Bank:**
- Country (USA, CHN, etc.)
- Year range

**BLS:**
- Year range
- Calculations toggle

**Treasury:**
- Date range

**Hyperliquid:**
- Data type (candles, funding, OI)
- Interval (conditional)
- Datetime range

### 4. Fetch Data

Click "Fetch Data" button. Results show:
- ✅ Success indicator
- Cache status (Cached/Fresh)
- Fetch duration (ms)
- Data point count
- First 10 data points
- Statistics (ID, source, dates, etc.)

## Cache Tools

### View Cache
Click "View Cache" to inspect all cached series:
- Series ID
- Source provider
- Data point count
- Size (KB)
- Age (seconds/minutes/hours/days)

### Clear Cache
Click "Clear All" to purge entire cache.
Useful for testing fresh fetches.

## Tips

### Testing YoY Calculations

**FRED (server-side):**
```
1. Select FRED
2. Choose M2SL
3. Set Units to "YoY % (pc1)"
4. Fetch
5. Verify values are percentages
```

**CoinGecko (requires client-side):**
```
1. Select CoinGecko
2. Choose Bitcoin
3. Fetch
4. Note: Raw prices, not YoY
5. Use transform engine for YoY
```

### Testing Rate Limits

**BLS without API key:**
- Limited to 25 requests/day
- Test carefully
- Request API key for development

**FRED:**
- 120 requests/minute
- Should never hit in normal usage

### Testing Date Ranges

**Recent data:**
- Use dateRange.start close to today
- Verify latest data is returned

**Historical data:**
- World Bank: Start year 1960+
- FRED: Series-dependent (1940s+)
- CoinGecko: Bitcoin from 2013

### Testing Error Handling

**Invalid series ID:**
- Enter non-existent series
- Should show error message
- Should not crash

**Empty date range:**
- Set future start date
- Should return empty or error

## Common Issues

### "FRED API key not found"
Add `FRED_API_KEY` to `.env` file.

### "Rate limit exceeded" (BLS)
- You hit 25/day limit
- Wait until tomorrow
- Or register for API key (500/day)

### "No data returned"
- Check date range
- Verify series ID exists
- Try with defaults first

### Slow response (Treasury, World Bank)
- Large datasets take 1-2 seconds
- This is normal
- Consider using date ranges

## Developer Usage

### Testing New Providers

1. Add provider to registry
2. Add to API Tester providers array
3. Add series options
4. Add parameter state variables
5. Add buildConfig case
6. Add parameter UI section
7. Test fetch

### Testing Cache Behavior

```
1. Fetch a series (Fresh)
2. Immediately fetch again (Cached)
3. Note timing difference
4. View cache to see entry
5. Clear cache
6. Fetch again (Fresh)
```

### Testing Transform Compatibility

1. Fetch FRED with units='pc1' (server YoY)
2. Fetch CoinGecko (raw prices)
3. Compare: Server YoY vs raw
4. Apply client-side YoY to CoinGecko
5. Verify results match pattern

## API Tester Source

Location: `src/routes/api-tester/+page.svelte`

Key functions:
- `handleFetch()` - Fetches data via registry
- `buildConfig()` - Constructs provider config
- `loadCacheInfo()` - Inspects IndexedDB
- `handleClearCache()` - Purges cache

## See Also

- [Providers](./PROVIDERS.md) - Provider parameters
- [Data Layer](./DATA_LAYER.md) - Architecture overview

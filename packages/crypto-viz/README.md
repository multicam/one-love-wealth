# Crypto Trading Visualization

A SvelteKit-based cryptocurrency charting application with multiple data sources, technical indicators, and real-time price visualization.

## Features

- **Multi-source OHLC data**: CoinGecko, Binance, Coinbase, Hyperliquid, Yahoo Finance
- **TradingView-style charts**: Candlestick charts with lightweight-charts library
- **Technical indicators**: Stochastic, Stochastic RSI, Kalman Filter with synchronized crosshairs
- **Flexible timeframes**: 1D to 1Y with API-appropriate granularity
- **Persistent settings**: LocalStorage-based configuration
- **Multi-tier caching**: Memory + localStorage with rate limit handling

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test
```

## Supported Cryptocurrencies

| Symbol | Name | CoinGecko | Binance | Coinbase | Hyperliquid | Yahoo |
|--------|------|-----------|---------|----------|-------------|-------|
| BTC | Bitcoin | ✅ | ✅ | ✅ | ✅ | ✅ |
| ETH | Ethereum | ✅ | ✅ | ✅ | ✅ | ✅ |
| XRP | Ripple | ✅ | ✅ | ✅ | ✅ | ✅ |
| SOL | Solana | ✅ | ✅ | ✅ | ✅ | ✅ |
| SUI | Sui | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Data Source API Reference

### 1. CoinGecko

**Base URL**: `https://api.coingecko.com/api/v3`

**Endpoint**: `GET /coins/{id}/ohlc`

#### Supported Intervals (Auto-determined by days parameter)

| Days Range | Candle Interval |
|------------|-----------------|
| 1-2 days | 30 minutes |
| 3-30 days | 4 hours |
| 31+ days | 4 days |

#### Paid Plan Intervals
- `hourly`: Available for 1, 7, 14, 30, 90 days
- `daily`: Available for 1, 7, 14, 30, 90, 180 days

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Coin ID (e.g., `bitcoin`, `ethereum`) |
| `vs_currency` | string | ✅ | Target currency (e.g., `usd`) |
| `days` | number | ✅ | Data range: 1, 7, 14, 30, 90, 180, 365, max |
| `interval` | string | ❌ | `daily` or `hourly` (paid plans only) |

#### Rate Limits
- Free tier: 10-30 calls/minute
- Cache refresh: Every 15 minutes

#### Response Format
```json
[
  [1709395200000, 61942, 62211, 61721, 61845],
  // [timestamp_ms, open, high, low, close]
]
```

#### Limitations
- **Granularity is automatic** on free tier - cannot be customized
- No volume data in OHLC endpoint
- Rate limiting aggressive on free tier

---

### 2. Binance

**Base URL**: `https://api.binance.com/api/v3`

**Endpoint**: `GET /klines`

#### Supported Intervals (Full control)

| Interval | Code | Description |
|----------|------|-------------|
| 1 second | `1s` | Ultra high frequency |
| 1 minute | `1m` | |
| 3 minutes | `3m` | |
| 5 minutes | `5m` | |
| 15 minutes | `15m` | |
| 30 minutes | `30m` | |
| 1 hour | `1h` | |
| 2 hours | `2h` | |
| 4 hours | `4h` | |
| 6 hours | `6h` | |
| 8 hours | `8h` | |
| 12 hours | `12h` | |
| 1 day | `1d` | |
| 3 days | `3d` | |
| 1 week | `1w` | |
| 1 month | `1M` | |

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | ✅ | Trading pair (e.g., `BTCUSDT`) |
| `interval` | string | ✅ | Kline interval (see above) |
| `startTime` | number | ❌ | Start time in ms |
| `endTime` | number | ❌ | End time in ms |
| `limit` | number | ❌ | Number of results (default 500, max 1000) |

#### Rate Limits
- Weight: 2 per request
- 1200 weight/minute for IP

#### Response Format
```json
[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base volume
    "28.46694368",      // Taker buy quote volume
    "0"                 // Ignore
  ]
]
```

#### Advantages
- **Most flexible interval options** (16 intervals)
- High data limits (1000 candles per request)
- Volume and trade count data included
- No authentication required for market data

#### Limitations
- Symbol format: Must use `BTCUSDT` format (no hyphen)
- Some coins may not be available

---

### 3. Coinbase

**Base URL**: `https://api.exchange.coinbase.com`

**Endpoint**: `GET /products/{product_id}/candles`

#### Supported Intervals (Limited set)

| Seconds | Interval | Description |
|---------|----------|-------------|
| 60 | 1 min | |
| 300 | 5 min | |
| 900 | 15 min | |
| 3600 | 1 hour | |
| 21600 | 6 hours | |
| 86400 | 1 day | |

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | string | ✅ | Trading pair (e.g., `BTC-USD`) |
| `granularity` | number | ✅ | Interval in seconds (see above) |
| `start` | string | ❌ | Start time (ISO 8601 or Unix) |
| `end` | string | ❌ | End time (ISO 8601 or Unix) |

#### Rate Limits
- Max 300 candles per request
- 10 requests/second for public endpoints

#### Response Format
```json
[
  [1415398768, 0.32, 4.2, 0.35, 4.2, 12.3],
  // [time, low, high, open, close, volume]
]
```

**Note**: Order is `[time, low, high, open, close, volume]` - different from others!

#### Advantages
- No authentication required for candles
- Volume data included
- Reliable uptime

#### Limitations
- **Only 6 granularity options** (no 30min, 2h, 4h, 8h, 12h)
- Max 300 candles per request
- Must use hyphenated symbol format (`BTC-USD`)

---

### 4. Hyperliquid

**Base URL**: `https://api.hyperliquid.xyz`

**Endpoint**: `POST /info`

#### Supported Intervals

| Interval | Code |
|----------|------|
| 1 minute | `1m` |
| 3 minutes | `3m` |
| 5 minutes | `5m` |
| 15 minutes | `15m` |
| 30 minutes | `30m` |
| 1 hour | `1h` |
| 2 hours | `2h` |
| 4 hours | `4h` |
| 8 hours | `8h` |
| 12 hours | `12h` |
| 1 day | `1d` |
| 3 days | `3d` |
| 1 week | `1w` |
| 1 month | `1M` |

#### Request Body

```json
{
  "type": "candleSnapshot",
  "req": {
    "coin": "BTC",
    "interval": "4h",
    "startTime": 1700000000000,
    "endTime": 1700100000000
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `coin` | string | ✅ | Asset symbol (e.g., `BTC`, `ETH`) |
| `interval` | string | ✅ | Candle interval (see above) |
| `startTime` | number | ✅ | Start time in milliseconds |
| `endTime` | number | ✅ | End time in milliseconds |

#### Response Format
```json
[
  {
    "t": 1700000000000,
    "o": "36500.5",
    "h": "36800.0",
    "l": "36400.0",
    "c": "36750.0",
    "v": "1234.56"
  }
]
```

#### Advantages
- **14 interval options** (second most flexible)
- Perpetual futures data
- No authentication required
- POST method allows complex queries

#### Limitations
- **Max 5000 candles** per request
- Only perpetual futures (not spot)
- Symbol format: Simple uppercase (`BTC`, not `BTCUSDT`)

---

### 5. Yahoo Finance

**Base URL**: `https://query1.finance.yahoo.com/v8/finance`

**Endpoint**: `GET /chart/{symbol}`

#### Supported Intervals

| Interval | Code | Max Range |
|----------|------|-----------|
| 1 minute | `1m` | 7 days |
| 2 minutes | `2m` | 60 days |
| 5 minutes | `5m` | 60 days |
| 15 minutes | `15m` | 60 days |
| 30 minutes | `30m` | 60 days |
| 60 minutes | `60m` | 60 days |
| 90 minutes | `90m` | 60 days |
| 1 hour | `1h` | 730 days |
| 1 day | `1d` | Unlimited |
| 5 days | `5d` | Unlimited |
| 1 week | `1wk` | Unlimited |
| 1 month | `1mo` | Unlimited |
| 3 months | `3mo` | Unlimited |

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | ✅ | Ticker (e.g., `BTC-USD`) |
| `interval` | string | ✅ | Data interval (see above) |
| `range` | string | ❌ | Preset range: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max` |
| `period1` | number | ❌ | Start Unix timestamp |
| `period2` | number | ❌ | End Unix timestamp |

#### Response Format
```json
{
  "chart": {
    "result": [{
      "timestamp": [1700000000, 1700003600],
      "indicators": {
        "quote": [{
          "open": [36500.5, 36600.0],
          "high": [36800.0, 36900.0],
          "low": [36400.0, 36500.0],
          "close": [36750.0, 36850.0],
          "volume": [1234, 5678]
        }]
      }
    }]
  }
}
```

#### Advantages
- **13 interval options**
- Stocks, ETFs, indices, forex, and crypto
- Long historical data for daily+ intervals
- No authentication required

#### Limitations
- **Intraday data limited** (1m = 7 days, <1d = 60 days)
- Unofficial API (may change without notice)
- Symbol format: Hyphenated for crypto (`BTC-USD`)
- CORS may require proxy in browser

---

## API Comparison Summary

| Feature | CoinGecko | Binance | Coinbase | Hyperliquid | Yahoo |
|---------|-----------|---------|----------|-------------|-------|
| **Intervals** | 3 (auto) | 16 | 6 | 14 | 13 |
| **Min Interval** | 30min | 1s | 1min | 1min | 1min |
| **Max Candles** | ~180 | 1000 | 300 | 5000 | ~500 |
| **Volume Data** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Auth Required** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Rate Limit** | Strict | Moderate | Moderate | Relaxed | Relaxed |
| **Best For** | Simple use | Full control | US users | Perps | Stocks+Crypto |

### Recommended Intervals by Timeframe

| Timeframe | CoinGecko | Binance | Coinbase | Hyperliquid | Yahoo |
|-----------|-----------|---------|----------|-------------|-------|
| 1 Day | 30min (auto) | 30m | 15min | 15m | 30m |
| 7 Days | 4h (auto) | 1h, 2h, 4h | 1h | 1h, 2h, 4h | 1h |
| 14 Days | 4h (auto) | 2h, 4h | 1h, 6h | 2h, 4h | 1h |
| 1 Month | 4h (auto) | 4h, 6h | 6h | 4h, 8h | 1h |
| 2 Months | 4d (auto) | 4h, 6h, 12h | 6h | 4h, 8h, 12h | 1d |
| 3 Months | 4d (auto) | 6h, 12h, 1d | 6h, 1d | 8h, 12h, 1d | 1d |
| 6 Months | 4d (auto) | 12h, 1d | 1d | 12h, 1d | 1d |
| 1 Year | 4d (auto) | 1d, 3d | 1d | 1d, 3d | 1d |

---

## Architecture

```
src/
├── lib/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── CandlestickChart.svelte
│   │   │   ├── IndicatorChart.svelte
│   │   │   ├── KalmanChart.svelte
│   │   │   └── ChartContainer.svelte
│   │   ├── controls/
│   │   │   ├── CryptoSelector.svelte
│   │   │   ├── DataSourceSelector.svelte
│   │   │   ├── TimeframeSelector.svelte
│   │   │   └── TickerInfo.svelte
│   │   └── layout/
│   │       ├── ViewPanel.svelte
│   │       └── SettingsView.svelte
│   ├── indicators/
│   │   ├── kalman.js           # Kalman filter with crossover detection
│   │   ├── stochastic.js       # Stochastic oscillator
│   │   ├── stochasticRSI.js    # Stochastic RSI
│   │   └── utils.js            # Indicator utilities
│   ├── services/
│   │   ├── dataService.js      # Multi-source OHLC fetching
│   │   └── storageService.js   # LocalStorage persistence
│   ├── stores/
│   │   ├── crypto.js           # OHLC data store
│   │   ├── indicators.js       # Derived indicator stores
│   │   ├── settings.js         # User preferences
│   │   └── ui.js               # Crosshair sync
│   └── utils/
│       └── constants.js        # API configs, timeframes, settings
└── routes/
    └── +page.svelte            # Main app entry
```

---

## Technical Indicators

### Stochastic Oscillator

Measures momentum by comparing closing price to price range over a period.

**Settings:**
- `kPeriod`: %K period (default: 14)
- `dPeriod`: %D period (default: 3)
- `smooth`: %K smoothing (default: 3)

### Stochastic RSI

Applies Stochastic formula to RSI values for more sensitive signals.

**Settings:**
- `rsiPeriod`: RSI calculation period (default: 14)
- `stochPeriod`: Stochastic period (default: 14)
- `kPeriod`: %K period (default: 3)
- `dPeriod`: %D period (default: 3)

### Kalman Filter

Adaptive smoothing filter that tracks price with crossover detection.

**Features:**
- **Price Line** (gray): Raw close price
- **Filtered Line** (purple): Kalman-smoothed price
- **Crossover Markers**: 
  - ↑ Green arrows: Price crosses above filter (bullish)
  - ↓ Red arrows: Price crosses below filter (bearish)
- **Crossover Counter**: Shows up/down counts in header

**Settings:**
- `processNoise`: Filter responsiveness (default: 0.01, range: 0.001-0.1)
- `measurementNoise`: Smoothing factor (default: 0.1, range: 0.01-1)

---

## License

MIT

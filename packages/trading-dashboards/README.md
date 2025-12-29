# Trading Dashboards

Multi-dashboard cryptocurrency trading application built with SvelteKit, featuring real-time order book visualization and macro economic indicators.

## 🚀 Quick Start

```bash
cd /media/ssdev/work/svelte-trading-dashboards
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## ✨ Features

### 🎯 Macro Dashboard (✅ Live)

**Two Views Available:**

1. **Macro Cards** (`/macro`) - Interactive card-based view
   - Click any card to view detailed historical chart in modal
   - Keyboard navigation (Escape to close)
   - Real-time data updates every hour

2. **Macro Full** (`/macro_full`) - Comprehensive view
   - All 8 indicators with charts visible simultaneously
   - Side-by-side card and chart layout
   - Single-page analysis dashboard

**Real-Time Data Sources:**
- 🟢 **BTC Price**: Live from CoinGecko API (30-day history)
- 🟢 **Fear & Greed Index**: Live from alternative.me API
- 🟢 **BTC/Gold Ratio**: Calculated from live CoinGecko data
- 🟡 **Economic Indicators**: Mock data (FRED API integration ready)
  - Michigan Consumer Sentiment
  - ISM Manufacturing PMI
  - M2 YoY Growth
  - SOFR-EFFR Spread
  - VIX (Equity Fear)

**Features:**
- Interactive time series charts (TradingView Lightweight Charts v4)
- Color-coded status indicators (Bullish/Bearish/Neutral)
- Change tracking with 24h deltas
- Macro thesis analysis section
- Responsive grid layout

### 📊 Order Book Dashboard (🚧 Coming Soon)
- Multi-Exchange Support (Kraken, Coinbase, Bitstamp)
- Real-time WebSocket streaming
- Price level clustering
- Depth charts
- Technical indicators

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2.x (Svelte 5 with runes)
- **Language**: TypeScript
- **Charts**: TradingView Lightweight Charts v4.2.3
- **Package Manager**: Bun
- **Testing**: Vitest + Playwright
- **APIs**: CoinGecko (crypto prices), alternative.me (Fear & Greed)

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── MetricCard.svelte       # Reusable metric card
│   │   │   └── TimeSeriesChart.svelte  # TradingView chart wrapper
│   │   └── modals/
│   │       └── ChartModal.svelte       # Chart modal component
│   ├── stores/
│   │   ├── macro/indicators.ts         # Macro indicators state
│   │   └── orderbook/                  # Order book state
│   ├── services/
│   │   ├── api/
│   │   │   ├── fearGreedAPI.ts        # Fear & Greed API client
│   │   │   └── coinGeckoAPI.ts        # CoinGecko API client
│   │   └── aggregator.ts              # Order book processor
│   └── styles/
│       ├── theme.css                   # Design system
│       └── global.css                  # Global styles
└── routes/
    ├── +layout.svelte                  # Shared layout with nav
    ├── +page.svelte                    # Landing page
    ├── macro/+page.svelte             # Macro cards view
    ├── macro_full/+page.svelte        # Macro full view
    └── orderbook/+page.svelte         # Order book dashboard
```

## 🎨 Design System

Preserved from original synthetic-order-book:
- **Background**: `#0a0e17`
- **Accent**: `#3b82f6`, `#8b5cf6`
- **Trading**: Green (`#10b981`), Red (`#ef4444`)
- **Typography**: JetBrains Mono, SF Mono

## 🔧 Development

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun run test
```

## 📝 Status

**Completed**:
- ✅ Macro Dashboard (Card view with modal charts)
- ✅ Macro Dashboard Full View (All charts visible)
- ✅ Real-time data integration (CoinGecko, Fear & Greed API)
- ✅ Interactive TradingView charts with 30-day history
- ✅ Responsive design system
- ✅ Component library (MetricCard, TimeSeriesChart, ChartModal)

**Next**:
- 🚧 Order book dashboard with WebSocket support
- 🚧 FRED API integration for economic indicators (requires API key)
- 🚧 Additional data sources (VIX, SOFR real-time data)

## 🔌 API Integration Guide

### Adding FRED API (Economic Indicators)

1. Sign up for free FRED API key: https://fred.stlouisfed.org/docs/api/api_key.html
2. Create `.env` file:
```bash
VITE_FRED_API_KEY=your_key_here
```
3. Update `src/lib/stores/macro/indicators.ts` to fetch:
   - `UMCSENT` - Michigan Consumer Sentiment
   - `MANEMP` - ISM Manufacturing PMI
   - `M2SL` - M2 Money Supply
   - `SOFR` - SOFR Rate

### Current Data Sources

**Real-Time (No API Key Required)**:
- CoinGecko API (10-50 calls/min free tier)
- alternative.me Fear & Greed Index (free)

**Mock Data (Need API Keys for Real)**:
- Economic indicators (FRED API)
- VIX volatility index (CBOE/Alpha Vantage)

---

**Version**: 0.1.0 | **Last Updated**: December 11, 2025

# Advanced Statistical Overlays
## Comprehensive Research Report (2024-2025)

**Research Date:** December 31, 2025
**Focus Areas:** GARCH Volatility, Kalman Filters, Hidden Markov Models for Regime Detection

---

## Executive Summary

Advanced statistical overlays for financial charts require specialized implementations. Key finding: GARCH and HMM require Python implementations (no JS/TS libraries exist), while Kalman filters have production-ready JavaScript libraries.

---

## 1. GARCH Volatility Visualization

### Recent Academic Research (2024-2025)

- **Integrated GARCH-GRU** (April 2025): Combines GARCH with GRU networks
- **GARCH-Informed Neural Networks** (Sept 2024): Hybrid GARCH-LSTM inspired by physics-informed NNs
- **Autoencoder Enhanced Realised GARCH** (Nov 2024): Autoencoder-generated synthetic measures

### Visualization Techniques

- **Volatility Cones**: Expected volatility ranges at different horizons
- **Forecast Bands**: Confidence intervals around predictions
- **Multi-Model Comparisons**: GARCH(1,1) vs EGARCH vs GJR-GARCH

### JavaScript/TypeScript Status

**NO native JavaScript/TypeScript GARCH libraries exist as of 2024-2025.**

**Workarounds:**
1. Python microservices with `arch` package
2. Custom TypeScript implementation
3. Python-shell npm package bridge

### Resources

- [V-Lab GARCH Documentation](https://vlab.stern.nyu.edu/docs/volatility/GARCH)
- [V-Lab S&P 500 Analysis](https://vlab.stern.nyu.edu/volatility/VOL.SPX:IND-R.GARCH)

---

## 2. Kalman Filter Implementations

### JavaScript Libraries (Production-Ready)

**1. kalman-filter (npm)**
- Multi-dimensional implementation
- Version 2.3.0
- `npm i kalman-filter`

**2. kalmanjs**
- 1D data filtering
- Lightweight
- [GitHub](https://github.com/wouterbulten/kalmanjs)

**3. Kalman.js**
- Works with Sylvester Matrix library
- `npm install kalman`

### TradingView Indicators (2024)

- **Kalman Filter Oscillator v4**: Short/long-term trend analysis
- **Adaptive Kalman Trend Filter**: Advanced trend-following by Zeiierman
- **Kalman Trend Strength Index**: Combines Kalman with correlation analysis
- **Kalman Trend Levels**: Support/resistance zones

### Implementation Example

```javascript
import KalmanFilter from 'kalmanjs';

const kf = new KalmanFilter({ R: 0.01, Q: 3 });
const smoothedPrices = prices.map(price => kf.filter(price));
```

---

## 3. Hidden Markov Models for Regime Detection

### Research (2024-2025)

- **Multi-model ensemble-HMM** (Oct 2025): Tree-based ensemble with HMM for bull/bear/neutral
- **HMM-Based Market Regime Detection with RL** (2025): Portfolio management applications
- **Regime-Switching Factor Investing**: MDPI paper on factor investing

### Visualization Techniques

**Bull/Bear Color Coding:**
- Three-state models: Bull (green), Neutral (yellow), Bear (red)
- States sorted by mean log return
- Lowest/negative returns + highest volatility = Bear

**Transition Probabilities:**
- Probability matrices showing regime change likelihood
- Timeline overlays on price charts
- Confidence bands for regime uncertainty

### JavaScript/TypeScript Status

**NO dedicated HMM libraries for JavaScript/TypeScript as of 2024-2025.**

**Solution:** Python microservices with `hmmlearn`, visualize with D3.js/Plotly.

---

## 4. Recommended Architecture

```
Frontend (TypeScript):
├── Chart Rendering: D3.js or Plotly.js
├── Kalman Filter: kalman-filter npm package ✅
└── UI/Interactions: React

Backend (Python microservices):
├── GARCH Models: arch package
├── HMM Regime Detection: hmmlearn
└── API: FastAPI or Flask

Integration:
└── REST API or WebSocket for real-time data
```

---

## 5. Visualization Frameworks

### D3.js
- Complete control over visualization
- Custom interactions and animations
- [D3 Heatmap Gallery](https://d3-graph-gallery.com/heatmap)

### Plotly.js
- Built on D3.js, 40+ chart types
- Built-in interactivity
- [Plotly JavaScript](https://plotly.com/javascript/)

---

## Key Findings

| Model | JS/TS Library | Python Library | Recommendation |
|-------|---------------|----------------|----------------|
| GARCH | None | arch | Python microservice |
| Kalman | kalman-filter ✅ | filterpy | Native JS |
| HMM | None | hmmlearn | Python microservice |

---

## Sources

- [kalman-filter npm](https://www.npmjs.com/package/kalman-filter)
- [kalmanjs GitHub](https://github.com/wouterbulten/kalmanjs)
- [Kalman Filter TradingView](https://www.tradingview.com/script/Dgy3jYh7/)
- [Market Regime Detection HMM](https://pyquantlab.medium.com/market-regime-detection-using-hidden-markov-models-809b723f93b9)
- [V-Lab GARCH](https://vlab.stern.nyu.edu/docs/volatility/GARCH)
- [D3.js Official](https://d3js.org/)
- [Plotly JavaScript](https://plotly.com/javascript/)

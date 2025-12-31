# Options Greeks Visualization
## Comprehensive Research Report (2024-2025)

**Research Date:** December 31, 2025
**Focus Areas:** 3D Surface Plots, Interactive Payoff Diagrams, Implied Volatility Smiles

---

## Executive Summary

Plotly.js is the leading solution for 3D Greeks surfaces due to WebGL performance. D3.js dominates payoff diagrams. Multiple npm packages exist for Black-Scholes calculations, with `@uqee/black-scholes` recommended for TypeScript.

---

## 1. 3D Surface Plots for Greeks

### Plotly.js (Recommended)

- Built on D3.js and stack.gl with WebGL rendering
- GPU-accelerated rendering for smooth interactivity
- 40+ chart types including comprehensive 3D support

```javascript
Plotly.newPlot('chart', [{
  z: greeksData,
  x: strikePrices,
  y: expirationDates,
  type: 'surface',
  colorscale: 'Viridis'
}], {
  scene: {
    xaxis: { title: 'Strike Price' },
    yaxis: { title: 'Time to Expiration' },
    zaxis: { title: 'Delta/Gamma/Theta/Vega' }
  }
});
```

### Three.js (Custom Solutions)

- Full control over WebGL rendering pipeline
- Parametric surface support
- Requires more development effort

### Greeks Surface Concept

- **X-axis**: Strike prices
- **Y-axis**: Time to expiration
- **Z-axis**: Greek value (Delta, Gamma, Theta, Vega)

**Color Mapping:**
- Diverging scales for positive/negative (Delta, Theta)
- Sequential scales for always-positive (Gamma, Vega)
- Common: Viridis, Plasma, RdYlGn

---

## 2. Interactive Payoff Diagrams

### D3.js-Based Solutions

**[option-payoff](https://github.com/anshuthopsee/option-payoff)**
- React + Material UI + D3.js
- Multi-leg strategy visualization
- Save strategies to local storage

**[OptionsChart](https://github.com/thess24/OptionsChart)**
- Pure D3.js charting library
- Methods for stock and option products

### Commercial Platforms

**Option Alpha (May 2024):**
- Interactive real-time payoff diagrams
- Dynamic IV, delta, underlying price adjustments

**TradesViz:**
- Full-fledged payoff chart with Black-Scholes
- 40 pre-built options strategies

**OptionStrat:**
- Strategy builder and optimization
- Unusual options activity visualization

---

## 3. Implied Volatility Smiles & Skews

### Volatility Surface

- **Smile**: IV vs. strike prices for given expiry
- **Term Structure**: IV across expiration dates
- **3D**: Time to maturity (x), moneyness (y), IV (z)

### GitHub Projects

**[vol-surface-visualizer](https://github.com/dwasse/vol-surface-visualizer)**
- Cryptocurrency options volatility surface
- Deribit mid-market data

**[volatility-surface-explorer](https://github.com/ashayp22/volatility-surface-explorer)**
- WebAssembly for web deployment
- Plotly for surface rendering

---

## 4. Black-Scholes Greeks Libraries

### NPM Packages

**1. @uqee/black-scholes (Recommended)**
- TypeScript implementation
- Fast interpolated calculations
- All Greeks: delta, gamma, theta, vega, rho
- Zero dependencies

**2. opcalc**
- Built in Rust, compiled to WebAssembly
- Performance optimized

**3. @haydenr4/blackscholes_wasm**
- First, second, third order Greeks
- WebAssembly performance

### Usage Example

```typescript
import { blackScholes } from '@uqee/black-scholes';

const result = blackScholes({
  stockPrice: 100,
  strikePrice: 105,
  timeToExpiry: 0.25,
  volatility: 0.25,
  riskFreeRate: 0.05,
  optionType: 'call'
});
// result: { price, delta, gamma, theta, vega, rho }
```

---

## 5. Trading Platform Comparison

| Platform | Greeks Display | Best For |
|----------|---------------|----------|
| ThinkorSwim | Custom option chains, Price Slice | Advanced analysis |
| Tastyworks | Delta column, Analysis tab | Fast execution |
| Interactive Brokers | Advanced charting, algo support | Professional traders |

---

## 6. WebGL Performance Optimization

1. **Minimize Draw Calls**: Batch rendering
2. **Shader Optimization**: Move calculations to vertex shader
3. **Texture Compression**: DDS, WebP formats
4. **Level of Detail**: Reduce resolution when zoomed out
5. **Worker Threads**: Calculate Greeks in Web Workers

---

## 7. Recommended Stack

**For Rapid Prototyping:**
```
Plotly.js + @uqee/black-scholes + React
```

**For Maximum Performance:**
```
Three.js + opcalc (Rust/WASM) + WebGL optimization
```

**For Financial Dashboard:**
```
LightningChart JS + black-scholes + TypeScript
```

---

## Sources

- [Plotly 3D Surface Plots](https://plotly.com/javascript/3d-surface-plots/)
- [option-payoff GitHub](https://github.com/anshuthopsee/option-payoff)
- [@uqee/black-scholes npm](https://www.npmjs.com/package/@uqee/black-scholes)
- [ORATS Volatility Surface](https://orats.com/university/volatility-surface)
- [Option Alpha Payoff Diagrams](https://optionalpha.com/blog/option-payoff-diagram)
- [TradesViz Options Charts](https://www.tradesviz.com/blog/options-payoff-chart/)

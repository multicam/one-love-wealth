# Cryptocurrency On-Chain Analytics
## Comprehensive Research Report (2024-2025)

**Research Date:** December 31, 2025
**Focus Areas:** UTXO Visualization, Address Clustering, Mining Distribution, Smart Contract Graphs

---

## Executive Summary

The on-chain analytics ecosystem is dominated by Glassnode (UTXO/Bitcoin metrics), Dune Analytics (100+ blockchains), and Arkham Intelligence (800M+ address labels). Dune reached 100 chains in March 2025.

---

## 1. UTXO Visualization - HODL Waves & Realized Cap

### Glassnode Implementation

**API Endpoint:** `https://api.glassnode.com/v1/metrics/supply/rcap_hodl_waves`

**Metrics Available:**
- Standard HODL Waves (percentage by age)
- Realized Cap HODL Waves (weighted by realized price)
- UTXO profit/loss percentages
- Created/spent UTXO values

**Example Response:**
```json
{
  "t": 1726790400,
  "o": {
    "2009": 53835.77,
    "2010": 56154.48,
    "2024": 369748658936.91
  }
}
```

### Resources

- [HODL Waves Documentation](https://docs.glassnode.com/guides-and-tutorials/metric-guides/age-distribution/hodl-waves)
- [Unchained HODL Waves](https://www.unchained.com/hodlwaves)

---

## 2. Address Clustering & Whale Tracking

### Arkham Intelligence Platform

- **Visualizer Tool**: Interactive mind map of entity transactions
- **Scale**: 800M+ labels across addresses
- **Features**:
  - Nodes represent entities, edges show connections
  - Default 1,000 most recent transactions
  - Customizable filters (time, token value, USD)

**Platform Access:** [intel.arkm.com](https://intel.arkm.com/)

### Network Graph Libraries

- **vis.js**: Network visualization
- **cytoscape.js**: Graph analysis and visualization
- **sigma.js**: WebGL-powered large graphs

---

## 3. Mining Distribution Visualization

### Geographic Distribution (2024-2025)

| Country | Hashrate |
|---------|----------|
| United States | 35% |
| Kazakhstan | 14% |
| Russia | 7% |
| Germany | 4% |

**Key Insight:** No single country >40% (reduced 51% attack risk post-China crackdown)

### Visualization Platforms

- **Cambridge CBECI**: [Mining Map](https://ccaf.io/cbnsi/cbeci/mining_map)
- **CoinWarz**: [Hashrate Charts](https://www.coinwarz.com/mining/bitcoin/hashrate-chart)
- **Hashrate Index**: Global Hashrate Heatmap

---

## 4. Smart Contract Interaction Graphs

### Dune Analytics Capabilities

- **Real-time Data**: Smart contract interactions, DeFi metrics
- **Coverage**: 100+ blockchains (March 2025)
- **Echo Platform**: Sub-300ms latency
- **Stats**: 700,000+ dashboards, 50,000+ public

**Use Cases:**
- Liquidity pool monitoring
- Yield farming trend tracking
- Protocol performance analysis

### Token Flow Sankey Diagrams

**Libraries:**
- **d3-sankey**: D3.js Sankey module
- **Google Charts Sankey**: [Documentation](https://developers.google.com/chart/interactive/docs/gallery/sankey)
- **SankeyMATIC**: [Free online builder](https://sankeymatic.com/)
- **Bitquery**: GraphQL + Gephi visualization

---

## 5. MEV Visualization

### MEV Scale ($7.2B since 2020)

- Daily average: $10-20M (normal), $40-50M (volatile)
- **Distribution:**
  - 35% Arbitrage ($2.5B)
  - 30% Sandwich attacks ($2.2B)
  - 25% Liquidations ($1.8B)
  - 10% Other ($700M)

### Flashbots Developments (2024-2025)

- **BuilderNet Launch**: November 2024
- **December 2024**: Migrated all builders to BuilderNet
- **February 2025**: BuilderNet v1.2 enhanced security

**Resources:**
- [Flashbots](https://www.flashbots.net/)
- [Quantifying REV](https://writings.flashbots.net/quantifying-rev)

---

## 6. API Access

### Glassnode API

- **Base URL**: `https://api.glassnode.com/`
- **Requirements**: Professional plan + API add-on
- **Rate Limit**: 600 requests/minute
- **Format**: REST API, JSON

**Python Example:**
```python
import requests

url = "https://api.glassnode.com/v1/metrics/supply/rcap_hodl_waves"
params = {"a": "BTC", "api_key": "YOUR_KEY"}
response = requests.get(url, params=params)
```

### Dune Analytics API

- **Free Tier**: 2,500 credits/month
- **Dashboard Templates**: Treasury, voting, token distribution
- **Documentation**: [docs.dune.com](https://docs.dune.com/home)

---

## 7. Open Source Libraries

### React Chart Libraries

- **Recharts**: Minimal D3 dependencies, native SVG
- **Plottable**: Built on D3.js, faster than raw D3

### GitHub Projects

- [On-Chain Analysis Topics](https://github.com/topics/on-chain-analysis)
- [React Crypto Dashboard](https://github.com/karkranikhil/react-dashboard)
- [Cryptocurrency Visualization](https://github.com/rangigo/cryptocurrency-visualization)

---

## Platform Comparison

| Platform | Specialty | Coverage | API Access |
|----------|-----------|----------|------------|
| Glassnode | UTXO/Bitcoin | 1,200+ assets | Professional+ |
| Dune | Multi-chain SQL | 100+ chains | Free tier |
| Arkham | Entity tracking | 800M+ labels | Platform |
| CryptoQuant | Exchange flows | Major exchanges | API available |

---

## Sources

- [Glassnode API Documentation](https://docs.glassnode.com/basic-api/api)
- [Dune Analytics](https://dune.com/home)
- [Arkham Intelligence](https://intel.arkm.com/)
- [Flashbots](https://www.flashbots.net/)
- [Cambridge CBECI Mining Map](https://ccaf.io/cbnsi/cbeci/mining_map)
- [Electric Capital Developer Report](https://www.developerreport.com)

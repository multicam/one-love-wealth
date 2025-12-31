# Machine Learning Model Visualization
## Comprehensive Research Report (2024-2025)

**Research Date:** December 31, 2025
**Focus Areas:** Uncertainty Bands, Feature Importance Heatmaps, SHAP Waterfall Charts

---

## Executive Summary

ML visualization for financial predictions requires specialized techniques for uncertainty quantification, feature importance, and model explainability. Key finding: No native JavaScript SHAP waterfall support exists - use Python backend + JS charting.

---

## 1. Neural Network Prediction Uncertainty Bands

### Bayesian Neural Networks & Monte Carlo Dropout

**State-of-the-Art (2024-2025):**
- **AutoBNN** (Dec 2025): Google's TensorFlow Probability framework for probabilistic forecasting
- **Dual-Uncertainty Framework** (2025): VMD with LSTM + concrete dropout for epistemic uncertainty
- **Enhanced MC Dropout** (2025): Grey Wolf Optimizer + Bayesian Optimization integration

**Implementation Best Practices:**
- Sample predictions 1000 times for statistical significance
- Use dropout rate 200-500 iterations for MC dropout
- Account for both aleatoric (data) and epistemic (model) uncertainties
- Implement stable output layers for improved estimation

### Ensemble Prediction Intervals

**Mathematical Foundation:**
```
95% prediction interval: ŷ_(T+h|T) ± 1.96 σ̂_h
```

**Libraries:**
- TensorFlow Probability (Python)
- PyMC for Bayesian inference
- skforecast `predict_interval` method

---

## 2. Feature Importance Heatmaps

### SHAP Heatmaps with Hierarchical Clustering

- X-axis: instances
- Y-axis: model inputs
- Ordered by hierarchical clustering based on explanation similarity

```python
import shap
shap.plots.heatmap(shap_values, instance_order=shap_values.sum(1))
```

### Cross-Asset Correlation Heatmaps

**Plotly Implementation:**
```javascript
Plotly.newPlot('heatmap', [{
  z: correlationMatrix,
  x: assetLabels,
  y: assetLabels,
  type: 'heatmap',
  colorscale: 'RdBu'
}]);
```

**D3.js Correlogram:**
- [D3 Correlogram Gallery](https://d3-graph-gallery.com/correlogram)
- Scatterplots or symbols for each pair
- Custom interactive features

---

## 3. SHAP Value Waterfall Charts

### SHAP for Financial Time Series (2024-2025)

**Recent Research:**
- **CFA Institute (Aug 2025)**: SHAP for trade execution explanations
- **Stock Prediction with XAI (2025)**: DLinear, LTSNet, Transformers with SHAP/LIME
- **Time-Varying SHAP (2022)**: KernelSHAP with VAR models

### JavaScript Implementation

**Current State:**
- `shap.js` library: Only force plot components, NO native waterfall support
- Force plots use JavaScript by default after `shap.initjs()`
- [GitHub Issue #2550](https://github.com/shap/shap/issues/2550)

**Alternative JavaScript Libraries:**
- **AnyChart**: Full waterfall support
- **CanvasJS**: Cumulative effects visualization
- **Chart.js**: Community SHAP waterfall solution

### Recommended Architecture

```typescript
// 1. Calculate SHAP in Python backend
// 2. Export to JSON
// 3. Visualize with JavaScript

fetch('/api/shap-values')
  .then(res => res.json())
  .then(shapData => {
    renderWaterfallChart(shapData);
  });
```

---

## 4. WindowSHAP for Time Series

**Breakthrough (2023):**
- Model-agnostic framework for time-series classifiers
- Reduces CPU time by 80% for 120-timestep series
- Merges adjacent points for efficiency

**Implementation:**
- Rolling window SHAP analysis
- Temporal feature importance tracking
- [WindowSHAP Paper](https://www.sciencedirect.com/science/article/pii/S1532046423001594)

---

## 5. JavaScript Libraries

### Visualization

| Library | Best For | Performance |
|---------|----------|-------------|
| D3.js | Custom viz | Maximum flexibility |
| Plotly.js | Rapid dev | 40+ chart types |
| TensorFlow.js | Client-side ML | Limited uncertainty |
| Brain.js | GPU neural nets | Simple models |

### TensorFlow.js Limitations

- Full ML platform for JavaScript
- Stock market prediction capabilities
- **Limited TensorFlow Probability support** (Python-only)
- Alternative: Ensemble methods, MC dropout

---

## 6. Best Practices

### Uncertainty Quantification:
- Use 1000 MC dropout samples
- Implement both aleatoric and epistemic uncertainty
- Account for interval underestimation (nominal 95% often 71-87%)

### Feature Importance:
- Combine SHAP summary + waterfall charts
- Use hierarchical clustering for feature grouping
- Normalize scores to 0-1 for comparison

### Visualization Architecture:
- Python backend for SHAP/uncertainty computations
- JSON API for frontend communication
- Plotly.js for rapid interactive development
- D3.js for custom visualizations

---

## Sources

- [AutoBNN - Google Research](https://research.google/blog/autobnn-probabilistic-time-series-forecasting-with-compositional-bayesian-neural-networks/)
- [SHAP Waterfall Documentation](https://shap.readthedocs.io/en/latest/example_notebooks/api_examples/plots/waterfall.html)
- [WindowSHAP Paper](https://www.sciencedirect.com/science/article/pii/S1532046423001594)
- [CFA Explainable AI in Finance](https://rpc.cfainstitute.org/research/reports/2025/explainable-ai-in-finance)
- [Plotly Heatmaps](https://plotly.com/python/heatmaps/)
- [D3 Heatmap Gallery](https://d3-graph-gallery.com/heatmap)

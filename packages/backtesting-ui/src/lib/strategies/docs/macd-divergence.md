---
id: macd-divergence
description: Enter when MACD crosses above signal line, exit when crosses below
category: momentum
tags:
  - macd
  - momentum
  - trend
relatedStrategies:
  - ma-crossover
  - rsi-reversion
---

## How It Works

MACD (Moving Average Convergence Divergence) uses the difference between two exponential moving averages (fast and slow). A third line (signal line) is a moving average of the MACD. When MACD crosses above the signal line, it indicates bullish momentum. When it crosses below, bearish momentum.

## When to Use

- Trend-following with momentum confirmation
- Identifying trend changes earlier than MA crossover
- Combining with other indicators

## Strengths

- Combines trend and momentum
- Earlier signals than simple MA crossover
- Widely used and tested
- Multiple signal types (crossover, divergence, histogram)

## Weaknesses

- Lags in fast markets
- Generates false signals in choppy conditions
- Complex parameter tuning
- Requires understanding of indicator mechanics

## Parameters

### symbol
Asset to trade

### fastPeriod
Fast EMA period (typically 12)

**Recommendations:**
- 12 (standard)
- 8-10 for faster signals
- 15-20 for slower signals

### slowPeriod
Slow EMA period (typically 26)

**Recommendations:**
- 26 (standard)
- 20-24 for faster
- 30-35 for slower

### signalPeriod
Signal line period (typically 9)

**Recommendations:**
- 9 (standard)
- 5-7 for faster
- 10-12 for slower

### positionSize
Capital allocation (0.0 to 1.0)

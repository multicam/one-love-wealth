---
id: bollinger-breakout
description: Trade breakouts above upper band or mean reversion to middle band
category: volatility
tags:
  - bollinger-bands
  - volatility
  - breakout
  - mean-reversion
relatedStrategies:
  - rsi-reversion
  - ma-crossover
---

## How It Works

Bollinger Bands consist of a moving average (middle band) with upper and lower bands at N standard deviations. This strategy can operate in two modes:

**Breakout Mode:** Enter long when price breaks above the upper band (strong momentum)
**Reversion Mode:** Enter long when price touches the lower band (oversold bounce)

## When to Use

- Volatility-based trading
- Identifying extreme price moves
- Combining trend and mean reversion

## Strengths

- Adapts to volatility (bands widen/narrow)
- Works in different market regimes
- Visual interpretation
- Flexible (breakout or reversion)

## Weaknesses

- Parameter sensitivity
- False breakouts common
- Requires mode selection
- Lagging indicator

## Parameters

### symbol
Asset to trade

### period
Moving average period for middle band (typically 20)

### stdDev
Standard deviations for band width (typically 2)

**Recommendations:**
- 2 (standard)
- 1.5 for tighter bands
- 2.5-3 for wider bands

### mode
Trading mode: 'breakout' or 'reversion'

### positionSize
Capital allocation (0.0 to 1.0)

---
id: rsi-reversion
description: Enter when RSI indicates oversold, exit when overbought - mean reversion strategy
category: mean-reversion
tags:
  - rsi
  - mean-reversion
  - oscillator
relatedStrategies:
  - bollinger-breakout
---

## How It Works

RSI Reversion uses the Relative Strength Index (RSI) oscillator to identify overbought and oversold conditions. When RSI falls below the oversold threshold (typically 30), it signals a potential bounce and triggers entry. When RSI rises above the overbought threshold (typically 70), it signals profit-taking and triggers exit.

## When to Use

- Range-bound markets
- Assets with strong mean reversion characteristics
- Choppy, consolidating price action

## Strengths

- Profits from market overreactions
- Works in sideways markets
- Clear entry/exit signals
- Well-established indicator

## Weaknesses

- Fails in strong trends
- Can stay overbought/oversold for extended periods
- Requires precise parameter tuning
- Whipsaw in volatile conditions

## Parameters

### symbol
Asset to trade

### rsiPeriod
Lookback period for RSI calculation (typically 14)

**Recommendations:**
- 14 (standard)
- 7-10 for faster signals
- 20-25 for slower signals

### oversold
RSI level below which to enter (typically 30)

**Recommendations:**
- 30 (standard)
- 20 for more extreme oversold
- 40 for earlier entry

### overbought
RSI level above which to exit (typically 70)

**Recommendations:**
- 70 (standard)
- 80 for more extreme overbought
- 60 for earlier exit

### positionSize
Capital allocation per trade (0.0 to 1.0)

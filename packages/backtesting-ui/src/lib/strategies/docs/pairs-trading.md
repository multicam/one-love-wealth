---
id: pairs-trading
description: Trade mean reversion of spread between two correlated assets
category: multi-symbol
tags:
  - pairs
  - mean-reversion
  - statistical-arbitrage
  - multi-symbol
relatedStrategies:
  - rsi-reversion
---

## How It Works

Pairs Trading identifies two historically correlated assets and trades the spread between them. When the spread widens beyond a threshold (one asset outperforms), enter a position expecting mean reversion: long the underperformer, short the outperformer (or in our case, just long the underperformer). Exit when the spread returns to normal.

## When to Use

- High correlation between two assets
- Stable long-term relationship
- Market-neutral strategies
- Relative value trading

## Strengths

- Market-neutral (reduces market risk)
- Profits from relative performance
- Statistical arbitrage opportunity
- Lower correlation to overall market

## Weaknesses

- Requires finding good pairs
- Correlation can break down
- Mean reversion not guaranteed
- Complex position management
- Requires two symbols

## Examples

- SPY vs QQQ (broad market vs tech)
- XLF vs XLE (financials vs energy)
- Sector rotation pairs
- Correlated commodity ETFs

## Parameters

### symbol1
First symbol in the pair

**Tooltip:** Typically the more volatile or aggressive asset

### symbol2
Second symbol in the pair

**Tooltip:** Should be highly correlated to symbol1

**Recommendations:**
- Assets with 0.7+ correlation
- Same sector or asset class
- Similar liquidity

### lookbackPeriod
Period for calculating spread statistics

**Recommendations:**
- 20-30 days for short-term
- 60-90 days for medium-term
- 120+ days for long-term

### entryThreshold
Z-score threshold for entering position

**Tooltip:** How many standard deviations wide before entry

**Recommendations:**
- 1.5 for aggressive entry
- 2.0 for moderate (standard)
- 2.5+ for conservative entry

### exitThreshold
Z-score threshold for exiting position

**Tooltip:** Spread convergence level for taking profit

**Recommendations:**
- 0.0 for mean reversion to center
- 0.5 for early exit with profit
- -0.5 for overcorrection exit

**Warnings:**
- Must be less than entryThreshold
- Too tight causes premature exits

### positionSize
Capital allocation (0.0 to 1.0)

**Recommendations:**
- 0.25-0.50 for pairs strategies
- Never use 1.0 (need flexibility for multiple pairs)

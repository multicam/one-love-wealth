---
id: buy-and-hold
description: Simple buy and hold strategy - enter once and hold for the entire period
category: trend
tags:
  - passive
  - long-term
  - benchmark
relatedStrategies:
  - ma-crossover
---

## How It Works

The Buy and Hold strategy purchases the asset at the beginning of the backtest period and holds it until the end, never selling. This is the simplest possible strategy and serves as a baseline benchmark for comparing more complex active strategies.

## When to Use

Use as a benchmark to evaluate whether active strategies justify their complexity and trading costs.

## Strengths

- Zero trading costs (one entry, one exit)
- No timing risk
- Captures full long-term trend
- Tax-efficient (long-term capital gains)
- Benchmark for strategy comparison

## Weaknesses

- No downside protection
- Experiences full drawdowns
- Requires patience during corrections
- No risk management

## Examples

- SPY Buy and Hold - Broad market benchmark
- QQQ Buy and Hold - Tech sector benchmark
- BTC-USD Buy and Hold - Crypto benchmark

## Parameters

### symbol
The ticker symbol to buy and hold

**Recommendations:**
- Broad index ETFs (SPY, VTI) for diversification
- Sector ETFs for targeted exposure
- Individual stocks for concentrated bets

### positionSize
Percentage of capital to invest (0.0 to 1.0)

**Tooltip:** 1.0 = 100% invested

**Recommendations:**
- 1.0 for single-asset portfolio
- 0.25-0.50 for multi-asset portfolio

---
id: vix-hedge
description: Reduce exposure when VIX spikes above threshold, re-enter when volatility subsides
category: multi-symbol
tags:
  - volatility
  - hedge
  - defensive
  - multi-symbol
relatedStrategies:
  - buy-and-hold
  - bollinger-breakout
---

## How It Works

The VIX Hedge strategy monitors the CBOE Volatility Index (VIX) to dynamically adjust position sizing based on market volatility. When VIX exceeds the exit threshold, it reduces or completely exits the position to preserve capital during turbulent periods. When VIX falls back below the entry threshold, it re-enters the position.

This approach recognizes that elevated volatility often precedes or coincides with market drawdowns. By stepping aside during high-VIX periods, the strategy aims to avoid the worst declines while maintaining exposure during calmer, upward-trending markets.

The strategy can optionally use a moving average of VIX for smoother signals, reducing whipsaw from short-term VIX spikes.

## When to Use

Best suited for:
- **Leveraged ETFs** (TQQQ, UPRO) - Protects against volatility decay
- **Risk management** - Reduces exposure during market stress
- **Long-term holdings** - Allows holding aggressive assets with downside protection
- **Bull markets with periodic corrections** - Sidesteps corrections, stays invested in rallies

Avoid in:
- **Low-volatility environments** - Strategy stays fully invested (no benefit)
- **Short-term trading** - Frequent VIX fluctuations cause overtrading
- **Assets uncorrelated to VIX** - VIX measures S&P 500 volatility, not all assets

## Strengths

- Reduces exposure during market crashes (2008, 2020)
- Works well with leveraged ETFs that suffer in volatility
- Simple volatility-based risk management
- Can be combined with other entry/exit rules
- Historically effective during flash crashes and corrections
- Preserves capital for re-entry at better prices

## Weaknesses

- VIX can spike during up moves (misses gains)
- Whipsaw risk when VIX oscillates around threshold
- No benefit in persistently low-VIX environments
- Requires monitoring two symbols (trading symbol + VIX)
- VIX-based timing doesn't work for all asset classes
- May exit too early or re-enter too late

## Examples

- **TQQQ Volatility Management**: Exit when VIX > 25, re-enter when VIX < 20
- **Aggressive Risk-Off**: Exit when VIX > 30 (only during severe stress)
- **Conservative Risk-Off**: Exit when VIX > 20 (more defensive)
- **Partial Hedge**: Reduce to 50% position instead of full exit
- **MA-Smoothed**: Use 5-day VIX MA to filter noise

## Parameters

### tradingSymbol
The ticker symbol to trade (e.g., TQQQ, UPRO, SPY)

**Tooltip:** Primary asset to buy/sell based on VIX

**Recommendations:**
- TQQQ (3x leveraged NASDAQ) - Popular for volatility hedging
- UPRO (3x leveraged S&P 500) - Broader market exposure
- SPY - Non-leveraged but still benefits from crash protection

**Warnings:**
- Leveraged ETFs have higher risk but benefit most from this strategy
- Low-volatility assets may not correlate well with VIX

### vixSymbol
The VIX symbol to monitor (usually ^VIX)

**Tooltip:** Volatility index for market fear gauge

**Recommendations:**
- ^VIX (default) - CBOE Volatility Index for S&P 500

**Warnings:**
- Only change this if trading assets with different volatility indices
- Most users should keep the default ^VIX

### vixExitThreshold
VIX level that triggers position exit or reduction

**Tooltip:** Exit when VIX exceeds this level

**Recommendations:**
- 20 for conservative protection (more exits)
- 25 for moderate protection (balanced)
- 30 for aggressive protection (only major crashes)

**Warnings:**
- Too low (< 18) causes frequent exits and underperformance
- Too high (> 35) may not protect enough
- Historical VIX average is ~15-20

### vixEntryThreshold
VIX level that triggers position re-entry

**Tooltip:** Re-enter when VIX falls below this level

**Recommendations:**
- 2-5 points below exit threshold to avoid whipsaw
- 18 for conservative (slower re-entry)
- 20 for moderate (balanced)

**Warnings:**
- Must be below vixExitThreshold
- Gap too small (<2) causes rapid enter/exit cycles
- Gap too large (>10) misses re-entry opportunities

### useMASignal
Apply moving average to VIX for smoother signals

**Tooltip:** Reduces noise from daily VIX spikes

**Recommendations:**
- true for smoother signals (recommended)
- false for instant reaction to VIX changes

### vixMAPeriod
Number of days for VIX moving average (if enabled)

**Tooltip:** Smooths VIX to reduce false signals

**Recommendations:**
- 3-5 days for short-term smoothing
- 5-10 days for moderate smoothing
- 10+ days for heavy smoothing (may lag)

**Warnings:**
- Only applies if useMASignal is true
- Higher values reduce whipsaw but increase lag

### partialExit
Reduce position instead of fully exiting

**Tooltip:** Keep partial exposure during volatility spikes

**Recommendations:**
- true for moderate risk management
- false for full protection (all or nothing)

### reducedPositionSize
Position size when partially exited (0.0 to 1.0)

**Tooltip:** Percentage of capital when hedged

**Recommendations:**
- 0.0 for full exit (no exposure)
- 0.25-0.50 for partial hedge
- 0.75 for minimal hedge

**Warnings:**
- Only applies if partialExit is true
- 1.0 means no hedge (stays fully invested)

### positionSize
Full position size when not hedged (0.0 to 1.0)

**Tooltip:** Normal position size in low-volatility periods

**Recommendations:**
- 0.95-1.0 for dedicated VIX hedge strategy
- 0.25-0.50 for multi-strategy portfolio

## Notes

**Historical Performance:**
VIX Hedge strategies historically reduced drawdowns during the 2008 Financial Crisis (-20% vs -55%), 2015-2016 volatility spike, 2018 December selloff, and 2020 COVID crash (-15% vs -35%). However, they underperformed during prolonged low-VIX bull runs (2017, 2021).

**Optimization Tips:**
- Backtest across multiple market cycles (bull, bear, choppy)
- Consider VIX term structure (contango vs backwardation)
- Combine with trend filters for double confirmation
- Test different threshold combinations for your risk tolerance
- Monitor VIX percentile (relative VIX level vs history)

**Common Mistakes:**
- Setting thresholds too tight (constant trading)
- Ignoring transaction costs and slippage
- Not accounting for VIX spikes during strong up moves
- Over-optimizing thresholds to past crashes
- Using with assets that don't correlate to S&P 500 volatility

**VIX Context:**
- Normal VIX: 12-20
- Elevated VIX: 20-30
- High VIX: 30-50
- Extreme VIX: 50+ (2008, 2020 peaks)

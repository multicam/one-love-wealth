# Batch Strategy Validation Report

**Generated:** 1/2/2026, 10:05:01 AM
**Period:** 10y
**Initial Capital:** $100,000
**Symbols Tested:** TQQQ, QQQ, SPY, AAPL
**Strategies Tested:** 6
**Total Tests:** 24

---

## Executive Summary

### Overall Best Performer

| Metric | Value |
|--------|-------|
| Strategy | Buy & Hold |
| Symbol | AAPL |
| Total Return | 885.5% |
| Sharpe Ratio | 0.90 |
| Max Drawdown | -0.3% |
| Rating | 🏆 Excellent |

---

## Return Matrix (%)

| Strategy | TQQQ | QQQ | SPY | AAPL |
|----------|------|------|------|------|
| Buy & Hold | 2146.4% | 437.6% | 226.9% | 885.5% |
| MA Crossover (50/200) | 420.6% | 202.7% | 68.1% | 166.6% |
| MA Crossover (20/50) | 206.6% | 179.0% | 81.8% | 302.8% |
| RSI Reversion | 192.7% | 113.0% | 38.8% | 132.0% |
| RSI Aggressive | 43.7% | 27.7% | 27.4% | 152.0% |
| Bollinger Breakout | 202.1% | 117.9% | 54.8% | 14.0% |

---

## Sharpe Ratio Matrix

| Strategy | TQQQ | QQQ | SPY | AAPL |
|----------|------|------|------|------|
| Buy & Hold | 0.56 | 0.84 | 0.72 | 0.90 |
| MA Crossover (50/200) | 0.40 | 0.72 | 0.41 | 0.49 |
| MA Crossover (20/50) | 0.28 | 0.74 | 0.57 | 0.79 |
| RSI Reversion | 0.25 | 0.50 | 0.25 | 0.46 |
| RSI Aggressive | 0.11 | 0.21 | 0.21 | 0.81 |
| Bollinger Breakout | 0.25 | 0.52 | 0.34 | 0.07 |

---

## Score Matrix (0-5)

| Strategy | TQQQ | QQQ | SPY | AAPL |
|----------|------|------|------|------|
| Buy & Hold | 4/5 | 4/5 | 4/5 | 5/5 |
| MA Crossover (50/200) | 2/5 | 3/5 | 2/5 | 2/5 |
| MA Crossover (20/50) | 4/5 | 4/5 | 4/5 | 5/5 |
| RSI Reversion | 2/5 | 3/5 | 2/5 | 3/5 |
| RSI Aggressive | 2/5 | 3/5 | 4/5 | 3/5 |
| Bollinger Breakout | 2/5 | 5/5 | 3/5 | 3/5 |

---

## Best Strategy per Symbol

| Symbol | Best Strategy | Return | Sharpe | Rating |
|--------|--------------|--------|--------|--------|
| TQQQ | Buy & Hold | 2146.4% | 0.56 | 🌟 Very Good |
| QQQ | Bollinger Breakout | 117.9% | 0.52 | 🏆 Excellent |
| SPY | Buy & Hold | 226.9% | 0.72 | 🌟 Very Good |
| AAPL | Buy & Hold | 885.5% | 0.90 | 🏆 Excellent |

---

## Best Symbol per Strategy

| Strategy | Best Symbol | Return | Sharpe | Rating |
|----------|-------------|--------|--------|--------|
| Buy & Hold | AAPL | 885.5% | 0.90 | 🏆 Excellent |
| MA Crossover (50/200) | QQQ | 202.7% | 0.72 | ✅ Good |
| MA Crossover (20/50) | AAPL | 302.8% | 0.79 | 🏆 Excellent |
| RSI Reversion | QQQ | 113.0% | 0.50 | ✅ Good |
| RSI Aggressive | SPY | 27.4% | 0.21 | 🌟 Very Good |
| Bollinger Breakout | QQQ | 117.9% | 0.52 | 🏆 Excellent |

---

## Detailed Results


### Buy & Hold on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 2146.40% |
| CAGR | 36.61% |
| Sharpe Ratio | 0.561 |
| Sortino Ratio | 0.521 |
| Max Drawdown | -0.82% |
| Win Rate | 0.0% |
| Total Trades | 0 |
| WF Consistency | 67% |
| WF Robustness | 22/100 |
| MC Prob Profit | 95% |
| MC VaR 95% | 1.6% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### MA Crossover (50/200) on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 420.64% |
| CAGR | 17.98% |
| Sharpe Ratio | 0.396 |
| Sortino Ratio | 0.256 |
| Max Drawdown | -0.38% |
| Win Rate | 66.7% |
| Total Trades | 3 |
| WF Consistency | 0% |
| WF Robustness | 20/100 |
| MC Prob Profit | 84% |
| MC VaR 95% | -58.8% |
| Score | 2/5 |
| Rating | 📊 Fair |


### MA Crossover (20/50) on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 206.65% |
| CAGR | 11.89% |
| Sharpe Ratio | 0.283 |
| Sortino Ratio | 0.206 |
| Max Drawdown | -0.75% |
| Win Rate | 52.2% |
| Total Trades | 23 |
| WF Consistency | 67% |
| WF Robustness | 57/100 |
| MC Prob Profit | 77% |
| MC VaR 95% | -69.5% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### RSI Reversion on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 192.67% |
| CAGR | 11.37% |
| Sharpe Ratio | 0.247 |
| Sortino Ratio | 0.126 |
| Max Drawdown | -0.68% |
| Win Rate | 64.3% |
| Total Trades | 14 |
| WF Consistency | 0% |
| WF Robustness | 0/100 |
| MC Prob Profit | 79% |
| MC VaR 95% | -67.7% |
| Score | 2/5 |
| Rating | 📊 Fair |


### RSI Aggressive on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 43.72% |
| CAGR | 3.70% |
| Sharpe Ratio | 0.106 |
| Sortino Ratio | 0.044 |
| Max Drawdown | -0.72% |
| Win Rate | 60.0% |
| Total Trades | 5 |
| WF Consistency | 33% |
| WF Robustness | 28/100 |
| MC Prob Profit | 56% |
| MC VaR 95% | -70.7% |
| Score | 2/5 |
| Rating | 📊 Fair |


### Bollinger Breakout on TQQQ

| Metric | Value |
|--------|-------|
| Total Return | 202.06% |
| CAGR | 11.72% |
| Sharpe Ratio | 0.246 |
| Sortino Ratio | 0.129 |
| Max Drawdown | -0.64% |
| Win Rate | 72.0% |
| Total Trades | 50 |
| WF Consistency | 33% |
| WF Robustness | 10/100 |
| MC Prob Profit | 77% |
| MC VaR 95% | -80.1% |
| Score | 2/5 |
| Rating | 📊 Fair |


### Buy & Hold on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 437.58% |
| CAGR | 18.36% |
| Sharpe Ratio | 0.841 |
| Sortino Ratio | 0.787 |
| Max Drawdown | -0.35% |
| Win Rate | 0.0% |
| Total Trades | 0 |
| WF Consistency | 67% |
| WF Robustness | 29/100 |
| MC Prob Profit | 98% |
| MC VaR 95% | 56.2% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### MA Crossover (50/200) on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 202.74% |
| CAGR | 11.74% |
| Sharpe Ratio | 0.716 |
| Sortino Ratio | 0.488 |
| Max Drawdown | -0.22% |
| Win Rate | 100.0% |
| Total Trades | 3 |
| WF Consistency | 33% |
| WF Robustness | 31/100 |
| MC Prob Profit | 99% |
| MC VaR 95% | 58.5% |
| Score | 3/5 |
| Rating | ✅ Good |


### MA Crossover (20/50) on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 179.01% |
| CAGR | 10.83% |
| Sharpe Ratio | 0.739 |
| Sortino Ratio | 0.560 |
| Max Drawdown | -0.26% |
| Win Rate | 61.9% |
| Total Trades | 21 |
| WF Consistency | 67% |
| WF Robustness | 38/100 |
| MC Prob Profit | 98% |
| MC VaR 95% | 38.7% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### RSI Reversion on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 113.04% |
| CAGR | 7.88% |
| Sharpe Ratio | 0.504 |
| Sortino Ratio | 0.260 |
| Max Drawdown | -0.26% |
| Win Rate | 85.7% |
| Total Trades | 14 |
| WF Consistency | 33% |
| WF Robustness | 10/100 |
| MC Prob Profit | 96% |
| MC VaR 95% | 8.0% |
| Score | 3/5 |
| Rating | ✅ Good |


### RSI Aggressive on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 27.71% |
| CAGR | 2.48% |
| Sharpe Ratio | 0.207 |
| Sortino Ratio | 0.086 |
| Max Drawdown | -0.29% |
| Win Rate | 80.0% |
| Total Trades | 5 |
| WF Consistency | 67% |
| WF Robustness | 39/100 |
| MC Prob Profit | 74% |
| MC VaR 95% | -28.1% |
| Score | 3/5 |
| Rating | ✅ Good |


### Bollinger Breakout on QQQ

| Metric | Value |
|--------|-------|
| Total Return | 117.94% |
| CAGR | 8.12% |
| Sharpe Ratio | 0.521 |
| Sortino Ratio | 0.259 |
| Max Drawdown | -0.20% |
| Win Rate | 77.6% |
| Total Trades | 49 |
| WF Consistency | 100% |
| WF Robustness | 42/100 |
| MC Prob Profit | 95% |
| MC VaR 95% | 3.1% |
| Score | 5/5 |
| Rating | 🏆 Excellent |


### Buy & Hold on SPY

| Metric | Value |
|--------|-------|
| Total Return | 226.89% |
| CAGR | 12.61% |
| Sharpe Ratio | 0.720 |
| Sortino Ratio | 0.674 |
| Max Drawdown | -0.25% |
| Win Rate | 0.0% |
| Total Trades | 0 |
| WF Consistency | 67% |
| WF Robustness | 29/100 |
| MC Prob Profit | 99% |
| MC VaR 95% | 40.0% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### MA Crossover (50/200) on SPY

| Metric | Value |
|--------|-------|
| Total Return | 68.11% |
| CAGR | 5.34% |
| Sharpe Ratio | 0.410 |
| Sortino Ratio | 0.275 |
| Max Drawdown | -0.33% |
| Win Rate | 66.7% |
| Total Trades | 3 |
| WF Consistency | 33% |
| WF Robustness | 31/100 |
| MC Prob Profit | 91% |
| MC VaR 95% | -16.9% |
| Score | 2/5 |
| Rating | 📊 Fair |


### MA Crossover (20/50) on SPY

| Metric | Value |
|--------|-------|
| Total Return | 81.78% |
| CAGR | 6.17% |
| Sharpe Ratio | 0.571 |
| Sortino Ratio | 0.425 |
| Max Drawdown | -0.29% |
| Win Rate | 60.0% |
| Total Trades | 20 |
| WF Consistency | 67% |
| WF Robustness | 34/100 |
| MC Prob Profit | 96% |
| MC VaR 95% | 2.4% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### RSI Reversion on SPY

| Metric | Value |
|--------|-------|
| Total Return | 38.84% |
| CAGR | 3.34% |
| Sharpe Ratio | 0.245 |
| Sortino Ratio | 0.133 |
| Max Drawdown | -0.27% |
| Win Rate | 72.7% |
| Total Trades | 11 |
| WF Consistency | 33% |
| WF Robustness | 10/100 |
| MC Prob Profit | 75% |
| MC VaR 95% | -24.4% |
| Score | 2/5 |
| Rating | 📊 Fair |


### RSI Aggressive on SPY

| Metric | Value |
|--------|-------|
| Total Return | 27.41% |
| CAGR | 2.46% |
| Sharpe Ratio | 0.207 |
| Sortino Ratio | 0.076 |
| Max Drawdown | -0.27% |
| Win Rate | 60.0% |
| Total Trades | 5 |
| WF Consistency | 67% |
| WF Robustness | 49/100 |
| MC Prob Profit | 72% |
| MC VaR 95% | -38.7% |
| Score | 4/5 |
| Rating | 🌟 Very Good |


### Bollinger Breakout on SPY

| Metric | Value |
|--------|-------|
| Total Return | 54.82% |
| CAGR | 4.48% |
| Sharpe Ratio | 0.336 |
| Sortino Ratio | 0.172 |
| Max Drawdown | -0.29% |
| Win Rate | 72.5% |
| Total Trades | 51 |
| WF Consistency | 67% |
| WF Robustness | 24/100 |
| MC Prob Profit | 87% |
| MC VaR 95% | -18.6% |
| Score | 3/5 |
| Rating | ✅ Good |


### Buy & Hold on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 885.50% |
| CAGR | 25.78% |
| Sharpe Ratio | 0.903 |
| Sortino Ratio | 0.906 |
| Max Drawdown | -0.33% |
| Win Rate | 0.0% |
| Total Trades | 0 |
| WF Consistency | 100% |
| WF Robustness | 45/100 |
| MC Prob Profit | 100% |
| MC VaR 95% | 217.5% |
| Score | 5/5 |
| Rating | 🏆 Excellent |


### MA Crossover (50/200) on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 166.62% |
| CAGR | 10.33% |
| Sharpe Ratio | 0.486 |
| Sortino Ratio | 0.343 |
| Max Drawdown | -0.32% |
| Win Rate | 50.0% |
| Total Trades | 4 |
| WF Consistency | 0% |
| WF Robustness | 20/100 |
| MC Prob Profit | 93% |
| MC VaR 95% | -2.9% |
| Score | 2/5 |
| Rating | 📊 Fair |


### MA Crossover (20/50) on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 302.77% |
| CAGR | 14.99% |
| Sharpe Ratio | 0.788 |
| Sortino Ratio | 0.638 |
| Max Drawdown | -0.28% |
| Win Rate | 50.0% |
| Total Trades | 26 |
| WF Consistency | 67% |
| WF Robustness | 60/100 |
| MC Prob Profit | 99% |
| MC VaR 95% | 42.0% |
| Score | 5/5 |
| Rating | 🏆 Excellent |


### RSI Reversion on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 132.04% |
| CAGR | 8.80% |
| Sharpe Ratio | 0.458 |
| Sortino Ratio | 0.255 |
| Max Drawdown | -0.26% |
| Win Rate | 81.3% |
| Total Trades | 16 |
| WF Consistency | 67% |
| WF Robustness | 31/100 |
| MC Prob Profit | 92% |
| MC VaR 95% | -13.3% |
| Score | 3/5 |
| Rating | ✅ Good |


### RSI Aggressive on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 151.99% |
| CAGR | 9.71% |
| Sharpe Ratio | 0.808 |
| Sortino Ratio | 0.388 |
| Max Drawdown | -0.11% |
| Win Rate | 100.0% |
| Total Trades | 8 |
| WF Consistency | 33% |
| WF Robustness | 16/100 |
| MC Prob Profit | 100% |
| MC VaR 95% | 42.2% |
| Score | 3/5 |
| Rating | ✅ Good |


### Bollinger Breakout on AAPL

| Metric | Value |
|--------|-------|
| Total Return | 13.95% |
| CAGR | 1.32% |
| Sharpe Ratio | 0.067 |
| Sortino Ratio | 0.037 |
| Max Drawdown | -0.44% |
| Win Rate | 62.8% |
| Total Trades | 43 |
| WF Consistency | 67% |
| WF Robustness | 35/100 |
| MC Prob Profit | 64% |
| MC VaR 95% | -51.4% |
| Score | 3/5 |
| Rating | ✅ Good |


---

*Report generated by Backtesting Framework*

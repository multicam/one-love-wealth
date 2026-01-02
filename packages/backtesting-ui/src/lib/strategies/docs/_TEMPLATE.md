---
id: strategy-id-here
description: One or two sentence description of what this strategy does
category: trend | momentum | mean-reversion | volatility | multi-symbol
tags:
  - tag1
  - tag2
  - tag3
relatedStrategies:
  - similar-strategy-1
  - similar-strategy-2
---

## How It Works

Detailed explanation of the strategy mechanism. Should be 2-3 paragraphs covering:

1. **Core Logic**: What signals does it use? When does it enter/exit?
2. **Theory**: Why should this work? What market inefficiency does it exploit?
3. **Implementation**: How are the signals calculated? Any special considerations?

Keep this section focused on the "what" and "why" of the strategy.

## When to Use

Describe ideal market conditions and use cases as a bullet list:

- **Market condition 1** - Why this strategy works here
- **Market condition 2** - Another scenario where it excels
- **Use case 1** - Specific application (e.g., "Long-term retirement portfolios")
- **Use case 2** - Another application

Also mention when to AVOID this strategy:
- **Bad condition 1** - Why it fails here
- **Bad condition 2** - Another poor environment

## Strengths

List of 4-8 advantages. Be specific:

- Advantage 1 with concrete details
- Advantage 2 explaining why it matters
- Advantage 3 with comparison to alternatives
- Advantage 4 noting unique benefits
- (Add more as needed)

## Weaknesses

List of 4-8 limitations. Be honest:

- Weakness 1 with impact description
- Weakness 2 noting when it occurs
- Weakness 3 explaining the tradeoff
- Weakness 4 with mitigation strategies
- (Add more as needed)

## Examples

Real-world use cases with specific parameters:

- **Example 1 Name**: symbol=SPY, param1=10, param2=50 - Description of when/why
- **Example 2 Name**: symbol=QQQ, param1=20, param2=100 - Different configuration
- **Example 3 Name**: High-volatility setup for TQQQ
- **Example 4 Name**: Conservative long-term approach
- (Add 3-6 examples)

## Parameters

Document each field that appears in the strategy registry. Use `### fieldKey` as the heading.

### symbol
Brief description of what this symbol represents (e.g., "Asset to trade")

**Tooltip:** Very short one-liner for hover tooltip

**Recommendations:**
- Recommendation 1 with context
- Recommendation 2 explaining why
- Recommendation 3 with example

**Warnings:**
- Warning 1 about common mistakes
- Warning 2 about edge cases

### param1
Description of the first parameter

**Tooltip:** Short explanation

**Recommendations:**
- Small value (e.g., 5-10) for X behavior
- Medium value (e.g., 20-30) for Y behavior
- Large value (e.g., 50+) for Z behavior

**Warnings:**
- Don't set too low (causes problem A)
- Must be less than param2

### param2
Description of the second parameter

**Tooltip:** Short explanation

**Recommendations:**
- Value range 1 for scenario A
- Value range 2 for scenario B

**Warnings:**
- Must be greater than param1
- Very large values cause issue X

### positionSize
Percentage of capital to allocate per trade (0.0 to 1.0)

**Tooltip:** 1.0 = 100% invested, 0.5 = 50%

**Recommendations:**
- 0.95-1.0 for single-strategy portfolios
- 0.25-0.50 for multi-strategy portfolios
- 0.10-0.25 for high-risk assets

**Warnings:**
- Using 1.0 leaves no cash buffer
- Consider correlation when running multiple strategies

(Add all other parameters following the same format)

## Notes

Optional section for additional context:

**Historical Performance:**
Brief notes on how strategy performed in past market conditions. Mention specific years or events.

**Optimization Tips:**
- Tip 1 for improving results
- Tip 2 for avoiding overfitting
- Tip 3 for parameter selection

**Common Mistakes:**
- Mistake 1 that users often make
- Mistake 2 to watch out for
- Mistake 3 with costly consequences

**Related Research:**
- Citation or link to academic paper
- Reference to related strategies or concepts
- Link to community resources

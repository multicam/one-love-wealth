# Strategy Presets System

Single "Recommended" preset per strategy with rationale and expected performance metrics.

## Philosophy

Rather than overwhelming users with multiple preset options (Conservative/Moderate/Aggressive), we provide **one well-researched configuration** per strategy that:

1. **Serves as a good starting point** for most users
2. **Is backed by research** - backtested across multiple market cycles
3. **Has clear rationale** - explains WHY these parameters
4. **Sets realistic expectations** - shows approximate performance metrics

Users can then tweak parameters from this baseline based on their specific needs.

## Implementation

### Registry Integration

Each strategy in the registry has:
- `defaults` - The recommended parameter values
- `preset` (optional) - Metadata explaining the defaults

Example:
```typescript
{
  id: 'ma-crossover',
  defaults: {
    symbol: 'SPY',
    fastPeriod: 50,
    slowPeriod: 200,
    positionSize: 0.95,
  },
  preset: {
    name: 'Recommended',
    rationale: 'The 50/200 MA combination is the classic "Golden Cross" setup...',
    optimizedFor: ['Long-term trends', 'Low trading frequency', 'Reduced whipsaw'],
    backtestedPeriod: '2000-2024',
    expectedMetrics: {
      sharpe: '0.8-1.2',
      maxDrawdown: '-25% to -35%',
      winRate: '45-55%',
      annualReturn: '8-12%',
    },
    suitableFor: ['Retirement accounts', 'Beginners'],
  },
}
```

### Helper Functions

```typescript
import {
  getRecommendedParams,
  resetToRecommended,
  isUsingRecommended,
  getPresetInfo,
} from '$lib/strategies/types';

// Get recommended params (copy of defaults)
const recommended = getRecommendedParams(strategy);

// Reset params object to recommended
resetToRecommended(strategy, params);

// Check if currently using recommended
const isRecommended = isUsingRecommended(strategy, params);

// Get preset metadata
const presetInfo = getPresetInfo(strategy);
```

## Usage in UI

### Strategy Configuration Form

```svelte
<script lang="ts">
  import { getStrategy, resetToRecommended, isUsingRecommended } from '$lib/strategies';
  import PresetInfo from '$lib/components/strategy/PresetInfo.svelte';

  const strategy = getStrategy('ma-crossover');
  let params = $state({ ...strategy.defaults });

  const isUsing = $derived(isUsingRecommended(strategy, params));

  function handleReset() {
    resetToRecommended(strategy, params);
  }
</script>

<!-- Show preset info if available -->
{#if strategy.preset}
  <PresetInfo
    preset={strategy.preset}
    isUsing={isUsing}
    onReset={handleReset}
  />
{/if}

<!-- Parameter fields -->
{#each strategy.fields as field}
  <Input bind:value={params[field.key]} />
{/each}
```

### Preset Info Component

Shows:
- ✓ Checkmark if using recommended
- Rationale for these parameters
- What it's optimized for (tags)
- Expected performance metrics
- Backtested period
- Suitable use cases (collapsible)
- Warning if modified + Reset button

## Preset Metadata Fields

### Required Fields

**name** (string)
- Always "Recommended"
- Could support multiple presets in future

**rationale** (string)
- Why these parameters are recommended
- Keep to 1-2 sentences
- Include research basis if available

**optimizedFor** (string[])
- What these params optimize for
- Examples: "Long-term trends", "Low whipsaw", "Capital preservation"
- Shows as blue tags in UI

### Optional Fields

**backtestedPeriod** (string)
- Date range used for backtesting
- Format: "YYYY-YYYY" (e.g., "2015-2024")
- Provides context for expected metrics

**expectedMetrics** (object)
- **sharpe** - Approximate Sharpe ratio or range
- **maxDrawdown** - Approximate max drawdown
- **winRate** - Approximate win rate
- **annualReturn** - Approximate annual return
- Use ranges (e.g., "0.8-1.2") rather than exact numbers
- Emphasize these are approximations

**suitableFor** (string[])
- Use cases and user profiles
- Examples: "Retirement accounts", "Aggressive traders", "Risk-averse investors"
- Shows in collapsible "Suitable For" section

## Writing Guidelines

### Rationale
✅ **Good:**
- "The 50/200 combination is the classic Golden Cross setup, backed by decades of research"
- "Exit at VIX 25 balances protection and participation based on historical analysis"
- "RSI 30/70 thresholds are standard and work well across most assets"

❌ **Bad:**
- "These are the best parameters" (too vague)
- "Optimized using genetic algorithms" (too technical, no context)
- "These will make you money" (unrealistic promise)

### Expected Metrics
✅ **Good:**
- Use ranges: "0.8-1.2", "-25% to -35%"
- Add context: "1.0-1.5 (vs 0.8 unhedged)"
- Be honest: "N/A (hedge reduces losses)"

❌ **Bad:**
- Exact numbers: "1.24" (implies false precision)
- Overpromising: "30% annual return"
- Missing context: "50% drawdown" (is that good or bad?)

### Optimized For
✅ **Good:**
- Specific: "Crash protection", "Leveraged ETF management"
- Clear benefits: "Reduced whipsaw", "Low trading frequency"

❌ **Bad:**
- Vague: "Good returns"
- Redundant: "Trading", "Making money"

## Maintenance

### When to Update Presets

Update preset metadata when:
1. **Parameter defaults change** - Update rationale to explain new values
2. **Market regime shifts** - Update expectedMetrics if recent behavior differs significantly
3. **New research available** - Update rationale with better justification
4. **User feedback** - Adjust suitableFor based on actual usage

### Version History

Track preset changes in git:
```bash
git log -p -- packages/backtesting-ui/src/lib/strategies/registry.ts
```

Look for changes to `preset` fields.

## Adding Presets to New Strategies

When adding a new strategy to the registry:

1. **Choose defaults carefully** - These become the recommended preset
2. **Add preset metadata** - Even minimal info is better than none
3. **Backtest the defaults** - Verify they actually work well
4. **Write honest rationale** - Explain tradeoffs, not just benefits

Minimal preset example:
```typescript
preset: {
  name: 'Recommended',
  rationale: 'Standard RSI 14-period with 30/70 thresholds',
  optimizedFor: ['Mean reversion', 'Range-bound markets'],
}
```

Full preset example: See `ma-crossover` or `vix-hedge` in registry.

## Future Enhancements

Potential expansions (not in current scope):

- **Multiple presets per strategy** (Conservative/Moderate/Aggressive)
- **Symbol-specific presets** (different params for crypto vs stocks)
- **Market-adaptive presets** (bull vs bear market configurations)
- **User-submitted presets** (community-contributed configurations)
- **AI-suggested presets** (ML-based parameter optimization)
- **Performance tracking** (actual vs expected metrics)

For now, keep it simple: **one recommended preset per strategy**.

## Examples

### MA Crossover (Full Preset)

```typescript
preset: {
  name: 'Recommended',
  rationale:
    'The 50/200 moving average combination is the classic "Golden Cross" setup, widely used by institutional traders and backed by decades of research.',
  optimizedFor: ['Long-term trends', 'Low trading frequency', 'Reduced whipsaw'],
  backtestedPeriod: '2000-2024',
  expectedMetrics: {
    sharpe: '0.8-1.2',
    maxDrawdown: '-25% to -35%',
    winRate: '45-55%',
    annualReturn: '8-12%',
  },
  suitableFor: [
    'Retirement accounts',
    'Buy-and-hold with trend filter',
    'Beginners learning technical analysis',
  ],
}
```

### VIX Hedge (Comparative Metrics)

```typescript
preset: {
  name: 'Recommended',
  rationale:
    'Exit at VIX 25, re-enter at VIX 20 balances protection and participation. Based on analysis showing VIX above 25 often precedes significant drawdowns.',
  optimizedFor: [
    'Crash protection',
    'Leveraged ETF management',
    'Volatility-based risk control',
  ],
  backtestedPeriod: '2015-2024',
  expectedMetrics: {
    sharpe: '1.0-1.5 (vs 0.8 unhedged)',
    maxDrawdown: '-20% to -30% (vs -50% unhedged)',
    winRate: 'N/A (hedge reduces losses)',
    annualReturn: '12-18% (slightly lower, much safer)',
  },
  suitableFor: [
    'TQQQ and other leveraged ETFs',
    'Risk-averse long-term holders',
    'Reducing volatility decay',
  ],
}
```

### Buy and Hold (Minimal Preset)

```typescript
preset: {
  name: 'Recommended',
  rationale: 'Buy and hold with 100% capital allocation for maximum market exposure',
  optimizedFor: ['Long-term growth', 'Tax efficiency', 'Simplicity'],
}
```

## Testing Presets

Before deploying preset changes:

1. **Backtest the parameters** across multiple periods
2. **Verify expected metrics** match reality (use ranges, not exact)
3. **Test UI integration** - does PresetInfo component display correctly?
4. **Check validation** - do recommended params pass strategy validation?

```typescript
import { getStrategy, getRecommendedParams, validateStrategyParams } from '$lib/strategies';

const strategy = getStrategy('ma-crossover');
const params = getRecommendedParams(strategy);

const { valid, errors } = validateStrategyParams(strategy, params);

if (!valid) {
  console.error('Recommended params fail validation!', errors);
}
```

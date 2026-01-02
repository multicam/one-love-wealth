## Custom Strategies System

User-defined custom strategies with Web Worker execution and localStorage persistence.

**⚠️ SECURITY WARNING:** This feature allows arbitrary code execution. See [SECURITY.md](./SECURITY.md) for critical security information.

## Overview

The custom strategies system allows users to:
- Write custom trading strategies in JavaScript/TypeScript
- Test strategies with the same backtesting engine as built-in strategies
- Save/load strategies from localStorage
- Import/export strategies as JSON
- Use templates as starting points

## Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Layer                                       │
│  - Strategy editor (Monaco/CodeMirror)         │
│  - Parameter configuration                     │
│  - Import/Export buttons                       │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│  Custom Strategy Manager                        │
│  - CRUD operations                              │
│  - Validation                                   │
│  - localStorage persistence                     │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│  Executor (Web Worker)                          │
│  - Sandboxed execution                          │
│  - Timeout protection                           │
│  - Trade generation                             │
└─────────────────────────────────────────────────┘
```

## Usage

### Creating a Custom Strategy

```typescript
import { getCustomStrategyManager, SIMPLE_MA_TEMPLATE } from '$lib/custom-strategies';

const manager = getCustomStrategyManager();

// Create from template
const id = manager.create({
  id: 'my-custom-ma',
  name: 'My MA Strategy',
  description: 'Custom moving average strategy',
  category: 'trend',
  code: SIMPLE_MA_TEMPLATE.code,
  fields: SIMPLE_MA_TEMPLATE.fields,
  defaults: SIMPLE_MA_TEMPLATE.defaults,
  tags: ['custom', 'ma'],
});
```

### Executing a Custom Strategy

```typescript
import { executeCustomStrategy } from '$lib/custom-strategies';
import { loadBacktestData } from '@one-love-wealth/backtesting';

// Load data
const data = await loadBacktestData({
  symbols: ['SPY'],
  period: '5y',
  interval: '1d',
});

// Execute strategy
const result = await executeCustomStrategy(
  strategy, // CustomStrategyDefinition
  { symbol: 'SPY', period: 20, positionSize: 0.95 },
  data,
  30000 // timeout
);

if (result.success) {
  console.log(`Generated ${result.trades.length} trades in ${result.executionTime}ms`);
} else {
  console.error(`Strategy failed: ${result.error}`);
}
```

### Managing Strategies

```typescript
const manager = getCustomStrategyManager();

// Get all custom strategies
const strategies = manager.getAll();

// Get specific strategy
const strategy = manager.get('my-custom-ma');

// Update strategy
manager.update('my-custom-ma', {
  description: 'Updated description',
  code: newCode,
});

// Delete strategy
manager.delete('my-custom-ma');

// Validate strategy
const validation = manager.validate(strategy);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Import/Export

```typescript
// Export single strategy
const json = manager.export('my-custom-ma');
// Save to file or share with others

// Import strategy
const id = manager.import(json);

// Export all strategies
const allJson = manager.exportAll();

// Import multiple strategies
const ids = manager.importAll(allJson);
```

## Strategy Code Structure

### Required Methods

Every custom strategy must implement:

```javascript
class CustomStrategy {
  // Constructor receives parameters
  constructor(params) {
    this.params = params;
    this.position = 0;
  }

  // Called once before backtesting starts
  initialize(data) {
    this.data = data; // { bars: Bar[], symbols: string[] }
    this.trades = [];
  }

  // Called for each bar in the dataset
  onBar(index) {
    const bar = this.data.bars[index];
    // Your trading logic here
  }

  // Called after backtesting completes
  finalize() {
    // Close any open positions
    // Return array of trades
    return this.trades;
  }
}

// Must return the class
return CustomStrategy;
```

### Bar Structure

Each bar has:

```typescript
interface Bar {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Trade Structure

Trades should have:

```typescript
interface Trade {
  type: 'entry' | 'exit';
  time: number; // Unix timestamp
  price: number;
  size: number; // Position size (0-1)
}
```

## Templates

### Simple MA Template

```typescript
import { SIMPLE_MA_TEMPLATE } from '$lib/custom-strategies';
```

Features:
- Single moving average
- Buy when price crosses above MA
- Sell when price crosses below MA
- Good starting point for beginners

### RSI Template

```typescript
import { RSI_TEMPLATE } from '$lib/custom-strategies';
```

Features:
- RSI indicator calculation
- Buy when oversold (< 30)
- Sell when overbought (> 70)
- Mean reversion example

### Empty Template

```typescript
import { EMPTY_TEMPLATE } from '$lib/custom-strategies';
```

Features:
- Minimal boilerplate
- Start from scratch
- For advanced users

## Integration with Registry

Custom strategies can be dynamically added to the strategy registry:

```typescript
import { getStrategy } from '$lib/strategies';
import { getCustomStrategyManager } from '$lib/custom-strategies';

// Get all strategies (built-in + custom)
function getAllStrategies() {
  const builtIn = Object.values(STRATEGIES);
  const custom = manager.getAll().map(convertToStrategyDefinition);
  return [...builtIn, ...custom];
}

// Convert custom strategy to StrategyDefinition
function convertToStrategyDefinition(custom: CustomStrategyDefinition) {
  return {
    id: custom.id,
    name: custom.name,
    description: custom.description,
    category: custom.category,
    create: (params) => executeCustomStrategy(custom, params, data),
    defaults: custom.defaults,
    fields: custom.fields,
    tags: [...(custom.tags || []), 'custom'],
  };
}
```

## Validation

### Code Validation

```typescript
import { validateCustomStrategyCode } from '$lib/custom-strategies';

const validation = validateCustomStrategyCode(code);

if (!validation.valid) {
  console.error(`Invalid code: ${validation.error}`);
}
```

Checks:
- Syntax errors (using Function constructor)
- Required structure (class, return statement)
- Does NOT check logic or semantics

### Strategy Validation

```typescript
const validation = manager.validate(strategy);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

Checks:
- Required fields (id, name, code)
- ID format (kebab-case)
- Code length (max 50KB)
- Dangerous patterns (localStorage, fetch, eval)

## Security Best Practices

### For Users

1. **Only run code you understand**
   - Review every line before executing
   - Don't import from untrusted sources

2. **Test with small datasets first**
   - Verify logic before full backtest
   - Check resource usage

3. **Keep strategies in version control**
   - Track changes over time
   - Easy rollback if needed

### For Developers

1. **Display security warnings**
   - Before enabling custom strategies
   - Before creating/importing strategies
   - Before executing strategies

2. **Implement additional security**
   - Content Security Policy headers
   - Rate limiting
   - User authentication
   - Monitoring and logging

3. **Consider alternatives**
   - Server-side execution
   - Configuration-based builder
   - Approved strategies only

See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.

## Troubleshooting

### "Strategy execution timeout"

**Cause:** Strategy took longer than 30 seconds

**Solutions:**
- Optimize indicator calculations
- Reduce dataset size
- Check for infinite loops

### "Strategy must implement X() method"

**Cause:** Missing required method (initialize, onBar, or finalize)

**Solution:** Add the missing method to your strategy class

### "Syntax error"

**Cause:** Invalid JavaScript syntax

**Solution:** Check for typos, missing braces, or semicolons

### "Cannot read property 'bars' of undefined"

**Cause:** Accessing data before initialize() is called

**Solution:** Ensure you're only accessing this.data in onBar() and finalize()

### "localStorage/fetch not available"

**Cause:** Attempting to use restricted APIs in Web Worker

**Solution:** Remove localStorage/fetch calls from strategy code

## Examples

### Simple MA Crossover

```javascript
class CustomStrategy {
  constructor(params) {
    this.shortPeriod = params.shortPeriod || 10;
    this.longPeriod = params.longPeriod || 30;
    this.position = 0;
  }

  initialize(data) {
    this.data = data;
    this.trades = [];
  }

  sma(period, endIndex) {
    if (endIndex < period - 1) return null;
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += this.data.bars[endIndex - i].close;
    }
    return sum / period;
  }

  onBar(index) {
    const shortMA = this.sma(this.shortPeriod, index);
    const longMA = this.sma(this.longPeriod, index);

    if (shortMA === null || longMA === null) return;

    const bar = this.data.bars[index];
    const prevShortMA = this.sma(this.shortPeriod, index - 1);
    const prevLongMA = this.sma(this.longPeriod, index - 1);

    // Crossover up: buy
    if (this.position === 0 && prevShortMA <= prevLongMA && shortMA > longMA) {
      this.position = 0.95;
      this.trades.push({ type: 'entry', time: bar.time, price: bar.close, size: this.position });
    }

    // Crossover down: sell
    if (this.position > 0 && prevShortMA >= prevLongMA && shortMA < longMA) {
      this.trades.push({ type: 'exit', time: bar.time, price: bar.close, size: this.position });
      this.position = 0;
    }
  }

  finalize() {
    if (this.position > 0) {
      const lastBar = this.data.bars[this.data.bars.length - 1];
      this.trades.push({ type: 'exit', time: lastBar.time, price: lastBar.close, size: this.position });
    }
    return this.trades;
  }
}

return CustomStrategy;
```

### Bollinger Bands

```javascript
class CustomStrategy {
  constructor(params) {
    this.period = params.period || 20;
    this.stdDev = params.stdDev || 2;
    this.position = 0;
  }

  initialize(data) {
    this.data = data;
    this.trades = [];
  }

  bollingerBands(period, stdDev, endIndex) {
    if (endIndex < period - 1) return null;

    // Calculate SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += this.data.bars[endIndex - i].close;
    }
    const sma = sum / period;

    // Calculate standard deviation
    let variance = 0;
    for (let i = 0; i < period; i++) {
      const diff = this.data.bars[endIndex - i].close - sma;
      variance += diff * diff;
    }
    const std = Math.sqrt(variance / period);

    return {
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std,
    };
  }

  onBar(index) {
    const bb = this.bollingerBands(this.period, this.stdDev, index);
    if (!bb) return;

    const bar = this.data.bars[index];

    // Buy when price touches lower band
    if (this.position === 0 && bar.close <= bb.lower) {
      this.position = 0.95;
      this.trades.push({ type: 'entry', time: bar.time, price: bar.close, size: this.position });
    }

    // Sell when price reaches middle band
    if (this.position > 0 && bar.close >= bb.middle) {
      this.trades.push({ type: 'exit', time: bar.time, price: bar.close, size: this.position });
      this.position = 0;
    }
  }

  finalize() {
    if (this.position > 0) {
      const lastBar = this.data.bars[this.data.bars.length - 1];
      this.trades.push({ type: 'exit', time: lastBar.time, price: lastBar.close, size: this.position });
    }
    return this.trades;
  }
}

return CustomStrategy;
```

## Future Enhancements

Potential improvements (not currently implemented):

- **TypeScript support** - Compile TypeScript to JavaScript
- **Indicator library** - Pre-built indicators (SMA, EMA, RSI, MACD)
- **Debugger integration** - Step through strategy execution
- **Performance profiling** - Identify slow code
- **Strategy marketplace** - Share strategies with community
- **Backtesting metrics** - Show Sharpe, drawdown, etc. directly
- **Visual strategy builder** - No-code drag-and-drop interface
- **Version history** - Track strategy changes over time
- **Collaboration** - Multiple users edit same strategy
- **Cloud sync** - Store strategies in cloud database

## API Reference

See inline documentation in:
- `types.ts` - Type definitions
- `manager.ts` - Strategy CRUD operations
- `executor.ts` - Strategy execution
- `templates.ts` - Template definitions

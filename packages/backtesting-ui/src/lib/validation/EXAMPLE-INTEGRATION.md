# Validation System Integration Example

This example shows how to integrate the hybrid validation system into a strategy configuration form.

## Complete Form Example

```svelte
<script lang="ts">
  import { Button, Input, Slider } from '@one-love-wealth/shared-ui';
  import { getStrategy } from '$lib/strategies';
  import {
    createValidationStore,
    createFieldValidation,
  } from '$lib/validation';
  import ValidationMessage from '$lib/components/validation/ValidationMessage.svelte';
  import ValidationSummary from '$lib/components/validation/ValidationSummary.svelte';

  // Get strategy
  const strategy = getStrategy('ma-crossover');

  // Initialize params with defaults
  let params = $state({ ...strategy.defaults });

  // Create validation store
  const validation = createValidationStore(strategy, () => params);

  // Field-level validation helpers
  const fastPeriodValidation = createFieldValidation(validation, 'fastPeriod');
  const slowPeriodValidation = createFieldValidation(validation, 'slowPeriod');
  const positionSizeValidation = createFieldValidation(validation, 'positionSize');

  // Trigger realtime validation on param changes
  $effect(() => {
    // Access params to track changes
    params;
    // Trigger debounced validation
    validation.validateRealtime();
  });

  // Handle form submission
  async function handleSubmit() {
    // Run submit validation (blocks if invalid)
    const isValid = validation.validateSubmit();

    if (!isValid) {
      console.log('Form has errors, cannot submit');
      return;
    }

    // Proceed with backtest
    console.log('Running backtest with params:', params);
    // ... run backtest logic
  }
</script>

<!-- Validation Summary (only shows if there are issues) -->
<ValidationSummary validation={validation.currentState} />

<!-- Form Fields -->
<div class="space-y-6">
  <!-- Fast Period Field -->
  <div>
    <label class="block text-sm font-medium mb-2">Fast Period</label>
    <Slider
      bind:value={params.fastPeriod}
      min={5}
      max={100}
      step={5}
      class={fastPeriodValidation.hasError ? 'border-red-500' : ''}
    />
    <ValidationMessage
      message={fastPeriodValidation.message}
      severity={fastPeriodValidation.severity}
    />
  </div>

  <!-- Slow Period Field -->
  <div>
    <label class="block text-sm font-medium mb-2">Slow Period</label>
    <Slider
      bind:value={params.slowPeriod}
      min={10}
      max={300}
      step={10}
      class={slowPeriodValidation.hasError ? 'border-red-500' : ''}
    />
    <ValidationMessage
      message={slowPeriodValidation.message}
      severity={slowPeriodValidation.severity}
    />
  </div>

  <!-- Position Size Field -->
  <div>
    <label class="block text-sm font-medium mb-2">Position Size</label>
    <Input
      type="number"
      bind:value={params.positionSize}
      min={0}
      max={1}
      step={0.01}
      error={positionSizeValidation.hasError}
    />
    <ValidationMessage
      message={positionSizeValidation.message}
      severity={positionSizeValidation.severity}
    />
  </div>
</div>

<!-- Submit Button -->
<Button
  onclick={handleSubmit}
  disabled={!validation.realtimeState.valid}
  variant="primary"
>
  {#snippet children()}
    Run Backtest
  {/snippet}
</Button>

<!-- Disable button if realtime validation shows errors -->
{#if !validation.realtimeState.valid}
  <p class="text-sm text-text-secondary mt-2">
    Please fix validation errors before running backtest
  </p>
{/if}
```

## How It Works

### 1. Realtime Validation (Warnings)

```svelte
// Trigger validation when params change
$effect(() => {
  params; // Track changes
  validation.validateRealtime(); // Debounced 300ms
});
```

**Result:**
- Shows **yellow warnings** as user types
- Debounced by 300ms to avoid rapid updates
- Non-blocking - user can continue editing
- Updates field-level validation messages

### 2. Submit Validation (Errors)

```typescript
async function handleSubmit() {
  const isValid = validation.validateSubmit();

  if (!isValid) {
    // Show red errors, block submission
    return;
  }

  // Proceed with backtest
}
```

**Result:**
- Shows **red errors** on submit attempt
- Blocking - prevents invalid execution
- Updates validation summary with all issues

### 3. Field-Level Feedback

```svelte
const fastPeriodValidation = createFieldValidation(validation, 'fastPeriod');

<Slider
  bind:value={params.fastPeriod}
  class={fastPeriodValidation.hasError ? 'border-red-500' : ''}
/>
<ValidationMessage
  message={fastPeriodValidation.message}
  severity={fastPeriodValidation.severity}
/>
```

**Result:**
- Individual field shows validation state
- Message updates in realtime
- Color changes based on severity

### 4. Form-Level Feedback

```svelte
<ValidationSummary validation={validation.currentState} />
```

**Result:**
- Shows all errors and warnings in one place
- Color-coded by severity
- Only visible when there are issues

## Validation Rules

The system automatically creates validation rules from strategy definitions:

### Field-Level Rules

```typescript
{
  key: 'fastPeriod',
  type: 'slider',
  min: 5,
  max: 100,
  step: 5,
}
```

**Generates:**
- Required check (if symbol field)
- Min value check: `value >= 5`
- Max value check: `value <= 100`
- Step check: `(value - min) % step === 0`

### Strategy-Level Rules

```typescript
{
  validation: (p) =>
    p.slowPeriod <= p.fastPeriod
      ? 'Slow period must be greater than fast period'
      : null,
}
```

**Generates:**
- Cross-field validation
- Custom logic defined in strategy
- Runs on both realtime and submit

## Validation Modes

| Mode | When | Severity | Blocking | Use Case |
|------|------|----------|----------|----------|
| **Realtime** | On param change (debounced 300ms) | Warning (yellow) | No | Guide user during configuration |
| **Submit** | On form submit | Error (red) | Yes | Prevent invalid execution |

## Advanced: Custom Validation

You can add custom validation rules beyond the strategy definition:

```typescript
const validation = createValidationStore(strategy, () => params);

// Add custom realtime validation
$effect(() => {
  if (params.fastPeriod > 50) {
    // Show custom warning
  }
});

// Add custom submit validation
function handleSubmit() {
  const isValid = validation.validateSubmit();

  // Additional custom checks
  if (params.positionSize > 0.9) {
    alert('Warning: Very high position size!');
  }

  if (!isValid) return;

  // Proceed
}
```

## Performance Notes

- Realtime validation is **debounced by 300ms** to avoid excessive re-renders
- Submit validation is **immediate** (no debounce)
- Validation state is **reactive** - updates automatically when params change
- Field-level helpers are **derived** - no manual updates needed

## Styling Integration

Validation messages use tailwind classes for consistent styling:

```typescript
const colors = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};
```

Border colors for inputs:

```svelte
<Input
  class={hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : ''}
/>
```

## Testing Validation

```typescript
import { describe, it, expect } from 'vitest';
import { validateParams } from '$lib/validation';
import { getStrategy } from '$lib/strategies';

describe('MA Crossover Validation', () => {
  const strategy = getStrategy('ma-crossover');

  it('should validate valid params', () => {
    const params = { fastPeriod: 50, slowPeriod: 200, positionSize: 0.95 };
    const result = validateParams(strategy, params, 'submit');

    expect(result.valid).toBe(true);
    expect(result.results).toHaveLength(0);
  });

  it('should reject when slow <= fast', () => {
    const params = { fastPeriod: 200, slowPeriod: 50, positionSize: 0.95 };
    const result = validateParams(strategy, params, 'submit');

    expect(result.valid).toBe(false);
    expect(result.results[0].message).toContain('Slow period must be greater');
  });

  it('should warn about out-of-range values in realtime', () => {
    const params = { fastPeriod: 500, slowPeriod: 600, positionSize: 0.95 };
    const result = validateParams(strategy, params, 'realtime');

    expect(result.valid).toBe(true); // Warnings don't invalidate
    expect(result.hasWarnings).toBe(true);
  });
});
```

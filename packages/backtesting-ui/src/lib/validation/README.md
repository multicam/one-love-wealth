# Validation System

Hybrid validation system with soft real-time warnings and hard submit-time errors.

## Design Philosophy

**Problem:** When should we validate strategy parameters?
- Too early (realtime) = annoying constant error messages
- Too late (submit) = wasted time configuring invalid params

**Solution:** Hybrid approach
- **Realtime validation** (300ms debounced) shows **yellow warnings** as user types
- **Submit validation** (immediate) shows **red errors** when user tries to execute
- Warnings guide the user, errors block execution

## Architecture

### 3-Layer System

```
┌─────────────────────────────────────────────┐
│  UI Components (Svelte)                     │
│  - ValidationMessage.svelte                 │
│  - ValidationSummary.svelte                 │
│  - Form fields with validation state        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Reactive Store (store.svelte.ts)           │
│  - createValidationStore()                  │
│  - createFieldValidation()                  │
│  - Svelte 5 runes ($state, $derived)        │
│  - Debounced realtime validation            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Validation Engine (engine.ts)              │
│  - validateParams()                         │
│  - Field constraint validation              │
│  - Strategy-level validation                │
│  - Pure functions, no framework deps        │
└─────────────────────────────────────────────┘
```

### Data Flow

```
User types in field
      ↓
$effect() detects change
      ↓
validateRealtime() (debounced 300ms)
      ↓
validateParams(strategy, params, 'realtime')
      ↓
Update realtimeState (warnings)
      ↓
Field shows yellow warning


User clicks "Run Backtest"
      ↓
handleSubmit()
      ↓
validateSubmit() (immediate)
      ↓
validateParams(strategy, params, 'submit')
      ↓
Update submitState (errors)
      ↓
If invalid: block, show red errors
If valid: proceed with backtest
```

## Core Concepts

### Validation Severity

| Severity | Color | Blocking | When |
|----------|-------|----------|------|
| **Warning** | Yellow | No | Realtime validation |
| **Error** | Red | Yes | Submit validation |
| **Info** | Blue | No | Informational hints |

### Validation Modes

**Realtime Mode** (`'realtime'`)
- Triggered on param changes (debounced 300ms)
- Returns warnings
- Non-blocking
- Helps user during configuration

**Submit Mode** (`'submit'`)
- Triggered on form submit
- Returns errors
- Blocking
- Prevents invalid execution

### Validation Rules

**Field-Level Rules**
```typescript
{
  key: 'fastPeriod',
  type: 'slider',
  min: 5,
  max: 100,
  step: 5,
}
```

Generates:
- Required check (symbol fields)
- Min/max range checks
- Step validation

**Strategy-Level Rules**
```typescript
{
  validation: (p) =>
    p.slowPeriod <= p.fastPeriod
      ? 'Slow period must be greater than fast period'
      : null,
}
```

Custom cross-field validation logic.

## API Reference

### `validateParams(strategy, params, mode)`

Core validation function.

```typescript
import { validateParams } from '$lib/validation';

const result = validateParams(strategy, params, 'submit');
// {
//   valid: false,
//   hasWarnings: true,
//   results: [
//     {
//       severity: 'error',
//       message: 'Slow period must be greater than fast period',
//       fields: [],
//       ruleId: 'ma-crossover:custom'
//     }
//   ],
//   byField: {},
//   timestamp: 1234567890
// }
```

### `createValidationStore(strategy, getParams)`

Create reactive validation store.

```typescript
import { createValidationStore } from '$lib/validation';

const validation = createValidationStore(strategy, () => params);

// Reactive states
validation.realtimeState; // Current realtime validation
validation.submitState;   // Current submit validation
validation.currentState;  // Combined (prioritizes submit)

// Actions
validation.validateRealtime();   // Trigger debounced validation
validation.validateSubmit();     // Trigger immediate validation
validation.validateImmediate();  // Trigger without debounce
validation.clear();              // Reset state
```

### `createFieldValidation(validationStore, fieldKey)`

Create field-level helper.

```typescript
const fastPeriodValidation = createFieldValidation(validation, 'fastPeriod');

fastPeriodValidation.hasError;   // boolean
fastPeriodValidation.hasWarning; // boolean
fastPeriodValidation.message;    // string | null
fastPeriodValidation.severity;   // 'error' | 'warning' | 'info' | null
```

### Components

**ValidationMessage**
```svelte
<ValidationMessage
  message={fastPeriodValidation.message}
  severity={fastPeriodValidation.severity}
  showIcon={true}
/>
```

**ValidationSummary**
```svelte
<ValidationSummary
  validation={validation.currentState}
  showWhenValid={false}
/>
```

## Integration Steps

1. **Create validation store**
   ```typescript
   const validation = createValidationStore(strategy, () => params);
   ```

2. **Trigger realtime validation**
   ```svelte
   $effect(() => {
     params;
     validation.validateRealtime();
   });
   ```

3. **Add field-level feedback**
   ```svelte
   const fieldValidation = createFieldValidation(validation, 'fieldKey');

   <Input class={fieldValidation.hasError ? 'border-red-500' : ''} />
   <ValidationMessage message={fieldValidation.message} severity={fieldValidation.severity} />
   ```

4. **Add form-level feedback**
   ```svelte
   <ValidationSummary validation={validation.currentState} />
   ```

5. **Validate on submit**
   ```typescript
   function handleSubmit() {
     if (!validation.validateSubmit()) return;
     // Proceed
   }
   ```

## Performance

- **Debouncing:** Realtime validation is debounced by 300ms to prevent excessive re-renders
- **Reactive:** Uses Svelte 5 runes for efficient reactivity
- **Pure functions:** Validation engine has no framework dependencies
- **Lazy evaluation:** Field helpers are derived, computed on access

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { validateParams } from '$lib/validation';

describe('Validation', () => {
  it('validates params', () => {
    const result = validateParams(strategy, params, 'submit');
    expect(result.valid).toBe(true);
  });
});
```

## Future Enhancements

- **Async validation:** Support for async validators (e.g., symbol existence check)
- **Custom rules API:** Allow adding custom validation rules outside strategy definition
- **Validation hints:** Suggestions for fixing errors (e.g., "Try setting slowPeriod to 100")
- **Field dependencies:** Track which fields affect which validations for smarter updates
- **Validation history:** Track validation state over time for analytics

## Examples

See `EXAMPLE-INTEGRATION.md` for complete integration example.

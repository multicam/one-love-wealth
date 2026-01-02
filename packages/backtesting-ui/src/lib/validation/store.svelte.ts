/**
 * Validation Store
 * Reactive validation state using Svelte 5 runes
 */

import type { StrategyDefinition } from '../strategies/types';
import type { ValidationState, ValidationMode } from './types';
import { validateParams, createEmptyValidationState } from './engine';

/**
 * Create validation store for a strategy
 *
 * @param strategy - Strategy definition
 * @param params - Reactive params object
 * @returns Validation state with auto-updating
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   let params = $state({ fastPeriod: 50, slowPeriod: 200 });
 *   const validation = createValidationStore(strategy, () => params);
 * </script>
 *
 * {#if !validation.realtimeState.valid}
 *   <Alert severity="warning">Please fix validation errors</Alert>
 * {/if}
 * ```
 */
export function createValidationStore(
  strategy: StrategyDefinition,
  getParams: () => Record<string, any>
) {
  // Reactive validation states
  let realtimeState = $state<ValidationState>(createEmptyValidationState());
  let submitState = $state<ValidationState>(createEmptyValidationState());

  // Debounce timer for realtime validation
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Run realtime validation (debounced)
   * Shows warnings as user types
   */
  function validateRealtime() {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce validation (300ms)
    debounceTimer = setTimeout(() => {
      const params = getParams();
      realtimeState = validateParams(strategy, params, 'realtime');
    }, 300);
  }

  /**
   * Run submit validation (immediate)
   * Shows errors when user tries to submit
   */
  function validateSubmit(): boolean {
    const params = getParams();
    submitState = validateParams(strategy, params, 'submit');
    return submitState.valid;
  }

  /**
   * Clear validation state
   */
  function clear() {
    realtimeState = createEmptyValidationState();
    submitState = createEmptyValidationState();
  }

  /**
   * Validate immediately (no debounce)
   * Useful for programmatic validation
   */
  function validateImmediate() {
    const params = getParams();
    realtimeState = validateParams(strategy, params, 'realtime');
  }

  return {
    // Reactive states
    get realtimeState() {
      return realtimeState;
    },
    get submitState() {
      return submitState;
    },

    // Combined state (shows submit errors if available, otherwise realtime warnings)
    get currentState() {
      return submitState.results.length > 0 ? submitState : realtimeState;
    },

    // Actions
    validateRealtime,
    validateSubmit,
    validateImmediate,
    clear,
  };
}

/**
 * Create field-level validation helper
 * Useful for individual form inputs
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const validation = createValidationStore(strategy, () => params);
 *   const fastPeriodValidation = createFieldValidation(validation, 'fastPeriod');
 * </script>
 *
 * <Input
 *   bind:value={params.fastPeriod}
 *   error={fastPeriodValidation.hasError}
 *   warning={fastPeriodValidation.hasWarning}
 *   message={fastPeriodValidation.message}
 * />
 * ```
 */
export function createFieldValidation(
  validationStore: ReturnType<typeof createValidationStore>,
  fieldKey: string
) {
  return {
    get hasError() {
      const state = validationStore.currentState;
      const results = state.byField[fieldKey] || [];
      return results.some((r) => r.severity === 'error');
    },

    get hasWarning() {
      const state = validationStore.currentState;
      const results = state.byField[fieldKey] || [];
      return results.some((r) => r.severity === 'warning');
    },

    get message() {
      const state = validationStore.currentState;
      const results = state.byField[fieldKey] || [];
      if (results.length === 0) return null;

      // Show first error, or first warning
      const error = results.find((r) => r.severity === 'error');
      if (error) return error.message;

      const warning = results.find((r) => r.severity === 'warning');
      if (warning) return warning.message;

      return results[0].message;
    },

    get severity() {
      const state = validationStore.currentState;
      const results = state.byField[fieldKey] || [];
      if (results.length === 0) return null;

      if (results.some((r) => r.severity === 'error')) return 'error';
      if (results.some((r) => r.severity === 'warning')) return 'warning';
      return 'info';
    },
  };
}

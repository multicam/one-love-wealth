/**
 * Validation Engine
 * Core validation logic for strategy parameters
 */

import type {
  ValidationResult,
  ValidationState,
  ValidationMode,
  ValidationRule,
  StrategyValidator,
} from './types';
import type { StrategyDefinition, StrategyField } from '../strategies/types';

/**
 * Create empty validation state
 */
export function createEmptyValidationState(): ValidationState {
  return {
    valid: true,
    hasWarnings: false,
    results: [],
    byField: {},
    timestamp: Date.now(),
  };
}

/**
 * Validate field-level constraints
 * Checks min/max/step for numeric fields
 */
function validateFieldConstraints(
  field: StrategyField,
  value: any,
  mode: ValidationMode
): ValidationResult | null {
  // Only validate if field has constraints
  if (!('min' in field) && !('max' in field)) {
    return null;
  }

  const numValue = Number(value);

  // Check if value is numeric
  if (isNaN(numValue)) {
    return {
      severity: mode === 'submit' ? 'error' : 'warning',
      message: `${field.label} must be a number`,
      fields: [field.key],
      ruleId: `${field.key}:numeric`,
    };
  }

  // Check min constraint
  if ('min' in field && field.min !== undefined && numValue < field.min) {
    return {
      severity: mode === 'submit' ? 'error' : 'warning',
      message: `${field.label} must be at least ${field.min}`,
      fields: [field.key],
      ruleId: `${field.key}:min`,
    };
  }

  // Check max constraint
  if ('max' in field && field.max !== undefined && numValue > field.max) {
    return {
      severity: mode === 'submit' ? 'error' : 'warning',
      message: `${field.label} must be at most ${field.max}`,
      fields: [field.key],
      ruleId: `${field.key}:max`,
    };
  }

  // Check step constraint (only on submit)
  if (
    mode === 'submit' &&
    'step' in field &&
    field.step !== undefined &&
    field.step > 0
  ) {
    const remainder = (numValue - (field.min ?? 0)) % field.step;
    if (Math.abs(remainder) > 0.0001) {
      return {
        severity: 'warning',
        message: `${field.label} should be a multiple of ${field.step}`,
        fields: [field.key],
        ruleId: `${field.key}:step`,
      };
    }
  }

  return null;
}

/**
 * Validate required fields
 */
function validateRequired(
  field: StrategyField,
  value: any,
  mode: ValidationMode
): ValidationResult | null {
  // Symbol fields are always required
  if (field.type === 'symbol' && (!value || value.trim() === '')) {
    return {
      severity: mode === 'submit' ? 'error' : 'warning',
      message: `${field.label} is required`,
      fields: [field.key],
      ruleId: `${field.key}:required`,
    };
  }

  return null;
}

/**
 * Build validation rules from strategy definition
 */
function buildValidationRules(strategy: StrategyDefinition): ValidationRule[] {
  const rules: ValidationRule[] = [];

  // Field-level rules
  for (const field of strategy.fields) {
    // Required validation (realtime)
    rules.push({
      id: `${field.key}:required`,
      fields: [field.key],
      validate: (params) => validateRequired(field, params[field.key], 'realtime'),
      mode: 'realtime',
    });

    // Constraint validation (both)
    if ('min' in field || 'max' in field) {
      rules.push({
        id: `${field.key}:constraints`,
        fields: [field.key],
        validate: (params) => validateFieldConstraints(field, params[field.key], 'realtime'),
        mode: 'both',
      });
    }
  }

  // Strategy-level validation (both)
  if (strategy.validation) {
    rules.push({
      id: `${strategy.id}:custom`,
      fields: [], // Applies to all fields
      validate: (params) => {
        const error = strategy.validation!(params);
        if (error) {
          return {
            severity: 'error',
            message: error,
            fields: [], // Cross-field validation
            ruleId: `${strategy.id}:custom`,
          };
        }
        return null;
      },
      mode: 'both',
    });
  }

  return rules;
}

/**
 * Validate strategy parameters
 *
 * @param strategy - Strategy definition
 * @param params - Current parameter values
 * @param mode - Validation mode (realtime = warnings, submit = errors)
 * @returns Validation state
 */
export function validateParams(
  strategy: StrategyDefinition,
  params: Record<string, any>,
  mode: ValidationMode = 'realtime'
): ValidationState {
  const rules = buildValidationRules(strategy);
  const results: ValidationResult[] = [];

  // Run all applicable rules
  for (const rule of rules) {
    // Skip rules that don't apply to this mode
    if (rule.mode !== 'both' && rule.mode !== mode) {
      continue;
    }

    const result = rule.validate(params);
    if (result) {
      // Adjust severity based on mode
      if (mode === 'submit' && result.severity === 'warning') {
        result.severity = 'error';
      }
      results.push(result);
    }
  }

  // Build field index
  const byField: Record<string, ValidationResult[]> = {};
  for (const result of results) {
    for (const field of result.fields) {
      if (!byField[field]) {
        byField[field] = [];
      }
      byField[field].push(result);
    }
  }

  // Determine overall state
  const hasErrors = results.some((r) => r.severity === 'error');
  const hasWarnings = results.some((r) => r.severity === 'warning');

  return {
    valid: !hasErrors,
    hasWarnings,
    results,
    byField,
    timestamp: Date.now(),
  };
}

/**
 * Get validation results for a specific field
 */
export function getFieldValidation(
  validationState: ValidationState,
  fieldKey: string
): ValidationResult[] {
  return validationState.byField[fieldKey] || [];
}

/**
 * Check if field has errors
 */
export function hasFieldError(validationState: ValidationState, fieldKey: string): boolean {
  const results = getFieldValidation(validationState, fieldKey);
  return results.some((r) => r.severity === 'error');
}

/**
 * Check if field has warnings
 */
export function hasFieldWarning(validationState: ValidationState, fieldKey: string): boolean {
  const results = getFieldValidation(validationState, fieldKey);
  return results.some((r) => r.severity === 'warning');
}

/**
 * Get validation message for field
 * Returns first error, or first warning if no errors
 */
export function getFieldMessage(
  validationState: ValidationState,
  fieldKey: string
): string | null {
  const results = getFieldValidation(validationState, fieldKey);
  if (results.length === 0) return null;

  const error = results.find((r) => r.severity === 'error');
  if (error) return error.message;

  const warning = results.find((r) => r.severity === 'warning');
  if (warning) return warning.message;

  return results[0].message;
}

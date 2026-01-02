/**
 * Validation Types
 * Types for parameter validation system
 */

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation result for a single field or cross-field constraint
 */
export interface ValidationResult {
  /** Validation severity */
  severity: ValidationSeverity;
  /** Human-readable message */
  message: string;
  /** Field key(s) this validation applies to */
  fields: string[];
  /** Validation rule identifier (for tracking) */
  ruleId?: string;
}

/**
 * Full validation state for a strategy configuration
 */
export interface ValidationState {
  /** Is configuration valid? (no errors) */
  valid: boolean;
  /** Has warnings? (non-blocking) */
  hasWarnings: boolean;
  /** All validation results */
  results: ValidationResult[];
  /** Results indexed by field key */
  byField: Record<string, ValidationResult[]>;
  /** Last validation timestamp */
  timestamp: number;
}

/**
 * Validation mode
 */
export type ValidationMode = 'realtime' | 'submit';

/**
 * Field-level validator function
 */
export type FieldValidator = (
  value: any,
  allParams: Record<string, any>
) => ValidationResult | null;

/**
 * Strategy-level validator function
 * Returns error message if invalid, null if valid
 */
export type StrategyValidator = (params: Record<string, any>) => string | null;

/**
 * Validation rule definition
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Fields this rule applies to */
  fields: string[];
  /** Validator function */
  validate: (params: Record<string, any>) => ValidationResult | null;
  /** When to run this rule */
  mode: ValidationMode | 'both';
}

/**
 * Strategy Registry Types
 * Type definitions for dynamic strategy forms with multi-symbol support
 */

import type { Strategy } from '@one-love-wealth/backtesting';

/**
 * Field types supported by the dynamic form
 */
export type FieldType = 'symbol' | 'slider' | 'percent' | 'radio' | 'toggle' | 'number' | 'select';

/**
 * Base field configuration
 */
interface BaseField {
  /** Parameter key (must match strategy params) */
  key: string;
  /** Display label */
  label: string;
  /** Help text tooltip */
  help?: string;
  /** Default value (pre-filled) */
  default?: any;
  /** Show in main form (false = advanced settings) */
  showByDefault?: boolean;
}

/**
 * Symbol search field
 */
export interface SymbolField extends BaseField {
  type: 'symbol';
  /** Default symbol (pre-filled, user can change) */
  default?: string;
}

/**
 * Slider field (numeric range)
 */
export interface SliderField extends BaseField {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  default?: number;
}

/**
 * Percent field (0-1 as percentage)
 */
export interface PercentField extends BaseField {
  type: 'percent';
  min?: number; // Default: 0
  max?: number; // Default: 1
  step?: number; // Default: 0.01
  default?: number;
}

/**
 * Radio button field (enum selection)
 */
export interface RadioField extends BaseField {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
  default?: string;
}

/**
 * Toggle field (boolean)
 */
export interface ToggleField extends BaseField {
  type: 'toggle';
  default?: boolean;
}

/**
 * Number input field
 */
export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

/**
 * Select dropdown field
 */
export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ value: string; label: string; description?: string }>;
  default?: string;
}

/**
 * Union of all field types
 */
export type StrategyField =
  | SymbolField
  | SliderField
  | PercentField
  | RadioField
  | ToggleField
  | NumberField
  | SelectField;

/**
 * Strategy validation function
 * Returns error message if invalid, null if valid
 */
export type StrategyValidation<TParams = any> = (params: TParams) => string | null;

/**
 * Recommended preset metadata
 */
export interface PresetInfo {
  /** Preset name (always "Recommended") */
  name: string;
  /** Why these parameters are recommended */
  rationale: string;
  /** What this configuration optimizes for */
  optimizedFor: string[];
  /** Backtested period (e.g., "2015-2024") */
  backtestedPeriod?: string;
  /** Expected performance characteristics */
  expectedMetrics?: {
    /** Approximate Sharpe ratio */
    sharpe?: string;
    /** Approximate max drawdown */
    maxDrawdown?: string;
    /** Approximate win rate */
    winRate?: string;
    /** Approximate annual return */
    annualReturn?: string;
  };
  /** Suitable for these scenarios */
  suitableFor?: string[];
}

/**
 * Strategy registry entry
 */
export interface StrategyDefinition<TParams = any> {
  /** Strategy identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Strategy category */
  category: 'trend' | 'momentum' | 'mean-reversion' | 'volatility' | 'multi-symbol';
  /** Factory function to create strategy instance */
  create: (params: TParams) => Strategy;
  /** Default parameter values (recommended preset) */
  defaults: TParams;
  /** Field definitions for dynamic form */
  fields: StrategyField[];
  /** Optional validation function */
  validation?: StrategyValidation<TParams>;
  /** Recommended date range in years */
  recommendedYears?: number;
  /** Tags for filtering/search */
  tags?: string[];
  /** Preset information (explains why defaults are recommended) */
  preset?: PresetInfo;
}

/**
 * Strategy registry (all strategies keyed by ID)
 */
export type StrategyRegistry = Record<string, StrategyDefinition>;

/**
 * Helper: Get all symbol fields from a strategy
 */
export function getSymbolFields(strategy: StrategyDefinition): SymbolField[] {
  return strategy.fields.filter((f): f is SymbolField => f.type === 'symbol');
}

/**
 * Helper: Get visible symbol fields (showByDefault !== false)
 */
export function getVisibleSymbolFields(strategy: StrategyDefinition): SymbolField[] {
  return getSymbolFields(strategy).filter((f) => f.showByDefault !== false);
}

/**
 * Helper: Get advanced symbol fields (showByDefault === false)
 */
export function getAdvancedSymbolFields(strategy: StrategyDefinition): SymbolField[] {
  return getSymbolFields(strategy).filter((f) => f.showByDefault === false);
}

/**
 * Helper: Get all symbols required by a strategy from params
 */
export function getRequiredSymbols(
  strategy: StrategyDefinition,
  params: Record<string, any>
): string[] {
  const symbolFields = getSymbolFields(strategy);
  return symbolFields.map((field) => params[field.key]).filter(Boolean);
}

/**
 * Helper: Check if strategy is multi-symbol
 */
export function isMultiSymbolStrategy(strategy: StrategyDefinition): boolean {
  return getSymbolFields(strategy).length > 1;
}

/**
 * Helper: Validate strategy parameters
 */
export function validateStrategyParams(
  strategy: StrategyDefinition,
  params: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required symbol fields
  const symbolFields = getSymbolFields(strategy);
  for (const field of symbolFields) {
    if (!params[field.key]) {
      errors.push(`${field.label} is required`);
    }
  }

  // Check required non-symbol fields
  for (const field of strategy.fields) {
    if (field.type !== 'symbol' && params[field.key] === undefined) {
      // Use default if available
      if (field.default !== undefined) {
        params[field.key] = field.default;
      } else {
        errors.push(`${field.label} is required`);
      }
    }
  }

  // Run custom validation
  if (strategy.validation) {
    const validationError = strategy.validation(params);
    if (validationError) {
      errors.push(validationError);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Helper: Get recommended preset parameters
 * Returns a copy of the default parameters
 */
export function getRecommendedParams<TParams = any>(
  strategy: StrategyDefinition<TParams>
): TParams {
  return { ...strategy.defaults };
}

/**
 * Helper: Reset parameters to recommended preset
 * Mutates the params object
 */
export function resetToRecommended<TParams = any>(
  strategy: StrategyDefinition<TParams>,
  params: Record<string, any>
): void {
  const recommended = getRecommendedParams(strategy);

  // Clear existing params
  for (const key in params) {
    delete params[key];
  }

  // Copy recommended params
  Object.assign(params, recommended);
}

/**
 * Helper: Check if params match recommended preset
 */
export function isUsingRecommended(
  strategy: StrategyDefinition,
  params: Record<string, any>
): boolean {
  const recommended = getRecommendedParams(strategy);

  for (const key in recommended) {
    if (params[key] !== recommended[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Helper: Get preset information
 * Returns preset metadata if available
 */
export function getPresetInfo(strategy: StrategyDefinition): PresetInfo | null {
  return strategy.preset || null;
}

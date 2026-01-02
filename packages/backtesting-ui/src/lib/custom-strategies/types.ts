/**
 * Custom Strategy Types
 * Types for user-defined custom strategies
 */

import type { Strategy } from '@one-love-wealth/backtesting';
import type { StrategyField } from '../strategies/types';

/**
 * Custom strategy definition (user code)
 */
export interface CustomStrategyDefinition {
  /** Unique ID (user-provided or generated) */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Strategy category */
  category: 'trend' | 'momentum' | 'mean-reversion' | 'volatility' | 'multi-symbol' | 'custom';
  /** TypeScript/JavaScript code */
  code: string;
  /** Parameter field definitions */
  fields: StrategyField[];
  /** Default parameter values */
  defaults: Record<string, any>;
  /** Created timestamp */
  createdAt: number;
  /** Last modified timestamp */
  modifiedAt: number;
  /** Optional tags */
  tags?: string[];
}

/**
 * Custom strategy validation result
 */
export interface CustomStrategyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Custom strategy execution context
 * Passed to strategy code in Web Worker
 */
export interface StrategyExecutionContext {
  /** Strategy code to execute */
  code: string;
  /** Strategy parameters */
  params: Record<string, any>;
  /** Backtest data (bars) */
  data: any; // BacktestData, but avoiding circular import
  /** Execution timeout (ms) */
  timeout?: number;
}

/**
 * Custom strategy execution result
 */
export interface StrategyExecutionResult {
  success: boolean;
  trades?: any[]; // Trade[], but avoiding circular import
  error?: string;
  executionTime?: number;
}

/**
 * Custom strategy template
 * Starter code for new custom strategies
 */
export interface CustomStrategyTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  fields: StrategyField[];
  defaults: Record<string, any>;
}

/**
 * Storage format for custom strategies
 */
export interface CustomStrategyStorage {
  version: number;
  strategies: CustomStrategyDefinition[];
}

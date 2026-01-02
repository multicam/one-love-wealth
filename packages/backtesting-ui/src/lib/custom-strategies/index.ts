/**
 * Custom Strategies Module
 * User-defined custom strategy support
 */

// Types
export type {
  CustomStrategyDefinition,
  CustomStrategyValidation,
  StrategyExecutionContext,
  StrategyExecutionResult,
  CustomStrategyTemplate,
  CustomStrategyStorage,
} from './types';

// Manager
export { CustomStrategyManager, getCustomStrategyManager } from './manager';

// Templates
export { TEMPLATES, getTemplate, getTemplateIds, SIMPLE_MA_TEMPLATE, RSI_TEMPLATE, EMPTY_TEMPLATE } from './templates';

// Executor
export { executeCustomStrategy, validateCustomStrategyCode } from './executor';

/**
 * Custom Strategy Executor
 * Wrapper for executing custom strategies in Web Worker
 */

import type { BacktestData } from '@one-love-wealth/backtesting';
import type {
  CustomStrategyDefinition,
  StrategyExecutionContext,
  StrategyExecutionResult,
} from './types';
// @ts-ignore - Vite handles worker imports
import ExecutorWorker from './executor.worker.ts?worker';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Execute custom strategy
 *
 * @param strategy - Custom strategy definition
 * @param params - Strategy parameters
 * @param data - Backtest data
 * @param timeout - Execution timeout in ms
 * @returns Promise resolving to execution result
 */
export async function executeCustomStrategy(
  strategy: CustomStrategyDefinition,
  params: Record<string, any>,
  data: BacktestData,
  timeout: number = DEFAULT_TIMEOUT
): Promise<StrategyExecutionResult> {
  return new Promise((resolve, reject) => {
    // Create worker
    const worker = new ExecutorWorker();

    // Set timeout
    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('Strategy execution timeout'));
    }, timeout);

    // Handle worker messages
    worker.onmessage = (event: MessageEvent<StrategyExecutionResult>) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(event.data);
    };

    // Handle worker errors
    worker.onerror = (error) => {
      clearTimeout(timeoutId);
      worker.terminate();
      reject(error);
    };

    // Send execution context to worker
    const context: StrategyExecutionContext = {
      code: strategy.code,
      params,
      data,
      timeout,
    };

    worker.postMessage(context);
  });
}

/**
 * Validate custom strategy code
 * Attempts to parse and check for basic errors
 */
export function validateCustomStrategyCode(code: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Try to create function (basic syntax check)
    new Function(code);

    // Check for required structure
    if (!code.includes('class')) {
      return {
        valid: false,
        error: 'Code must define a class',
      };
    }

    if (!code.includes('return')) {
      return {
        valid: false,
        error: 'Code must return the strategy class',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Syntax error',
    };
  }
}

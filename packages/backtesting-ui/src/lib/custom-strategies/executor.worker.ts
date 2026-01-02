/**
 * Custom Strategy Executor Worker
 * Executes custom strategy code in a sandboxed Web Worker
 *
 * SECURITY: This worker runs in an isolated context with no DOM access.
 * However, it can still execute arbitrary JavaScript, so use with caution.
 */

import type { StrategyExecutionContext, StrategyExecutionResult } from './types';

/**
 * Execute custom strategy code
 */
function executeStrategy(context: StrategyExecutionContext): StrategyExecutionResult {
  const startTime = Date.now();

  try {
    // Create isolated function scope
    // Note: This uses Function constructor which can be dangerous
    // In a production app, consider using a proper sandboxing solution
    const StrategyClass = new Function(context.code)();

    // Instantiate strategy
    const strategy = new StrategyClass(context.params);

    // Check required methods
    if (typeof strategy.initialize !== 'function') {
      throw new Error('Strategy must implement initialize() method');
    }

    if (typeof strategy.onBar !== 'function') {
      throw new Error('Strategy must implement onBar() method');
    }

    if (typeof strategy.finalize !== 'function') {
      throw new Error('Strategy must implement finalize() method');
    }

    // Run strategy
    strategy.initialize(context.data);

    for (let i = 0; i < context.data.bars.length; i++) {
      // Check timeout
      if (context.timeout && Date.now() - startTime > context.timeout) {
        throw new Error('Strategy execution timeout');
      }

      strategy.onBar(i);
    }

    const trades = strategy.finalize();

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      trades,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Worker message handler
 */
self.onmessage = (event: MessageEvent<StrategyExecutionContext>) => {
  const result = executeStrategy(event.data);
  self.postMessage(result);
};

// Export for TypeScript
export {};

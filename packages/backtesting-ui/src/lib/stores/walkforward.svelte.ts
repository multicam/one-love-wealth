/**
 * Walk-Forward Analysis Store
 *
 * Manages state for walk-forward analysis including:
 * - Window configuration (in-sample %, out-sample %, step size)
 * - Anchored vs Rolling mode
 * - Analysis execution state
 * - Results and history
 */

export interface WalkForwardConfig {
  inSamplePercent: number; // 60 = 60%
  outSamplePercent: number; // 40 = 40%
  stepSizePercent: number; // 20 = 20%
  anchored: boolean; // true = anchored, false = rolling
}

export interface WindowMetrics {
  sharpe: number;
  sortino: number;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  cagr: number;
}

export interface WalkForwardWindow {
  windowNumber: number;
  inSampleStart: string; // ISO date
  inSampleEnd: string;
  outSampleStart: string;
  outSampleEnd: string;
  bestParams: Record<string, number>; // Optimized on in-sample
  inSampleMetrics: WindowMetrics;
  outSampleMetrics: WindowMetrics;
  degradationPercent: number; // (in-sample - out-sample) / in-sample * 100
}

export interface WalkForwardOutput {
  config: WalkForwardConfig;
  strategyId: string;
  strategyName: string;
  windows: WalkForwardWindow[];
  aggregateInSample: WindowMetrics;
  aggregateOutSample: WindowMetrics;
  averageDegradation: number;
  passFailStatus: 'pass' | 'fail'; // pass if degradation < 20%
  equityCurveStitched: Array<{ date: string; value: number }>; // Out-of-sample only
}

interface CompressedWalkForward {
  id: string;
  timestamp: number;
  strategyId: string;
  strategyName: string;
  windowCount: number;
  averageDegradation: number;
  passFailStatus: 'pass' | 'fail';
  aggregateOutSample: WindowMetrics;
}

class WalkForwardState {
  // Configuration
  config = $state<WalkForwardConfig>({
    inSamplePercent: 60,
    outSamplePercent: 40,
    stepSizePercent: 20,
    anchored: false,
  });

  // Execution state
  isRunning = $state(false);
  currentWindow = $state(0);
  totalWindows = $state(0);

  // Results
  result = $state<WalkForwardOutput | null>(null);
  error = $state<string | null>(null);

  // History (persisted to localStorage)
  history = $state<CompressedWalkForward[]>([]);

  // Computed
  hasResult = $derived(this.result !== null);
  progress = $derived(() => {
    if (this.totalWindows === 0) return 0;
    return (this.currentWindow / this.totalWindows) * 100;
  });

  constructor() {
    this.loadHistory();
  }

  // Configuration methods
  updateConfig(updates: Partial<WalkForwardConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  resetConfig(): void {
    this.config = {
      inSamplePercent: 60,
      outSamplePercent: 40,
      stepSizePercent: 20,
      anchored: false,
    };
  }

  // Execution methods
  startAnalysis(totalWindows: number): void {
    this.isRunning = true;
    this.currentWindow = 0;
    this.totalWindows = totalWindows;
    this.error = null;
  }

  updateProgress(windowNumber: number): void {
    this.currentWindow = windowNumber;
  }

  setResult(newResult: WalkForwardOutput, strategyId?: string, strategyName?: string): void {
    this.isRunning = false;
    this.result = newResult;
    this.currentWindow = 0;
    this.totalWindows = 0;

    if (strategyId && strategyName) {
      this.addToHistory(newResult, strategyId, strategyName);
    }
  }

  setError(errorMessage: string): void {
    this.isRunning = false;
    this.error = errorMessage;
    this.currentWindow = 0;
    this.totalWindows = 0;
  }

  stopAnalysis(): void {
    this.isRunning = false;
    this.currentWindow = 0;
    this.totalWindows = 0;
  }

  clearResult(): void {
    this.result = null;
    this.error = null;
    this.currentWindow = 0;
    this.totalWindows = 0;
  }

  // History methods
  private addToHistory(result: WalkForwardOutput, strategyId: string, strategyName: string): void {
    const compressed: CompressedWalkForward = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      strategyId,
      strategyName,
      windowCount: result.windows.length,
      averageDegradation: result.averageDegradation,
      passFailStatus: result.passFailStatus,
      aggregateOutSample: result.aggregateOutSample,
    };

    this.history = [compressed, ...this.history.slice(0, 9)]; // Keep last 10
    this.saveHistory();
  }

  loadHistoryItem(id: string): void {
    // TODO: Implement full result loading from localStorage
    // For now, this is a placeholder
    console.log(`Loading walk-forward history item: ${id}`);
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  private saveHistory(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('walkforward-history', JSON.stringify(this.history));
    }
  }

  private loadHistory(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('walkforward-history');
      if (stored) {
        try {
          this.history = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to load walk-forward history:', e);
          this.history = [];
        }
      }
    }
  }
}

export const walkforward = new WalkForwardState();

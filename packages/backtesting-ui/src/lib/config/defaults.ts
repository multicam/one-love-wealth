/**
 * Backtesting UI Default Configuration
 *
 * This file contains all default values for the backtesting UI.
 * Users can override these via UI settings which persist to localStorage.
 */

/**
 * Date Range Configuration
 */
export const DEFAULT_DATE_RANGE = {
  /** Default lookback period in years */
  years: 5,

  /** End date (null = today) */
  endDate: null as Date | null,

  /**
   * Start date calculation
   * If null, calculated as (endDate - years)
   */
  startDate: null as Date | null,
} as const;

/**
 * Date range presets for quick selection
 */
export const DATE_RANGE_PRESETS = {
  '1y': { years: 1, label: '1 Year' },
  '3y': { years: 3, label: '3 Years' },
  '5y': { years: 5, label: '5 Years' },  // Default
  '10y': { years: 10, label: '10 Years' },
  '20y': { years: 20, label: '20 Years' },
  'max': { years: 50, label: 'Max Available' }, // Will be clamped to available data
} as const;

export type DateRangePreset = keyof typeof DATE_RANGE_PRESETS;

/**
 * Backtest Engine Configuration
 */
export const DEFAULT_BACKTEST_CONFIG = {
  /** Initial capital in USD */
  initialCapital: 100_000,

  /** Fixed commission per trade (USD) */
  commission: 0,

  /** Commission as percentage of trade value (0.001 = 0.1%) */
  commissionPercent: 0,

  /** Slippage as percentage (0.001 = 0.1%) */
  slippage: 0.001,

  /** Maximum position size as percentage of portfolio (1 = 100%) */
  maxPositionSize: 1,

  /** Allow short selling */
  allowShort: false,

  /** Margin requirement for short positions */
  marginRequirement: 1.5,
} as const;

/**
 * Default Strategy Configuration
 */
export const DEFAULT_STRATEGY_CONFIG = {
  /** Default strategy to select */
  defaultStrategy: 'ma-crossover' as const,

  /** Default symbol to backtest */
  defaultSymbol: 'SPY',

  /** Show advanced parameters by default */
  showAdvancedParams: false,
} as const;

/**
 * Optimization Configuration
 */
export const DEFAULT_OPTIMIZATION_CONFIG = {
  /** Default optimization method */
  method: 'grid' as const,

  /** Default optimization objective */
  objective: 'sharpeRatio' as const,

  /** Maximum iterations for random/genetic methods */
  maxIterations: 1000,

  /** Top N results to display */
  topN: 20,

  /** Genetic algorithm population size */
  populationSize: 50,

  /** Genetic algorithm mutation rate */
  mutationRate: 0.1,
} as const;

/**
 * Validation Configuration
 */
export const DEFAULT_VALIDATION_CONFIG = {
  /** Train/test split ratio (0.7 = 70% train, 30% test) */
  trainTestSplit: 0.7,

  /** Number of cross-validation folds */
  numFolds: 5,

  /** Enable walk-forward analysis */
  enableWalkForward: true,

  /** Number of walk-forward windows */
  numWindows: 5,

  /** In-sample ratio for walk-forward (0.7 = 70% in-sample) */
  inSampleRatio: 0.7,

  /** Enable Monte Carlo simulation */
  enableMonteCarlo: true,

  /** Number of Monte Carlo simulations */
  numSimulations: 1000,

  /** Monte Carlo confidence level */
  confidenceLevel: 0.95,

  /** Enable benchmark comparison */
  enableBenchmarks: true,

  /** Default benchmarks to compare against */
  defaultBenchmarks: ['SPY', '^GSPC'] as const,
} as const;

/**
 * UI Preferences
 */
export const DEFAULT_UI_CONFIG = {
  /** Show equity curve by default */
  showEquityCurve: true,

  /** Show drawdown on equity curve */
  showDrawdown: true,

  /** Show trade markers on charts */
  showTradeMarkers: true,

  /** Default metrics to display (6 core metrics) */
  visibleMetrics: [
    'totalReturnPercent',
    'sharpeRatio',
    'maxDrawdownPercent',
    'cagr',
    'winRate',
    'profitFactor',
  ] as const,

  /** Theme */
  theme: 'dark' as const,

  /** Results panel position */
  resultsPosition: 'center' as const,

  /** Settings panel position */
  settingsPosition: 'right' as const,
} as const;

/**
 * Performance Settings
 */
export const PERFORMANCE_CONFIG = {
  /** Use web worker for optimization */
  useWorkerForOptimization: true,

  /** Use web worker for Monte Carlo */
  useWorkerForMonteCarlo: true,

  /** Use web worker for walk-forward */
  useWorkerForWalkForward: true,

  /** Show progress updates during long operations */
  showProgress: true,

  /** Debounce parameter changes (ms) */
  parameterChangeDebounce: 500,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** Enable in-memory cache (always recommended) */
  enableMemoryCache: true,

  /** Enable localStorage cache (opt-in for persistence) */
  enableStorageCache: false,

  /** TTL for daily data (24 hours) */
  dailyTTL: 24 * 60 * 60 * 1000,

  /** TTL for weekly data (7 days) */
  weeklyTTL: 7 * 24 * 60 * 60 * 1000,

  /** TTL for monthly data (30 days) */
  monthlyTTL: 30 * 24 * 60 * 60 * 1000,

  /** Max memory cache entries */
  maxMemoryEntries: 50,

  /** Max storage cache size (5MB) */
  maxStorageBytes: 5 * 1024 * 1024,

  /** Auto-evict when storage limit reached */
  autoEvict: true,
} as const;

/**
 * Data Loading Configuration
 */
export const DATA_CONFIG = {
  /** Default data interval */
  interval: '1d' as const,

  /** Default data provider */
  provider: 'yahoo' as const,

  /** Gap fill strategy */
  gapFillStrategy: 'forward-fill' as const,

  /** Cache data in localStorage */
  cacheData: true,

  /** Cache TTL in milliseconds (24 hours) */
  cacheTTL: 24 * 60 * 60 * 1000,
} as const;

/**
 * Export Defaults
 */
export const STORAGE_KEY = 'backtesting-ui-config';

/**
 * Complete default configuration
 */
export const DEFAULT_CONFIG = {
  dateRange: DEFAULT_DATE_RANGE,
  backtest: DEFAULT_BACKTEST_CONFIG,
  strategy: DEFAULT_STRATEGY_CONFIG,
  optimization: DEFAULT_OPTIMIZATION_CONFIG,
  validation: DEFAULT_VALIDATION_CONFIG,
  ui: DEFAULT_UI_CONFIG,
  performance: PERFORMANCE_CONFIG,
  cache: CACHE_CONFIG,
  data: DATA_CONFIG,
} as const;

/**
 * Type for user configuration (all fields optional for overrides)
 */
export type UserConfig = Partial<{
  dateRange: Partial<typeof DEFAULT_DATE_RANGE>;
  backtest: Partial<typeof DEFAULT_BACKTEST_CONFIG>;
  strategy: Partial<typeof DEFAULT_STRATEGY_CONFIG>;
  optimization: Partial<typeof DEFAULT_OPTIMIZATION_CONFIG>;
  validation: Partial<typeof DEFAULT_VALIDATION_CONFIG>;
  ui: Partial<typeof DEFAULT_UI_CONFIG>;
  performance: Partial<typeof PERFORMANCE_CONFIG>;
  cache: Partial<typeof CACHE_CONFIG>;
  data: Partial<typeof DATA_CONFIG>;
}>;

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig: UserConfig = {}): typeof DEFAULT_CONFIG {
  return {
    dateRange: { ...DEFAULT_DATE_RANGE, ...userConfig.dateRange },
    backtest: { ...DEFAULT_BACKTEST_CONFIG, ...userConfig.backtest },
    strategy: { ...DEFAULT_STRATEGY_CONFIG, ...userConfig.strategy },
    optimization: { ...DEFAULT_OPTIMIZATION_CONFIG, ...userConfig.optimization },
    validation: { ...DEFAULT_VALIDATION_CONFIG, ...userConfig.validation },
    ui: { ...DEFAULT_UI_CONFIG, ...userConfig.ui },
    performance: { ...PERFORMANCE_CONFIG, ...userConfig.performance },
    cache: { ...CACHE_CONFIG, ...userConfig.cache },
    data: { ...DATA_CONFIG, ...userConfig.data },
  };
}

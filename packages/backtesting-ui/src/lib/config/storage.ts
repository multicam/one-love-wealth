/**
 * Configuration Storage
 * Handles loading and saving user configuration to localStorage
 */

import { browser } from '$app/environment';
import { DEFAULT_CONFIG, STORAGE_KEY, mergeConfig, type UserConfig } from './defaults';

/**
 * Load user configuration from localStorage
 *
 * @returns Merged configuration (user overrides + defaults)
 */
export function loadConfig(): typeof DEFAULT_CONFIG {
  if (!browser) {
    return DEFAULT_CONFIG;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_CONFIG;
    }

    const userConfig = JSON.parse(stored) as UserConfig;
    return mergeConfig(userConfig);
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save user configuration to localStorage
 * Only saves overrides, not the entire config
 *
 * @param config - Full configuration object
 */
export function saveConfig(config: typeof DEFAULT_CONFIG): void {
  if (!browser) {
    return;
  }

  try {
    // Extract only values that differ from defaults
    const userConfig: UserConfig = {};

    // Date range overrides
    if (
      config.dateRange.years !== DEFAULT_CONFIG.dateRange.years ||
      config.dateRange.startDate !== DEFAULT_CONFIG.dateRange.startDate ||
      config.dateRange.endDate !== DEFAULT_CONFIG.dateRange.endDate
    ) {
      userConfig.dateRange = {
        years: config.dateRange.years,
        startDate: config.dateRange.startDate,
        endDate: config.dateRange.endDate,
      };
    }

    // Backtest config overrides
    const backtestOverrides: Record<string, unknown> = {};
    for (const key in config.backtest) {
      const k = key as keyof typeof config.backtest;
      if (config.backtest[k] !== DEFAULT_CONFIG.backtest[k]) {
        backtestOverrides[k] = config.backtest[k] as any;
      }
    }
    if (Object.keys(backtestOverrides).length > 0) {
      userConfig.backtest = backtestOverrides;
    }

    // Strategy overrides
    const strategyOverrides: Record<string, unknown> = {};
    for (const key in config.strategy) {
      const k = key as keyof typeof config.strategy;
      if (config.strategy[k] !== DEFAULT_CONFIG.strategy[k]) {
        strategyOverrides[k] = config.strategy[k] as any;
      }
    }
    if (Object.keys(strategyOverrides).length > 0) {
      userConfig.strategy = strategyOverrides;
    }

    // Optimization overrides
    const optimizationOverrides: Record<string, unknown> = {};
    for (const key in config.optimization) {
      const k = key as keyof typeof config.optimization;
      if (config.optimization[k] !== DEFAULT_CONFIG.optimization[k]) {
        optimizationOverrides[k] = config.optimization[k] as any;
      }
    }
    if (Object.keys(optimizationOverrides).length > 0) {
      userConfig.optimization = optimizationOverrides;
    }

    // Validation overrides
    const validationOverrides: Record<string, unknown> = {};
    for (const key in config.validation) {
      const k = key as keyof typeof config.validation;
      if (config.validation[k] !== DEFAULT_CONFIG.validation[k]) {
        validationOverrides[k] = config.validation[k] as any;
      }
    }
    if (Object.keys(validationOverrides).length > 0) {
      userConfig.validation = validationOverrides;
    }

    // UI overrides
    const uiOverrides: Record<string, unknown> = {};
    for (const key in config.ui) {
      const k = key as keyof typeof config.ui;
      if (JSON.stringify(config.ui[k]) !== JSON.stringify(DEFAULT_CONFIG.ui[k])) {
        uiOverrides[k] = config.ui[k] as any;
      }
    }
    if (Object.keys(uiOverrides).length > 0) {
      userConfig.ui = uiOverrides;
    }

    // Data overrides
    const dataOverrides: Record<string, unknown> = {};
    for (const key in config.data) {
      const k = key as keyof typeof config.data;
      if (config.data[k] !== DEFAULT_CONFIG.data[k]) {
        dataOverrides[k] = config.data[k] as any;
      }
    }
    if (Object.keys(dataOverrides).length > 0) {
      userConfig.data = dataOverrides;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userConfig));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
}

/**
 * Reset configuration to defaults
 * Clears localStorage
 */
export function resetConfig(): void {
  if (!browser) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset config:', error);
  }
}

/**
 * Update a specific config section
 *
 * @param section - Config section to update
 * @param updates - Partial updates for that section
 */
export function updateConfigSection<K extends keyof typeof DEFAULT_CONFIG>(
  section: K,
  updates: Partial<(typeof DEFAULT_CONFIG)[K]>
): void {
  const config = loadConfig();
  const updated = {
    ...config,
    [section]: { ...config[section], ...updates },
  };
  saveConfig(updated);
}

/**
 * Get a specific config section
 *
 * @param section - Config section name
 * @returns Config section
 */
export function getConfigSection<K extends keyof typeof DEFAULT_CONFIG>(
  section: K
): (typeof DEFAULT_CONFIG)[K] {
  const config = loadConfig();
  return config[section];
}

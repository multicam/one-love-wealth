/**
 * Custom Strategy Manager
 * Manages user-defined custom strategies
 */

import { browser } from '$app/environment';
import type {
  CustomStrategyDefinition,
  CustomStrategyValidation,
  CustomStrategyStorage,
} from './types';

const STORAGE_KEY = 'custom-strategies';
const STORAGE_VERSION = 1;

/**
 * Custom Strategy Manager
 * Handles CRUD operations for custom strategies
 */
export class CustomStrategyManager {
  private strategies: Map<string, CustomStrategyDefinition> = new Map();

  constructor() {
    this.load();
  }

  /**
   * Get all custom strategies
   */
  getAll(): CustomStrategyDefinition[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get custom strategy by ID
   */
  get(id: string): CustomStrategyDefinition | null {
    return this.strategies.get(id) || null;
  }

  /**
   * Check if custom strategy exists
   */
  has(id: string): boolean {
    return this.strategies.has(id);
  }

  /**
   * Create new custom strategy
   */
  create(strategy: Omit<CustomStrategyDefinition, 'createdAt' | 'modifiedAt'>): string {
    const now = Date.now();

    const fullStrategy: CustomStrategyDefinition = {
      ...strategy,
      createdAt: now,
      modifiedAt: now,
    };

    // Validate before saving
    const validation = this.validate(fullStrategy);
    if (!validation.valid) {
      throw new Error(`Invalid strategy: ${validation.errors.join(', ')}`);
    }

    this.strategies.set(fullStrategy.id, fullStrategy);
    this.save();

    return fullStrategy.id;
  }

  /**
   * Update existing custom strategy
   */
  update(id: string, updates: Partial<CustomStrategyDefinition>): void {
    const existing = this.strategies.get(id);
    if (!existing) {
      throw new Error(`Strategy not found: ${id}`);
    }

    const updated: CustomStrategyDefinition = {
      ...existing,
      ...updates,
      id, // Prevent ID change
      createdAt: existing.createdAt, // Preserve created date
      modifiedAt: Date.now(),
    };

    // Validate before saving
    const validation = this.validate(updated);
    if (!validation.valid) {
      throw new Error(`Invalid strategy: ${validation.errors.join(', ')}`);
    }

    this.strategies.set(id, updated);
    this.save();
  }

  /**
   * Delete custom strategy
   */
  delete(id: string): void {
    if (!this.strategies.has(id)) {
      throw new Error(`Strategy not found: ${id}`);
    }

    this.strategies.delete(id);
    this.save();
  }

  /**
   * Validate custom strategy
   */
  validate(strategy: CustomStrategyDefinition): CustomStrategyValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!strategy.id || strategy.id.trim() === '') {
      errors.push('Strategy ID is required');
    }

    if (!strategy.name || strategy.name.trim() === '') {
      errors.push('Strategy name is required');
    }

    if (!strategy.code || strategy.code.trim() === '') {
      errors.push('Strategy code is required');
    }

    if (!strategy.fields || strategy.fields.length === 0) {
      warnings.push('No parameter fields defined');
    }

    // Check ID format (kebab-case)
    if (strategy.id && !/^[a-z0-9-]+$/.test(strategy.id)) {
      errors.push('Strategy ID must be lowercase alphanumeric with hyphens');
    }

    // Check for dangerous code patterns
    const dangerousPatterns = [
      /localStorage/i,
      /sessionStorage/i,
      /fetch\s*\(/i,
      /XMLHttpRequest/i,
      /import\s+/i,
      /require\s*\(/i,
      /eval\s*\(/i,
      /Function\s*\(/i,
      /\.call\s*\(/i,
      /\.apply\s*\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(strategy.code)) {
        warnings.push(`Potentially unsafe code pattern detected: ${pattern.source}`);
      }
    }

    // Check code length
    if (strategy.code.length > 50000) {
      errors.push('Strategy code is too long (max 50KB)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export strategy to JSON
   */
  export(id: string): string {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error(`Strategy not found: ${id}`);
    }

    return JSON.stringify(strategy, null, 2);
  }

  /**
   * Export all strategies to JSON
   */
  exportAll(): string {
    const storage: CustomStrategyStorage = {
      version: STORAGE_VERSION,
      strategies: this.getAll(),
    };

    return JSON.stringify(storage, null, 2);
  }

  /**
   * Import strategy from JSON
   */
  import(json: string): string {
    try {
      const strategy = JSON.parse(json) as CustomStrategyDefinition;

      // Generate new ID if already exists
      let id = strategy.id;
      let counter = 1;
      while (this.strategies.has(id)) {
        id = `${strategy.id}-${counter}`;
        counter++;
      }

      return this.create({
        ...strategy,
        id,
      });
    } catch (error) {
      throw new Error(`Failed to import strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import multiple strategies from JSON
   */
  importAll(json: string): string[] {
    try {
      const storage = JSON.parse(json) as CustomStrategyStorage;

      if (storage.version !== STORAGE_VERSION) {
        throw new Error(`Unsupported version: ${storage.version}`);
      }

      const imported: string[] = [];

      for (const strategy of storage.strategies) {
        try {
          const id = this.import(JSON.stringify(strategy));
          imported.push(id);
        } catch (error) {
          console.error(`Failed to import strategy ${strategy.id}:`, error);
        }
      }

      return imported;
    } catch (error) {
      throw new Error(`Failed to import strategies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load strategies from localStorage
   */
  private load(): void {
    if (!browser) return;

    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return;

      const storage = JSON.parse(json) as CustomStrategyStorage;

      if (storage.version !== STORAGE_VERSION) {
        console.warn(`Unsupported custom strategy version: ${storage.version}`);
        return;
      }

      for (const strategy of storage.strategies) {
        this.strategies.set(strategy.id, strategy);
      }
    } catch (error) {
      console.error('Failed to load custom strategies:', error);
    }
  }

  /**
   * Save strategies to localStorage
   */
  private save(): void {
    if (!browser) return;

    try {
      const storage: CustomStrategyStorage = {
        version: STORAGE_VERSION,
        strategies: this.getAll(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('Failed to save custom strategies:', error);
    }
  }

  /**
   * Clear all custom strategies
   */
  clear(): void {
    this.strategies.clear();
    this.save();
  }
}

/**
 * Global custom strategy manager instance
 */
let managerInstance: CustomStrategyManager | null = null;

/**
 * Get global custom strategy manager
 */
export function getCustomStrategyManager(): CustomStrategyManager {
  if (!managerInstance) {
    managerInstance = new CustomStrategyManager();
  }

  return managerInstance;
}

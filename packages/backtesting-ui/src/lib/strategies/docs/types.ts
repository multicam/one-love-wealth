/**
 * Strategy Documentation Types
 * Types for strategy and field documentation
 */

/**
 * Strategy documentation (parsed from markdown)
 */
export interface StrategyDocs {
  /** Strategy ID */
  id: string;
  /** Short description (1-2 sentences) */
  description: string;
  /** Detailed explanation */
  howItWorks: string;
  /** When to use this strategy */
  whenToUse: string;
  /** Strategy strengths */
  strengths: string[];
  /** Strategy weaknesses */
  weaknesses: string[];
  /** Usage examples */
  examples: string[];
  /** Field-specific help */
  fields: Record<string, FieldDocs>;
  /** Additional notes */
  notes?: string;
  /** Related strategies */
  relatedStrategies?: string[];
}

/**
 * Field documentation
 */
export interface FieldDocs {
  /** Field key */
  key: string;
  /** Short help text */
  help: string;
  /** Tooltip (shorter than help) */
  tooltip?: string;
  /** Detailed explanation */
  description?: string;
  /** Recommended values */
  recommendations?: string[];
  /** Example values with context */
  examples?: Array<{
    value: any;
    label: string;
    description?: string;
  }>;
  /** Common mistakes to avoid */
  warnings?: string[];
}

/**
 * Markdown frontmatter structure
 */
export interface StrategyDocsFrontmatter {
  id: string;
  description: string;
  category?: string;
  tags?: string[];
  relatedStrategies?: string[];
}

/**
 * Parsed markdown document
 */
export interface ParsedMarkdown {
  frontmatter: StrategyDocsFrontmatter;
  content: string;
  sections: Record<string, string>;
}

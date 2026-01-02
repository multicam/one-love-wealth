/**
 * Strategy Documentation Loader
 * Loads and parses markdown documentation files
 */

import type { StrategyDocs, FieldDocs, ParsedMarkdown, StrategyDocsFrontmatter } from './types';

/**
 * Cache for parsed documentation
 */
const docsCache: Map<string, StrategyDocs> = new Map();

/**
 * Load strategy documentation
 * Returns null if docs not found
 */
export async function loadStrategyDocs(strategyId: string): Promise<StrategyDocs | null> {
  // Check cache first
  if (docsCache.has(strategyId)) {
    return docsCache.get(strategyId)!;
  }

  try {
    // Dynamic import of markdown file
    const markdownModule = await import(`./${strategyId}.md?raw`);
    const markdown = markdownModule.default;

    // Parse markdown
    const parsed = parseMarkdown(markdown);

    // Convert to StrategyDocs
    const docs = markdownToStrategyDocs(strategyId, parsed);

    // Cache for future use
    docsCache.set(strategyId, docs);

    return docs;
  } catch (error) {
    console.warn(`Strategy docs not found for: ${strategyId}`, error);
    return null;
  }
}

/**
 * Clear documentation cache
 */
export function clearDocsCache(): void {
  docsCache.clear();
}

/**
 * Parse markdown into structured format
 */
function parseMarkdown(markdown: string): ParsedMarkdown {
  // Extract frontmatter
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch
    ? parseFrontmatter(frontmatterMatch[1])
    : { id: '', description: '' };

  // Remove frontmatter from content
  const content = frontmatterMatch
    ? markdown.slice(frontmatterMatch[0].length).trim()
    : markdown;

  // Parse sections by ## headings
  const sections: Record<string, string> = {};
  const sectionRegex = /^## (.+)$/gm;
  let match;
  let lastIndex = 0;
  let lastHeading = '';

  while ((match = sectionRegex.exec(content)) !== null) {
    if (lastHeading) {
      // Extract content between last heading and this heading
      sections[lastHeading] = content.slice(lastIndex, match.index).trim();
    }
    lastHeading = match[1];
    lastIndex = match.index + match[0].length;
  }

  // Add last section
  if (lastHeading) {
    sections[lastHeading] = content.slice(lastIndex).trim();
  }

  return {
    frontmatter,
    content,
    sections,
  };
}

/**
 * Parse YAML-like frontmatter
 * Simple parser for basic key: value pairs and arrays
 */
function parseFrontmatter(yaml: string): StrategyDocsFrontmatter {
  const result: any = {};

  const lines = yaml.split('\n');
  let currentKey = '';
  let currentArray: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Array item
    if (trimmed.startsWith('- ')) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }

    // Save previous array
    if (currentKey && currentArray.length > 0) {
      result[currentKey] = currentArray;
      currentArray = [];
    }

    // Key: value pair
    const match = trimmed.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim();

      if (value) {
        result[currentKey] = value;
      }
    }
  }

  // Save final array
  if (currentKey && currentArray.length > 0) {
    result[currentKey] = currentArray;
  }

  return result as StrategyDocsFrontmatter;
}

/**
 * Convert parsed markdown to StrategyDocs
 */
function markdownToStrategyDocs(strategyId: string, parsed: ParsedMarkdown): StrategyDocs {
  const { frontmatter, sections } = parsed;

  // Extract standard sections
  const howItWorks = sections['How It Works'] || '';
  const whenToUse = sections['When to Use'] || '';
  const notes = sections['Notes'] || sections['Additional Notes'] || undefined;

  // Parse lists
  const strengths = parseList(sections['Strengths'] || sections['Pros'] || '');
  const weaknesses = parseList(sections['Weaknesses'] || sections['Cons'] || '');
  const examples = parseList(sections['Examples'] || sections['Use Cases'] || '');

  // Parse fields section
  const fields = parseFieldsSection(sections['Parameters'] || sections['Fields'] || '');

  return {
    id: strategyId,
    description: frontmatter.description,
    howItWorks,
    whenToUse,
    strengths,
    weaknesses,
    examples,
    fields,
    notes,
    relatedStrategies: frontmatter.relatedStrategies,
  };
}

/**
 * Parse markdown list into array
 */
function parseList(markdown: string): string[] {
  if (!markdown) return [];

  const items: string[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      items.push(trimmed.slice(2).trim());
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      items.push(trimmed.replace(/^\d+\.\s/, '').trim());
    }
  }

  return items;
}

/**
 * Parse fields section into field docs
 * Expected format:
 * ### fieldKey
 * Help text here
 *
 * **Recommendations:**
 * - Rec 1
 * - Rec 2
 */
function parseFieldsSection(markdown: string): Record<string, FieldDocs> {
  if (!markdown) return {};

  const fields: Record<string, FieldDocs> = {};

  // Split by ### (field-level headings)
  const fieldSections = markdown.split(/^### /gm).filter(Boolean);

  for (const section of fieldSections) {
    const lines = section.split('\n');
    const key = lines[0].trim();

    if (!key) continue;

    // Parse field content
    let help = '';
    let tooltip = '';
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let currentSection = 'help';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Section markers
      if (line.startsWith('**Tooltip:**')) {
        currentSection = 'tooltip';
        continue;
      } else if (line.startsWith('**Recommendations:**') || line.startsWith('**Recommended:**')) {
        currentSection = 'recommendations';
        continue;
      } else if (line.startsWith('**Warnings:**') || line.startsWith('**Caution:**')) {
        currentSection = 'warnings';
        continue;
      }

      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const item = line.slice(2).trim();
        if (currentSection === 'recommendations') {
          recommendations.push(item);
        } else if (currentSection === 'warnings') {
          warnings.push(item);
        }
        continue;
      }

      // Regular text
      if (line) {
        if (currentSection === 'help') {
          help += (help ? ' ' : '') + line;
        } else if (currentSection === 'tooltip') {
          tooltip += (tooltip ? ' ' : '') + line;
        }
      }
    }

    fields[key] = {
      key,
      help: help || `Parameter: ${key}`,
      tooltip: tooltip || undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  return fields;
}

/**
 * Get field help text
 * Returns short help if available, falls back to key name
 */
export function getFieldHelp(docs: StrategyDocs | null, fieldKey: string): string {
  if (!docs || !docs.fields[fieldKey]) {
    return `Configure ${fieldKey}`;
  }

  return docs.fields[fieldKey].help;
}

/**
 * Get field tooltip
 * Returns tooltip if available, falls back to help
 */
export function getFieldTooltip(docs: StrategyDocs | null, fieldKey: string): string | undefined {
  if (!docs || !docs.fields[fieldKey]) {
    return undefined;
  }

  const fieldDocs = docs.fields[fieldKey];
  return fieldDocs.tooltip || fieldDocs.help;
}

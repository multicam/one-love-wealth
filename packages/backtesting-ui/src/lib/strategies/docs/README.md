## Strategy Documentation System

Markdown-based documentation for strategies and parameters with structured frontmatter and sections.

## Architecture

### File Structure

```
lib/strategies/docs/
├── types.ts              # TypeScript interfaces
├── loader.ts             # Markdown parser and loader
├── index.ts              # Module exports
├── README.md             # This file
├── _TEMPLATE.md          # Template for new strategy docs
├── ma-crossover.md       # Strategy documentation files
├── vix-hedge.md
├── buy-and-hold.md
├── rsi-reversion.md
├── bollinger-breakout.md
├── macd-divergence.md
└── pairs-trading.md
```

### Why Markdown?

Markdown documentation provides several benefits:
- **Easy to edit** - No code changes needed for doc updates
- **Rich formatting** - Supports lists, code blocks, emphasis
- **Version control friendly** - Clear diffs in git
- **Translatable** - Easy to create localized versions
- **Searchable** - Text-based, greppable
- **Future-proof** - Can add new sections without code changes

### Document Format

Each strategy has one `.md` file with:

1. **Frontmatter** (YAML between `---` markers)
   - Basic metadata (id, description, category, tags)
   - Related strategies

2. **Sections** (Markdown `## Headings`)
   - How It Works
   - When to Use
   - Strengths / Weaknesses
   - Examples
   - Parameters (field-level docs)
   - Notes

3. **Field Documentation** (within Parameters section)
   - `### fieldKey` for each parameter
   - Help text, tooltip, recommendations, warnings

## Usage

### Loading Documentation

```typescript
import { loadStrategyDocs } from '$lib/strategies/docs';

// Load full documentation for a strategy
const docs = await loadStrategyDocs('ma-crossover');

if (docs) {
  console.log(docs.description);
  console.log(docs.howItWorks);
  console.log(docs.strengths);
  console.log(docs.fields['fastPeriod'].help);
}
```

### In Svelte Components

```svelte
<script lang="ts">
  import { loadStrategyDocs, type StrategyDocs } from '$lib/strategies';

  let strategyId = 'ma-crossover';
  let docs = $state<StrategyDocs | null>(null);

  $effect(() => {
    loadStrategyDocs(strategyId).then(d => docs = d);
  });
</script>

{#if docs}
  <div>
    <h2>{docs.id}</h2>
    <p>{docs.description}</p>

    <h3>Strengths:</h3>
    <ul>
      {#each docs.strengths as strength}
        <li>{strength}</li>
      {/each}
    </ul>
  </div>
{/if}
```

### Field Help Text

```typescript
import { loadStrategyDocs, getFieldHelp, getFieldTooltip } from '$lib/strategies/docs';

const docs = await loadStrategyDocs('ma-crossover');

// Get field help
const help = getFieldHelp(docs, 'fastPeriod');
// "Number of bars for short-term moving average"

// Get field tooltip (shorter)
const tooltip = getFieldTooltip(docs, 'fastPeriod');
// "Lower values = more sensitive to price changes"
```

### Strategy Info Component

```svelte
<script lang="ts">
  import { loadStrategyDocs } from '$lib/strategies';
  import { Button, Modal } from '@one-love-wealth/shared-ui';

  interface Props {
    strategyId: string;
  }

  let { strategyId }: Props = $props();
  let docs = $state(null);
  let showModal = $state(false);

  $effect(() => {
    loadStrategyDocs(strategyId).then(d => docs = d);
  });
</script>

<Button onclick={() => showModal = true} variant="ghost" size="sm">
  {#snippet children()}📖 Learn More{/snippet}
</Button>

{#if docs}
  <Modal bind:open={showModal} title={docs.id} size="lg">
    {#snippet children()}
      <div class="prose prose-invert max-w-none">
        <p class="text-lg">{docs.description}</p>

        <h3>How It Works</h3>
        <p>{docs.howItWorks}</p>

        <h3>Strengths</h3>
        <ul>
          {#each docs.strengths as strength}
            <li>{strength}</li>
          {/each}
        </ul>

        <h3>Weaknesses</h3>
        <ul>
          {#each docs.weaknesses as weakness}
            <li>{weakness}</li>
          {/each}
        </ul>
      </div>
    {/snippet}
  </Modal>
{/if}
```

### Field Tooltip Component

```svelte
<script lang="ts">
  import { loadStrategyDocs } from '$lib/strategies';
  import { Input } from '@one-love-wealth/shared-ui';

  interface Props {
    strategyId: string;
    fieldKey: string;
    value: any;
  }

  let { strategyId, fieldKey, value = $bindable() }: Props = $props();
  let docs = $state(null);

  $effect(() => {
    loadStrategyDocs(strategyId).then(d => docs = d);
  });

  const fieldDocs = $derived(docs?.fields[fieldKey]);
</script>

<div>
  <label class="block text-sm font-medium mb-1">
    {fieldDocs?.key || fieldKey}
  </label>

  <Input bind:value={value} />

  {#if fieldDocs?.tooltip}
    <p class="text-xs text-text-secondary mt-1">
      💡 {fieldDocs.tooltip}
    </p>
  {/if}

  {#if fieldDocs?.recommendations}
    <details class="mt-2 text-sm">
      <summary class="cursor-pointer text-blue-400">Recommendations</summary>
      <ul class="mt-1 ml-4 list-disc">
        {#each fieldDocs.recommendations as rec}
          <li>{rec}</li>
        {/each}
      </ul>
    </details>
  {/if}
</div>
```

## Document Structure

### Frontmatter (Required)

```yaml
---
id: strategy-id-here
description: One or two sentence description
category: trend | momentum | mean-reversion | volatility | multi-symbol
tags:
  - tag1
  - tag2
relatedStrategies:
  - other-strategy-id
  - another-strategy-id
---
```

### Standard Sections

#### How It Works (Required)

Detailed explanation of the strategy logic. Should be 2-3 paragraphs explaining:
- Core mechanism
- Entry/exit logic
- Why it works (theory)

#### When to Use (Required)

Bullet list of ideal market conditions and use cases.

#### Strengths (Required)

Bullet list of advantages:
- What the strategy does well
- When it outperforms
- Unique benefits

#### Weaknesses (Required)

Bullet list of limitations:
- What the strategy struggles with
- When it underperforms
- Known issues

#### Examples (Recommended)

Bullet list of real-world use cases with specific parameters.

#### Parameters (Required)

Field-level documentation. Format:

```markdown
### fieldKey
Brief description of what this parameter does

**Tooltip:** Short one-liner for hover tooltip

**Recommendations:**
- Recommendation 1
- Recommendation 2

**Warnings:**
- Warning 1
- Warning 2
```

#### Notes (Optional)

Additional context:
- Historical performance notes
- Optimization tips
- Common mistakes
- Edge cases

## Creating New Documentation

### Use the Template

Copy `_TEMPLATE.md` to create new strategy docs:

```bash
cp lib/strategies/docs/_TEMPLATE.md lib/strategies/docs/my-strategy.md
```

### Required Steps

1. **Update frontmatter** - Set id, description, category, tags
2. **Write How It Works** - Explain the strategy mechanism
3. **Fill When to Use** - Describe ideal conditions
4. **List Strengths/Weaknesses** - Be honest and specific
5. **Add Examples** - Real-world parameter combinations
6. **Document Parameters** - Every field needs help text
7. **Test loading** - Verify it loads without errors

### Writing Guidelines

**Be Concise:**
- Description: 1-2 sentences
- How It Works: 2-3 paragraphs
- Strengths/Weaknesses: 3-6 items each

**Be Specific:**
- ❌ "Works in trending markets"
- ✅ "Works when asset shows 20+ day uptrend with low volatility"

**Be Helpful:**
- Include parameter recommendations with context
- Warn about common mistakes
- Provide example values

**Be Honest:**
- Don't oversell strengths
- Don't hide weaknesses
- Mention failure modes

## Parser Behavior

### Frontmatter Parsing

- Simple YAML parser
- Supports strings, arrays (with `- ` items)
- Nested objects not supported (keep flat)

### Section Parsing

- Splits on `## Heading` lines
- Section name = heading text
- Section content = everything until next `##`

### List Parsing

- Supports `- `, `* `, and `1. ` prefixes
- Each list item becomes array element
- Nested lists flattened

### Field Parsing

- Uses `### fieldKey` as field identifier
- First paragraph = help text
- **Tooltip:** = tooltip
- **Recommendations:** = list of recommendations
- **Warnings:** = list of warnings

## Performance

### Caching

Parsed documentation is cached in memory:
- First load: parse markdown (~5-10ms)
- Subsequent loads: return cached (<1ms)
- Cache persists for session

### Bundle Size

Markdown files are imported with `?raw` suffix:
- Not included in initial bundle
- Loaded on demand per strategy
- Vite handles dynamic imports

### Clear Cache

```typescript
import { clearDocsCache } from '$lib/strategies/docs';

// Force re-parse all docs
clearDocsCache();
```

## Localization (Future)

To support multiple languages:

1. Create language-specific files:
   ```
   ma-crossover.en.md
   ma-crossover.es.md
   ma-crossover.fr.md
   ```

2. Update loader to check locale:
   ```typescript
   const locale = 'es';
   const markdown = await import(`./${strategyId}.${locale}.md?raw`);
   ```

3. Fall back to English if translation missing

## Maintenance

### Keeping Docs in Sync

When updating strategy code:
1. Check if parameter names changed
2. Update corresponding `.md` file
3. Update parameter recommendations if behavior changed
4. Add notes about significant changes

### Documentation Review

Periodically review docs for:
- Accuracy (still reflects strategy behavior?)
- Clarity (easy to understand?)
- Completeness (all fields documented?)
- Timeliness (examples still relevant?)

### Version History

Use git to track documentation changes:
```bash
git log -- lib/strategies/docs/ma-crossover.md
```

## Troubleshooting

### Docs Not Loading

```typescript
const docs = await loadStrategyDocs('my-strategy');
if (!docs) {
  // File not found or parse error
  // Check console for warnings
}
```

### Parse Errors

- Check frontmatter YAML syntax
- Ensure `---` markers on own lines
- Verify section headings start with `##`
- Check field headings start with `###`

### Missing Fields

If field docs not appearing:
- Ensure using `### fieldKey` format
- Check field key matches registry exactly
- Verify Parameters section exists

## Future Enhancements

- **Markdown rendering** - Convert to HTML for rich display
- **Search index** - Full-text search across all docs
- **Code examples** - Syntax-highlighted parameter examples
- **Interactive demos** - Embedded chart examples
- **A/B testing** - Test different descriptions
- **AI-assisted writing** - Generate initial drafts
- **Validation** - Lint docs for completeness

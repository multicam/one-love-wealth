# MacroView Design System

Centralized design tokens and theming configuration for consistent UI styling.

## Files

| File | Purpose |
|------|---------|
| `design-system.ts` | Main configuration with all token definitions |
| `design-tokens.ts` | Convenience exports for runtime use |
| `chart-defaults.ts` | Chart.js integration with design tokens |
| `themes/dark.ts` | Dark theme (default) |
| `themes/light.ts` | Light theme alternative |

## Usage

### Import Specific Tokens

```typescript
import { colors, typography, components } from '$lib/config/design-tokens';

// Use in component
const bgColor = colors.background.primary;
const cardStyle = components.card.base;
```

### Chart Colors

```typescript
import { chartColors, getSeriesColor } from '$lib/config/chart-defaults';

// Get color for series index
const color = getSeriesColor(0); // '#3b82f6'

// Get array of colors
const palette = getSeriesColors(5);
```

### Component Styles

```svelte
<script>
  import { components } from '$lib/config/design-tokens';
</script>

<div class={components.card.base}>
  <button class={components.button.primary}>Click me</button>
</div>
```

## Color Palette

### Primary (Blue)
Used for primary actions, links, and key UI elements.

### Accent (Indigo)
Used for secondary emphasis and gradients.

### Semantic
- **Success**: `#22c55e` - Positive values, gains
- **Warning**: `#f59e0b` - Caution, alerts
- **Error**: `#ef4444` - Negative values, losses
- **Info**: `#3b82f6` - Informational

### Chart Series
10-color palette optimized for data visualization:
1. Blue (primary)
2. Amber (secondary)
3. Green
4. Red
5. Violet
6. Cyan
7. Pink
8. Lime
9. Orange
10. Teal

## Customization

### Override Tokens

Create `design-system.local.ts` (gitignored) for local customizations:

```typescript
import { designSystem as base } from './design-system';

export const designSystem = {
  ...base,
  colors: {
    ...base.colors,
    primary: {
      ...base.colors.primary,
      500: '#your-brand-color',
    },
  },
};
```

### Theme Switching

```typescript
import { darkTheme } from '$lib/config/themes/dark';
import { lightTheme } from '$lib/config/themes/light';

// Apply theme colors dynamically
const theme = isDark ? darkTheme : lightTheme;
```

## Integration

### Tailwind CSS

The design system extends Tailwind via `layout.css`:

```css
@import 'tailwindcss';

/* Design tokens are applied via Tailwind's default slate palette */
/* Custom tokens can be added as CSS variables if needed */
```

### Chart.js

Import and apply chart defaults:

```typescript
import { chartDefaults } from '$lib/config/chart-defaults';
import { Chart } from 'chart.js';

// Apply globally
Chart.defaults.color = chartDefaults.color;
Chart.defaults.borderColor = chartDefaults.borderColor;
```

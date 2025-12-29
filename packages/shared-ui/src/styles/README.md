# Shared Tailwind CSS Configuration

This directory contains the shared Tailwind CSS configuration used across all packages in the One Love Wealth monorepo.

## Files

- **`theme.css`** - Design tokens (colors, shadows, radii, transitions, z-index)
- **`animations.css`** - Shared keyframe animations
- **`utilities.css`** - Common utility classes
- **`base.css`** - Complete setup including Tailwind, theme, animations, utilities, and base styles
- **`index.css`** - Theme, animations, and utilities without base styles

## Usage

### Full Setup (Recommended)

For most apps, import the base styles in your main CSS file:

```css
@import 'tailwindcss';
@import '@one-love-wealth/shared-ui/styles/theme.css';
@import '@one-love-wealth/shared-ui/styles/animations.css';
@import '@one-love-wealth/shared-ui/styles/utilities.css';
```

### Theme Only

If you want just the design tokens without base styles:

```css
@import 'tailwindcss';
@import '@one-love-wealth/shared-ui/styles/theme.css';
```

## Design Tokens

### Colors

| Token | Description | Value |
|-------|-------------|-------|
| `--color-background` | Main background | `#0a0e17` |
| `--color-surface` | Card/panel background | `#16213e` |
| `--color-surface-light` | Lighter surface | `#1a1f2e` |
| `--color-border` | Border color | `#2d2d44` |
| `--color-text-primary` | Primary text | `#f3f4f6` |
| `--color-text-secondary` | Secondary text | `#94a3b8` |
| `--color-text-muted` | Muted text | `#64748b` |
| `--color-accent` | Primary accent (blue) | `#3b82f6` |
| `--color-success` | Success (green) | `#22c55e` |
| `--color-danger` | Danger (red) | `#ef4444` |
| `--color-warning` | Warning (orange) | `#f59e0b` |
| `--color-bid` | Buy/bid color | `#10b981` |
| `--color-ask` | Sell/ask color | `#ef4444` |

### Usage in CSS

```css
.my-element {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}
```

### Usage in Tailwind Classes

With Tailwind v4's `@theme`, these tokens are available as Tailwind utilities:

```html
<div class="bg-surface text-text-primary border-border">
  Content
</div>
```

## Animations

Available animation keyframes:

- `spin` - Continuous rotation
- `shimmer` - Loading shimmer effect
- `fadeIn` / `fadeOut` - Opacity transitions
- `scaleIn` / `scaleOut` - Scale with opacity
- `slideInUp` / `slideInDown` / `slideInLeft` / `slideInRight` - Directional slides
- `pulse` - Opacity pulse
- `bounce` - Bounce effect

### Utility Classes

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-spin">Spins</div>
<div class="animate-pulse">Pulses</div>
```
